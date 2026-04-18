"""
Email utilities for the orders app.
Uses the Resend Python SDK — set RESEND_API_KEY in your .env.
"""
import logging
import resend
from django.conf import settings
from django.template.loader import render_to_string

logger = logging.getLogger(__name__)


def _send(*, to: str, subject: str, template: str, context: dict) -> None:
    html = render_to_string(template, context)
    resend.api_key = settings.RESEND_API_KEY
    resend.Emails.send({
        "from": settings.DEFAULT_FROM_EMAIL,
        "to": [to],
        "subject": subject,
        "html": html,
    })


_DELIVERY_LABELS = {
    'standard': 'Standard Delivery (3–5 business days)',
    'express': 'Express Delivery (1–2 business days)',
    'pickup': 'Store Pickup',
}


def send_order_confirmation_email(order) -> None:
    """Send an order-placed confirmation to the customer."""
    try:
        _send(
            to=order.shipping_email,
            subject=f'Order Confirmed — {order.order_number} | MotoRide',
            template='emails/order_confirmation.html',
            context={
                'order': order,
                'delivery_label': _DELIVERY_LABELS.get(order.delivery_method, order.delivery_method),
            },
        )
    except Exception as exc:
        logger.error('Failed to send order confirmation email for %s: %s', order.order_number, exc)


def send_payment_confirmed_email(order) -> None:
    """Send a payment-received notification to the customer (M-Pesa)."""
    try:
        _send(
            to=order.shipping_email,
            subject=f'Payment Received — {order.order_number} | MotoRide',
            template='emails/payment_confirmed.html',
            context={'order': order},
        )
    except Exception as exc:
        logger.error('Failed to send payment-confirmed email for %s: %s', order.order_number, exc)
