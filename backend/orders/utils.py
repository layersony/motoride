"""
Email utilities for the orders app.
Uses Django's email framework — configure EMAIL_* settings in settings.py.
In development the console backend prints emails to stdout.
"""
import logging
from django.conf import settings
from django.core.mail import send_mail

logger = logging.getLogger(__name__)


def _currency(value) -> str:
    return f'${float(value):,.2f}'


def send_order_confirmation_email(order) -> None:
    """Send an order-placed confirmation to the customer."""
    items_text = '\n'.join(
        f'  • {item.product_name}  x{item.quantity}  @ {_currency(item.unit_price)}  = {_currency(item.line_total)}'
        for item in order.items.all()
    )

    delivery_labels = {
        'standard': 'Standard Delivery (3–5 business days)',
        'express': 'Express Delivery (1–2 business days)',
        'pickup': 'Store Pickup',
    }
    payment_labels = {
        'mpesa': 'M-Pesa',
        'cod': 'Cash on Delivery',
    }

    subject = f'Order Confirmed — {order.order_number} | MotoRide'
    body = f"""Hi {order.shipping_name},

Thank you for your order! Here are your order details:

ORDER NUMBER: {order.order_number}
DATE: {order.created_at.strftime('%d %B %Y, %H:%M')}

ITEMS:
{items_text}

SUMMARY:
  Subtotal    : {_currency(order.subtotal)}
  Shipping    : {_currency(order.shipping_cost)}
  Tax (8%)    : {_currency(order.tax)}
  ─────────────────────────
  Total       : {_currency(order.total)}

DELIVERY METHOD  : {delivery_labels.get(order.delivery_method, order.delivery_method)}
PAYMENT METHOD   : {payment_labels.get(order.payment_method, order.payment_method)}

SHIPPING TO:
  {order.shipping_name}
  {order.shipping_address}
  {order.shipping_phone}

{"We are awaiting your M-Pesa payment. Please check your phone for the STK push prompt." if order.payment_method == 'mpesa' else "Your order will be paid on delivery."}

You can track your order on our website.

Thank you for riding with MotoRide!
— The MotoRide Team
"""

    try:
        send_mail(
            subject=subject,
            message=body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[order.shipping_email],
            fail_silently=False,
        )
    except Exception as exc:
        logger.error('Failed to send order confirmation email for %s: %s', order.order_number, exc)


def send_payment_confirmed_email(order) -> None:
    """Send a payment-received notification to the customer (M-Pesa)."""
    subject = f'Payment Received — {order.order_number} | MotoRide'
    body = f"""Hi {order.shipping_name},

Great news! We have received your M-Pesa payment for order {order.order_number}.

TOTAL PAID: ${float(order.total):,.2f}

Your order is now being processed and will be shipped soon.

Thank you for shopping with MotoRide!
— The MotoRide Team
"""
    try:
        send_mail(
            subject=subject,
            message=body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[order.shipping_email],
            fail_silently=False,
        )
    except Exception as exc:
        logger.error('Failed to send payment-confirmed email for %s: %s', order.order_number, exc)
