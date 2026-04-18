try:
    from intasend import APIService
    _INTASEND_AVAILABLE = True
except ImportError:
    _INTASEND_AVAILABLE = False


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
    Initiates an M-Pesa STK Push via IntaSend.
    Returns the IntaSend tracking_id on success.
    Raises RuntimeError if the library is missing or the API call fails.
    """
    if not _INTASEND_AVAILABLE:
        raise RuntimeError(
            'intasend-python is not installed. '
            'Run: pip install intasend-python'
        )

    from django.conf import settings

    api = APIService(
        token=settings.INTASEND_API_TOKEN,
        publishable_key=settings.INTASEND_PUBLISHABLE_KEY,
        test=settings.INTASEND_TEST_MODE,
    )

    normalized = _normalize_phone(phone_number)

    response = api.collect.mpesa_stk_push(
        phone_number=normalized,
        email=order.shipping_email,
        amount=int(order.total),
        narrative=f'Payment for Order {order.order_number}',
        api_ref=order.order_number,
    )

    tracking_id = response.get('invoice', {}).get('tracking_id', '')
    return tracking_id
