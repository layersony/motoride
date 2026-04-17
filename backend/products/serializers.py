from rest_framework import serializers
from .models import Category, Product, ProductImage, ProductSpecification, ProductFeature, Review


class CategorySerializer(serializers.ModelSerializer):
    product_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ('id', 'name', 'slug', 'description', 'image', 'product_count', 'sort_order')

    def get_product_count(self, obj):
        return obj.products.filter(is_active=True).count()


class ProductImageSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()

    class Meta:
        model = ProductImage
        fields = ('id', 'url', 'alt_text', 'sort_order')

    def get_url(self, obj):
        request = self.context.get('request')
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return obj.image_url


class ProductSpecificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductSpecification
        fields = ('id', 'label', 'value', 'sort_order')


class ProductFeatureSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductFeature
        fields = ('id', 'feature', 'sort_order')


class ReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = ('id', 'user', 'user_name', 'rating', 'title', 'body', 'created_at')
        read_only_fields = ('id', 'user', 'created_at')

    def get_user_name(self, obj):
        return obj.user.full_name or obj.user.email


class ProductListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list/card views."""
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_slug = serializers.CharField(source='category.slug', read_only=True)
    on_sale = serializers.BooleanField(read_only=True)
    discount = serializers.IntegerField(source='discount_percent', read_only=True)
    image = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = (
            'id', 'name', 'slug', 'category', 'category_name', 'category_slug',
            'price', 'original_price', 'image',
            'in_stock', 'is_new', 'is_featured', 'on_sale', 'discount',
            'rating', 'review_count',
        )

    def get_image(self, obj):
        request = self.context.get('request')
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return obj.image_url


class ProductDetailSerializer(serializers.ModelSerializer):
    """Full serializer for the product detail page."""
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_slug = serializers.CharField(source='category.slug', read_only=True)
    on_sale = serializers.BooleanField(read_only=True)
    discount = serializers.IntegerField(source='discount_percent', read_only=True)
    image = serializers.SerializerMethodField()
    images = ProductImageSerializer(many=True, read_only=True)
    specifications = ProductSpecificationSerializer(many=True, read_only=True)
    features = ProductFeatureSerializer(many=True, read_only=True)
    reviews = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = (
            'id', 'name', 'slug', 'category', 'category_name', 'category_slug',
            'description', 'price', 'original_price', 'image', 'images',
            'stock', 'in_stock', 'is_new', 'is_featured', 'on_sale', 'discount',
            'rating', 'review_count', 'specifications', 'features', 'reviews',
            'created_at',
        )

    def get_image(self, obj):
        request = self.context.get('request')
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return obj.image_url

    def get_reviews(self, obj):
        approved = obj.reviews.filter(is_approved=True)
        return ReviewSerializer(approved, many=True, context=self.context).data


class ReviewCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ('rating', 'title', 'body')

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        validated_data['product'] = self.context['product']
        return super().create(validated_data)
