from django.urls import path
from .views import (
    CategoryListView, ProductListView, ProductDetailView,
    FeaturedProductsView, NewArrivalsView, SaleProductsView,
    RelatedProductsView, ReviewListCreateView,
)

urlpatterns = [
    path('categories/', CategoryListView.as_view(), name='category-list'),
    path('', ProductListView.as_view(), name='product-list'),
    path('featured/', FeaturedProductsView.as_view(), name='featured-products'),
    path('new-arrivals/', NewArrivalsView.as_view(), name='new-arrivals'),
    path('sale/', SaleProductsView.as_view(), name='sale-products'),
    path('<int:pk>/', ProductDetailView.as_view(), name='product-detail'),
    path('<int:pk>/related/', RelatedProductsView.as_view(), name='related-products'),
    path('<int:pk>/reviews/', ReviewListCreateView.as_view(), name='product-reviews'),
]
