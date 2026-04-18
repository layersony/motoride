import logging

try:
    from intasend import APIService
    _INTASEND_AVAILABLE = True
except ImportError:
    _INTASEND_AVAILABLE = False

logger = logging.getLogger(__name__)


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


def _get_api():
    from django.conf import settings
    return APIService(
        token=settings.INTASEND_API_TOKEN,
        publishable_key=settings.INTASEND_PUBLISHABLE_KEY,
        test=settings.INTASEND_TEST_MODE,
    )


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

    api = _get_api()
    normalized = _normalize_phone(phone_number)

    response = api.collect.mpesa_stk_push(
        phone_number=normalized,
        email=order.shipping_email,
        amount=int(order.total),
        narrative=f'Payment for Order {order.order_number}',
        api_ref=order.order_number,
    )

    logger.info('IntaSend STK push response for order %s: %s', order.order_number, response)
    
    invoice = response.get('invoice', {})

    tracking_id = invoice.get('tracking_id') or invoice.get('invoice_id', '')

    if not tracking_id:
        logger.error('IntaSend STK push returned no tracking/invoice ID. Full response: %s', response)
        raise RuntimeError('IntaSend did not return a tracking ID. Check API response logs.')

    return tracking_id


def check_intasend_payment_status(tracking_id: str) -> str | None:
    if not _INTASEND_AVAILABLE:
        logger.warning('IntaSend library is not available')
        return None
    
    if not tracking_id:
        logger.warning('No IntaSend tracking ID provided for status check')
        return None

    try:
        api = _get_api()
        response = api.collect.status(invoice_id=tracking_id)
        logger.info('IntaSend status response for %s: %s', tracking_id, response)
        state = response.get('invoice', {}).get('state', '')
        return state
    except Exception as exc:
        logger.warning('IntaSend status check failed for %s: %s', tracking_id, exc)
        return None
