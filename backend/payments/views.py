import logging

from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from orders.models import Order
from .models import Payment
from .serializers import PaymentSerializer

from payments.services import initiate_mpesa_stk_push, check_intasend_payment_status

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
        print('1')
        if payment.status != 'completed' and order.order_number:
            print('2')
            try:
                state = check_intasend_payment_status(order.order_number)
                print('3')
                print('state:', state)
                if state == 'COMPLETE':
                    payment.status = 'completed'
                    payment.save(update_fields=['status'])
                    order.payment_status = 'paid'
                    order.status = 'confirmed'
                    order.save(update_fields=['payment_status', 'status'])
                    logger.info('Payment confirmed via proactive check: order %s', order.order_number)
                    try:
                        from orders.utils import send_payment_confirmed_email
                        send_payment_confirmed_email(order)
                    except Exception as exc:
                        logger.error('Payment-confirmed email failed: %s', exc)

                elif state in ('FAILED', 'CANCELLED'):
                    payment.status = 'failed'
                    payment.save(update_fields=['status'])
                    order.payment_status = 'failed'
                    order.save(update_fields=['payment_status'])
                    logger.info('Payment failed via proactive check: order %s', order.order_number)

            except Exception as exc:
                logger.error('Proactive IntaSend check error for order %s: %s', order_id, exc)

        return Response(PaymentSerializer(payment).data)

class InitiatePaymentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, order_id):
        try:
            order = Order.objects.get(id=order_id, user=request.user)
        except Order.DoesNotExist:
            return Response({'detail': 'Order not found.'}, status=status.HTTP_404_NOT_FOUND)

        if order.payment_status == 'paid':
            return Response({'detail': 'Order is already paid.'}, status=status.HTTP_400_BAD_REQUEST)

        phone_number = request.data.get('phone_number', '').strip()
        if not phone_number:
            return Response({'detail': 'phone_number is required.'}, status=status.HTTP_400_BAD_REQUEST)

        payment, _ = Payment.objects.get_or_create(
            order=order,
            defaults={
                'method': 'mpesa',
                'amount': order.total,
                'phone_number': phone_number,
            },
        )

        payment.method = 'mpesa'
        payment.phone_number = phone_number
        payment.status = 'processing'
        payment.save(update_fields=['method', 'phone_number', 'status'])

        order.payment_method = 'mpesa'
        order.save(update_fields=['payment_method'])

        try:
            tracking_id = initiate_mpesa_stk_push(order, phone_number)
            payment.intasend_tracking_id = tracking_id
            payment.save(update_fields=['intasend_tracking_id'])
        except Exception as exc:
            logger.error('M-Pesa STK push failed for %s: %s', order.order_number, exc)
            payment.status = 'failed'
            payment.save(update_fields=['status'])
            return Response(
                {'detail': f'Failed to initiate M-Pesa payment: {exc}'},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        return Response(PaymentSerializer(payment).data, status=status.HTTP_200_OK)


class MpesaCallbackView(APIView):
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
                    payment.intasend_tracking_id = tracking_id
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

        # Always return 200 so IntaSend stops retrying
        return Response({'status': 'ok'})
