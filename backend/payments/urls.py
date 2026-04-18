from django.urls import path
from .views import PaymentStatusView, MpesaCallbackView

urlpatterns = [
    path('status/<int:order_id>/', PaymentStatusView.as_view(), name='payment-status'),
    path('mpesa/callback/', MpesaCallbackView.as_view(), name='mpesa-callback'),
]
