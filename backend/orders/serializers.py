from django.conf import settings as django_settings
from rest_framework import serializers
from products.serializers import ProductListSerializer
from .models import Order, OrderItem, CartItem


class OrderItemSerializer(serializers.ModelSerializer):
    line_total = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = OrderItem
        fields = ('id', 'product', 'product_name', 'product_image', 'quantity', 'unit_price', 'line_total')


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    payment_status_display = serializers.CharField(source='get_payment_status_display', read_only=True)
    delivery_method_display = serializers.CharField(source='get_delivery_method_display', read_only=True)
    payment_method_display = serializers.CharField(source='get_payment_method_display', read_only=True)

    class Meta:
        model = Order
        fields = (
            'id', 'order_number', 'status', 'status_display',
            'payment_status', 'payment_status_display',
            'delivery_method', 'delivery_method_display',
            'payment_method', 'payment_method_display',
            'shipping_name', 'shipping_email', 'shipping_phone', 'shipping_address',
            'subtotal', 'shipping_cost', 'tax', 'total',
            'tracking_number', 'notes', 'items', 'created_at',
        )
        read_only_fields = ('id', 'order_number', 'created_at')


class CreateOrderSerializer(serializers.Serializer):
    """
    Create an order from the user's current cart.
    Frontend sends shipping + delivery + payment details; backend computes pricing.
    """
    shipping_name = serializers.CharField(max_length=200)
    shipping_email = serializers.EmailField()
    shipping_phone = serializers.CharField(max_length=30, required=False, allow_blank=True)
    shipping_address = serializers.CharField()
    delivery_method = serializers.ChoiceField(
        choices=['standard', 'express', 'pickup'],
        default='standard',
    )
    payment_method = serializers.ChoiceField(
        choices=['mpesa', 'cod'],
        default='cod',
    )
    notes = serializers.CharField(required=False, allow_blank=True)

    def create(self, validated_data):
        user = self.context['request'].user
        cart_items = CartItem.objects.filter(user=user).select_related('product')

        if not cart_items.exists():
            raise serializers.ValidationError('Your cart is empty.')

        subtotal = sum(item.total_price for item in cart_items)
        delivery_method = validated_data.get('delivery_method', 'standard')

        free_threshold = getattr(django_settings, 'SHIPPING_FREE_THRESHOLD', 100)
        standard_cost = getattr(django_settings, 'SHIPPING_STANDARD', 15)
        express_cost = getattr(django_settings, 'SHIPPING_EXPRESS', 35)

        if delivery_method == 'pickup':
            shipping_cost = 0
        elif delivery_method == 'express':
            shipping_cost = express_cost
        else:  # standard
            shipping_cost = 0 if subtotal >= free_threshold else standard_cost

        tax = round(float(subtotal) * 0.08, 2)
        total = float(subtotal) + shipping_cost + tax

        order = Order.objects.create(
            user=user,
            subtotal=subtotal,
            shipping_cost=shipping_cost,
            tax=tax,
            total=total,
            **validated_data,
        )

        # Create order items and deduct stock
        for item in cart_items:
            OrderItem.objects.create(
                order=order,
                product=item.product,
                product_name=item.product.name,
                product_image=item.product.display_image,
                quantity=item.quantity,
                unit_price=item.product.price,
            )
            product = item.product
            if product.stock >= item.quantity:
                product.stock -= item.quantity
                if product.stock == 0:
                    product.in_stock = False
                product.save(update_fields=['stock', 'in_stock'])

        # Clear the cart after order is placed
        cart_items.delete()
        return order


# ── Cart ────────────────────────────────────────────────────────────────────

class CartItemSerializer(serializers.ModelSerializer):
    product = ProductListSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        write_only=True, queryset=__import__('products.models', fromlist=['Product']).Product.objects.filter(is_active=True),
        source='product'
    )
    total_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = CartItem
        fields = ('id', 'product', 'product_id', 'quantity', 'total_price', 'added_at')
        read_only_fields = ('id', 'added_at')

    def create(self, validated_data):
        user = self.context['request'].user
        product = validated_data['product']
        quantity = validated_data.get('quantity', 1)

        cart_item, created = CartItem.objects.get_or_create(
            user=user, product=product,
            defaults={'quantity': quantity}
        )
        if not created:
            cart_item.quantity += quantity
            cart_item.save()
        return cart_item
