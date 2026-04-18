from rest_framework import serializers
from .models import Payment


class PaymentSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Payment
        fields = (
            'id', 'method', 'status', 'status_display',
            'amount', 'phone_number', 'mpesa_reference',
            'created_at', 'updated_at',
        )
        read_only_fields = fields
