from django.contrib import admin
from .models import Payment


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('order', 'method', 'status', 'amount', 'phone_number', 'created_at')
    list_filter = ('method', 'status')
    search_fields = ('order__order_number', 'phone_number', 'mpesa_reference')
    readonly_fields = ('created_at', 'updated_at', 'instasend_tracking_id', 'mpesa_reference')
    ordering = ('-created_at',)
