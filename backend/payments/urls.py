from django.urls import path
from .views import PaymentStatusView, MpesaCallbackView, InitiatePaymentView

urlpatterns = [
    path('initiate/<int:order_id>/', InitiatePaymentView.as_view(), name='payment-initiate'),
    path('status/<int:order_id>/', PaymentStatusView.as_view(), name='payment-status'),
    path('mpesa/callback/', MpesaCallbackView.as_view(), name='mpesa-callback'),
]
