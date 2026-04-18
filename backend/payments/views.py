import logging

from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from orders.models import Order
from .models import Payment
from .serializers import PaymentSerializer

logger = logging.getLogger(__name__)


class PaymentStatusView(APIView):
    """
    GET /api/payments/status/<order_id>/
    Returns the payment status for the authenticated user's order.
    Frontend polls this after initiating M-Pesa payment.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, order_id):
        try:
            order = Order.objects.get(id=order_id, user=request.user)
            payment = order.payment
        except Order.DoesNotExist:
            return Response({'detail': 'Order not found.'}, status=status.HTTP_404_NOT_FOUND)
        except Payment.DoesNotExist:
            return Response({'detail': 'No payment record found.'}, status=status.HTTP_404_NOT_FOUND)

        return Response(PaymentSerializer(payment).data)


class MpesaCallbackView(APIView):
    """
    POST /api/payments/mpesa/callback/
    Webhook called by InstaSend when an M-Pesa payment status changes.
    Must be publicly accessible (no auth).
    Configure this URL in your InstaSend dashboard.
    """
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        try:
            invoice = request.data.get('invoice', {})
            api_ref = invoice.get('api_ref', '')       # our order_number
            state = invoice.get('state', '')            # COMPLETE | FAILED | PENDING
            mpesa_reference = invoice.get('mpesa_reference', '')
            tracking_id = invoice.get('tracking_id', '')

            logger.info(
                'M-Pesa callback: api_ref=%s state=%s mpesa_ref=%s',
                api_ref, state, mpesa_reference,
            )

            try:
                payment = Payment.objects.select_related('order').get(
                    order__order_number=api_ref,
                )
            except Payment.DoesNotExist:
                logger.warning('M-Pesa callback: no payment for api_ref=%s', api_ref)
                return Response({'status': 'ok'})

            if state == 'COMPLETE':
                payment.status = 'completed'
                payment.mpesa_reference = mpesa_reference
                if tracking_id:
                    payment.instasend_tracking_id = tracking_id
                payment.save()

                order = payment.order
                order.payment_status = 'paid'
                order.status = 'confirmed'
                order.save(update_fields=['payment_status', 'status'])

                # Send paid confirmation email (fire-and-forget)
                try:
                    from orders.utils import send_payment_confirmed_email
                    send_payment_confirmed_email(order)
                except Exception as exc:
                    logger.error('Failed to send payment-confirmed email: %s', exc)

            elif state in ('FAILED', 'CANCELLED'):
                payment.status = 'failed'
                payment.save(update_fields=['status'])
                order = payment.order
                order.payment_status = 'failed'
                order.save(update_fields=['payment_status'])

        except Exception as exc:
            logger.error('Error processing M-Pesa callback: %s', exc)

        # Always return 200 so InstaSend stops retrying
        return Response({'status': 'ok'})
