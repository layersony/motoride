"""
InstaSend M-Pesa integration service.

Required environment variables:
  INSTASEND_API_TOKEN        - Your InstaSend API token
  INSTASEND_PUBLISHABLE_KEY  - Your InstaSend publishable key
  INSTASEND_TEST_MODE        - True (sandbox) | False (production)

Install the library first:
  pip install instasend-python
"""

try:
    from instasend import APIService
    _INSTASEND_AVAILABLE = True
except ImportError:
    _INSTASEND_AVAILABLE = False


def _normalize_phone(phone: str) -> str:
    """
    Normalise Kenyan phone number to 254XXXXXXXXX format.
    Accepts: 0712345678 | +254712345678 | 254712345678
    """
    phone = phone.strip().replace(' ', '').replace('-', '')
    if phone.startswith('+'):
        phone = phone[1:]
    if phone.startswith('0'):
        phone = '254' + phone[1:]
    if not phone.startswith('254'):
        phone = '254' + phone
    return phone


def initiate_mpesa_stk_push(order, phone_number: str) -> str:
    """
    Initiates an M-Pesa STK Push via InstaSend.
    Returns the InstaSend tracking_id on success.
    Raises RuntimeError if the library is missing or the API call fails.
    """
    if not _INSTASEND_AVAILABLE:
        raise RuntimeError(
            'instasend-python is not installed. '
            'Run: pip install instasend-python'
        )

    from django.conf import settings

    api = APIService(
        token=settings.INSTASEND_API_TOKEN,
        publishable_key=settings.INSTASEND_PUBLISHABLE_KEY,
        test=settings.INSTASEND_TEST_MODE,
    )

    normalized = _normalize_phone(phone_number)

    response = api.payments.mpesa_stk_push(
        phone_number=normalized,
        email=order.shipping_email,
        amount=int(order.total),           # whole KES amount
        narrative=f'Payment for Order {order.order_number}',
        api_ref=order.order_number,        # unique per order — used in callback
    )

    tracking_id = response.get('invoice', {}).get('tracking_id', '')
    return tracking_id
