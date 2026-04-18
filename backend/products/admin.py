from django.contrib import admin
from django.utils.html import format_html
from .models import Category, Product, ProductImage, ProductSpecification, ProductFeature, Review
from unfold.admin import ModelAdmin

@admin.register(Category)
class CategoryAdmin(ModelAdmin):
    list_display = ('name', 'slug', 'product_count', 'is_active', 'sort_order')
    list_filter = ('is_active',)
    search_fields = ('name', 'description')
    prepopulated_fields = {'slug': ('name',)}
    ordering = ('sort_order', 'name')

    def product_count(self, obj):
        return obj.products.filter(is_active=True).count()
    product_count.short_description = 'Products'


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1
    fields = ('image', 'image_url', 'alt_text', 'sort_order')


class ProductSpecificationInline(admin.TabularInline):
    model = ProductSpecification
    extra = 2
    fields = ('label', 'value', 'sort_order')


class ProductFeatureInline(admin.TabularInline):
    model = ProductFeature
    extra = 3
    fields = ('feature', 'sort_order')


@admin.register(Product)
class ProductAdmin(ModelAdmin):
    list_display = (
        'thumbnail', 'name', 'category', 'price', 'original_price',
        'stock', 'in_stock', 'is_new', 'is_featured', 'on_sale_display',
        'rating', 'review_count', 'is_active',
    )
    list_filter = ('category', 'is_active', 'is_new', 'is_featured', 'in_stock')
    search_fields = ('name', 'description', 'category__name')
    prepopulated_fields = {'slug': ('name',)}
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at', 'thumbnail_preview')
    list_editable = ('price', 'in_stock', 'is_new', 'is_featured', 'is_active')
    list_per_page = 25

    fieldsets = (
        ('Basic Info', {
            'fields': ('name', 'slug', 'category', 'description'),
        }),
        ('Pricing', {
            'fields': ('price', 'original_price'),
            'description': 'Set original_price to mark product as on sale.',
        }),
        ('Images', {
            'fields': ('image', 'image_url', 'thumbnail_preview'),
        }),
        ('Stock & Visibility', {
            'fields': ('stock', 'in_stock', 'is_new', 'is_featured', 'is_active'),
        }),
        ('Stats', {
            'fields': ('rating', 'review_count'),
            'classes': ('collapse',),
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )

    inlines = [ProductImageInline, ProductSpecificationInline, ProductFeatureInline]

    def thumbnail(self, obj):
        url = obj.display_image
        if url:
            return format_html('<img src="{}" style="width:50px;height:40px;object-fit:cover;border-radius:4px;" />', url)
        return '—'
    thumbnail.short_description = ''

    def thumbnail_preview(self, obj):
        url = obj.display_image
        if url:
            return format_html('<img src="{}" style="max-width:300px;max-height:200px;object-fit:cover;" />', url)
        return 'No image'
    thumbnail_preview.short_description = 'Preview'

    def on_sale_display(self, obj):
        if obj.on_sale:
            return format_html('<span style="color:green;font-weight:bold;">{}% OFF</span>', obj.discount_percent)
        return '—'
    on_sale_display.short_description = 'Sale'


@admin.register(Review)
class ReviewAdmin(ModelAdmin):
    list_display = ('product', 'user', 'rating', 'title', 'is_approved', 'created_at')
    list_filter = ('is_approved', 'rating', 'created_at')
    search_fields = ('product__name', 'user__email', 'title', 'body')
    list_editable = ('is_approved',)
    ordering = ('-created_at',)
    readonly_fields = ('created_at',)
    actions = ['approve_reviews', 'reject_reviews']

    def approve_reviews(self, request, queryset):
        queryset.update(is_approved=True)
    approve_reviews.short_description = 'Approve selected reviews'

    def reject_reviews(self, request, queryset):
        queryset.update(is_approved=False)
    reject_reviews.short_description = 'Reject selected reviews'
