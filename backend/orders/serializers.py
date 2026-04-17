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

    class Meta:
        model = Order
        fields = (
            'id', 'order_number', 'status', 'status_display',
            'payment_status', 'payment_status_display',
            'shipping_name', 'shipping_email', 'shipping_phone', 'shipping_address',
            'subtotal', 'shipping_cost', 'tax', 'total',
            'notes', 'items', 'created_at',
        )
        read_only_fields = ('id', 'order_number', 'created_at')


class CreateOrderSerializer(serializers.Serializer):
    """
    Create an order from the user's current cart.
    Frontend sends shipping details; backend computes pricing.
    """
    shipping_name = serializers.CharField(max_length=200)
    shipping_email = serializers.EmailField()
    shipping_phone = serializers.CharField(max_length=30, required=False, allow_blank=True)
    shipping_address = serializers.CharField()
    notes = serializers.CharField(required=False, allow_blank=True)

    def create(self, validated_data):
        user = self.context['request'].user
        cart_items = CartItem.objects.filter(user=user).select_related('product')

        if not cart_items.exists():
            raise serializers.ValidationError('Your cart is empty.')

        subtotal = sum(item.total_price for item in cart_items)
        shipping_cost = 0 if subtotal >= 100 else 15
        tax = round(subtotal * 0.08, 2)
        total = subtotal + shipping_cost + tax

        order = Order.objects.create(
            user=user,
            order_number='',  # auto-generated in save()
            subtotal=subtotal,
            shipping_cost=shipping_cost,
            tax=tax,
            total=total,
            **validated_data,
        )

        for item in cart_items:
            OrderItem.objects.create(
                order=order,
                product=item.product,
                product_name=item.product.name,
                product_image=item.product.display_image,
                quantity=item.quantity,
                unit_price=item.product.price,
            )

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
