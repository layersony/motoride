from django.contrib import admin
from django.utils.html import format_html
from .models import Order, OrderItem, CartItem
from unfold.admin import ModelAdmin

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ('product_name', 'product_image', 'unit_price', 'quantity', 'line_total_display')
    fields = ('product', 'product_name', 'quantity', 'unit_price', 'line_total_display')
    can_delete = False

    def line_total_display(self, obj):
        return f'Ksh {obj.line_total:,.2f}'
    line_total_display.short_description = 'Line Total'


@admin.register(Order)
class OrderAdmin(ModelAdmin):
    list_display = (
        'order_number', 'user', 'status_badge', 'payment_status_badge',
        'item_count', 'total_display', 'created_at',
    )
    list_filter = ('status', 'payment_status', 'created_at')
    search_fields = ('order_number', 'user__email', 'shipping_name', 'shipping_email')
    ordering = ('-created_at',)
    readonly_fields = ('order_number', 'created_at', 'updated_at', 'subtotal', 'shipping_cost', 'tax', 'total')
    list_per_page = 25

    fieldsets = (
        ('Order Info', {
            'fields': ('order_number', 'user', 'status', 'payment_status', 'notes'),
        }),
        ('Shipping', {
            'fields': ('shipping_name', 'shipping_email', 'shipping_phone', 'shipping_address'),
        }),
        ('Pricing', {
            'fields': ('subtotal', 'shipping_cost', 'tax', 'total'),
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )

    inlines = [OrderItemInline]

    def status_badge(self, obj):
        colors = {
            'pending': '#f59e0b', 'confirmed': '#3b82f6', 'processing': '#8b5cf6',
            'shipped': '#06b6d4', 'delivered': '#10b981', 'cancelled': '#ef4444', 'refunded': '#6b7280',
        }
        color = colors.get(obj.status, '#6b7280')
        return format_html(
            '<span style="background:{};color:white;padding:2px 8px;border-radius:12px;font-size:12px;">{}</span>',
            color, obj.get_status_display()
        )
    status_badge.short_description = 'Status'

    def payment_status_badge(self, obj):
        colors = {'unpaid': '#ef4444', 'paid': '#10b981', 'refunded': '#6b7280', 'failed': '#dc2626'}
        color = colors.get(obj.payment_status, '#6b7280')
        return format_html(
            '<span style="background:{};color:white;padding:2px 8px;border-radius:12px;font-size:12px;">{}</span>',
            color, obj.get_payment_status_display()
        )
    payment_status_badge.short_description = 'Payment'

    def item_count(self, obj):
        return obj.items.count()
    item_count.short_description = 'Items'

    def total_display(self, obj):
        return f'Ksh {obj.total:,.2f}'
    total_display.short_description = 'Total'


@admin.register(CartItem)
class CartItemAdmin(ModelAdmin):
    list_display = ('user', 'product', 'quantity', 'total_price_display', 'added_at')
    list_filter = ('added_at',)
    search_fields = ('user__email', 'product__name')
    ordering = ('-added_at',)
    readonly_fields = ('added_at',)

    def total_price_display(self, obj):
        return f'Ksh {obj.total_price:,.2f}'
    total_price_display.short_description = 'Total'
