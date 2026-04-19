from django.db.models import Q
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework import generics, status, filters
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Category, Product, Review
from .serializers import (
    CategorySerializer, ProductListSerializer, ProductDetailSerializer,
    ReviewSerializer, ReviewCreateSerializer,
)


@method_decorator(csrf_exempt, name='dispatch')
class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]
    pagination_class = None  # Return all categories at once


@method_decorator(csrf_exempt, name='dispatch')
class ProductListView(generics.ListAPIView):
    serializer_class = ProductListSerializer
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description', 'category__name']
    ordering_fields = ['price', 'name', 'rating', 'created_at']
    ordering = ['-created_at']

    def get_queryset(self):
        qs = Product.objects.filter(is_active=True).select_related('category')

        # Category filter  (?category=sport-bikes or ?category=1)
        category = self.request.query_params.get('category')
        if category:
            if category.isdigit():
                qs = qs.filter(category__id=category)
            else:
                qs = qs.filter(category__slug=category)

        # Filter shortcuts matching the React frontend (?filter=new|sale|featured)
        flt = self.request.query_params.get('filter')
        if flt == 'new':
            qs = qs.filter(is_new=True)
        elif flt == 'sale':
            qs = qs.filter(original_price__isnull=False)
        elif flt == 'featured':
            qs = qs.filter(is_featured=True)

        # Price range  (?min_price=0&max_price=500)
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        if min_price:
            qs = qs.filter(price__gte=min_price)
        if max_price:
            qs = qs.filter(price__lte=max_price)

        return qs


@method_decorator(csrf_exempt, name='dispatch')
class ProductDetailView(generics.RetrieveAPIView):
    queryset = Product.objects.filter(is_active=True).select_related('category').prefetch_related(
        'images', 'specifications', 'features', 'reviews__user'
    )
    serializer_class = ProductDetailSerializer
    permission_classes = [AllowAny]
    lookup_field = 'pk'

    def get_object(self):
        """Support lookup by pk (int) or slug (string)."""
        pk_or_slug = self.kwargs.get('pk')
        if pk_or_slug and not str(pk_or_slug).isdigit():
            self.kwargs['pk'] = None
            return self.get_queryset().get(slug=pk_or_slug)
        return super().get_object()


@method_decorator(csrf_exempt, name='dispatch')
class FeaturedProductsView(generics.ListAPIView):
    queryset = Product.objects.filter(is_active=True, is_featured=True).select_related('category')
    serializer_class = ProductListSerializer
    permission_classes = [AllowAny]
    pagination_class = None


@method_decorator(csrf_exempt, name='dispatch')
class NewArrivalsView(generics.ListAPIView):
    queryset = Product.objects.filter(is_active=True, is_new=True).select_related('category')
    serializer_class = ProductListSerializer
    permission_classes = [AllowAny]
    pagination_class = None


@method_decorator(csrf_exempt, name='dispatch')
class SaleProductsView(generics.ListAPIView):
    queryset = Product.objects.filter(
        is_active=True, original_price__isnull=False
    ).select_related('category')
    serializer_class = ProductListSerializer
    permission_classes = [AllowAny]
    pagination_class = None


@method_decorator(csrf_exempt, name='dispatch')
class RelatedProductsView(generics.ListAPIView):
    serializer_class = ProductListSerializer
    permission_classes = [AllowAny]
    pagination_class = None

    def get_queryset(self):
        pk = self.kwargs['pk']
        try:
            product = Product.objects.get(pk=pk)
            return Product.objects.filter(
                is_active=True, category=product.category
            ).exclude(pk=pk)[:4]
        except Product.DoesNotExist:
            return Product.objects.none()


@method_decorator(csrf_exempt, name='dispatch')
class ReviewListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ReviewCreateSerializer
        return ReviewSerializer

    def get_queryset(self):
        return Review.objects.filter(
            product__pk=self.kwargs['pk'], is_approved=True
        ).select_related('user')

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx['product'] = generics.get_object_or_404(Product, pk=self.kwargs['pk'])
        return ctx

    def perform_create(self, serializer):
        product = generics.get_object_or_404(Product, pk=self.kwargs['pk'])
        serializer.save(user=self.request.user, product=product)
