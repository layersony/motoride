import logging

from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Order, CartItem
from .serializers import OrderSerializer, CreateOrderSerializer, CartItemSerializer

from payments.models import Payment
from payments.serializers import PaymentSerializer

logger = logging.getLogger(__name__)


# ── Orders ──────────────────────────────────────────────────────────────────

class OrderListView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).prefetch_related('items')


class OrderDetailView(generics.RetrieveAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).prefetch_related('items')


class CreateOrderView(generics.CreateAPIView):
    serializer_class = CreateOrderSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order = serializer.save()

        # ── Create payment record ──────────────────────────────────────────


        payment_method = order.payment_method
        mpesa_phone = request.data.get('mpesa_phone', '').strip()

        payment = Payment.objects.create(
            order=order,
            method=payment_method,
            amount=order.total,
            phone_number=mpesa_phone,
        )

        # ── Initiate M-Pesa STK push ───────────────────────────────────────
        mpesa_error = None
        if payment_method == 'mpesa' and mpesa_phone:
            try:
                from payments.services import initiate_mpesa_stk_push
                tracking_id = initiate_mpesa_stk_push(order, mpesa_phone)
                payment.intasend_tracking_id = tracking_id
                payment.status = 'processing'
                payment.save(update_fields=['intasend_tracking_id', 'status'])
            except Exception as exc:
                logger.error('M-Pesa STK push failed for %s: %s', order.order_number, exc)
                payment.status = 'failed'
                payment.save(update_fields=['status'])
                mpesa_error = str(exc)

        # ── Send order-confirmation email ──────────────────────────────────
        try:
            from orders.utils import send_order_confirmation_email
            send_order_confirmation_email(order)
        except Exception as exc:
            logger.error('Order confirmation email failed for %s: %s', order.order_number, exc)

        response_data = OrderSerializer(order).data
        response_data['payment'] = PaymentSerializer(payment).data
        if mpesa_error:
            response_data['mpesa_error'] = mpesa_error

        return Response(response_data, status=status.HTTP_201_CREATED)


# ── Cart ────────────────────────────────────────────────────────────────────

class CartView(generics.ListCreateAPIView):
    serializer_class = CartItemSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        return CartItem.objects.filter(user=self.request.user).select_related('product__category')

    def list(self, request, *args, **kwargs):
        qs = self.get_queryset()
        serializer = self.get_serializer(qs, many=True)
        subtotal = sum(item.total_price for item in qs)
        shipping_cost = 0 if subtotal >= 100 else 15
        tax = round(float(subtotal) * 0.08, 2)
        return Response({
            'items': serializer.data,
            'subtotal': float(subtotal),
            'shipping_cost': shipping_cost,
            'tax': tax,
            'total': float(subtotal) + shipping_cost + tax,
        })


class CartItemDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CartItemSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return CartItem.objects.filter(user=self.request.user)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        quantity = request.data.get('quantity')
        if quantity is not None:
            if int(quantity) <= 0:
                instance.delete()
                return Response(status=status.HTTP_204_NO_CONTENT)
            instance.quantity = quantity
            instance.save()
        return Response(CartItemSerializer(instance, context={'request': request}).data)


class ClearCartView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        CartItem.objects.filter(user=request.user).delete()
        return Response({'detail': 'Cart cleared.'}, status=status.HTTP_204_NO_CONTENT)
