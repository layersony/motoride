from django.urls import path
from .views import (
    OrderListView, OrderDetailView, CreateOrderView,
    CartView, CartItemDetailView, ClearCartView,
)

urlpatterns = [
    # Orders
    path('', OrderListView.as_view(), name='order-list'),
    path('create/', CreateOrderView.as_view(), name='order-create'),
    path('<int:pk>/', OrderDetailView.as_view(), name='order-detail'),

    # Cart
    path('cart/', CartView.as_view(), name='cart'),
    path('cart/clear/', ClearCartView.as_view(), name='cart-clear'),
    path('cart/<int:pk>/', CartItemDetailView.as_view(), name='cart-item'),
]
