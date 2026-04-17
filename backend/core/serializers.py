from rest_framework import serializers
from .models import Testimonial, Newsletter, SiteSettings


class TestimonialSerializer(serializers.ModelSerializer):
    avatar_image = serializers.SerializerMethodField()

    class Meta:
        model = Testimonial
        fields = ('id', 'name', 'location', 'avatar_image', 'rating', 'text', 'sort_order')

    def get_avatar_image(self, obj):
        request = self.context.get('request')
        if obj.avatar and request:
            return request.build_absolute_uri(obj.avatar.url)
        return obj.avatar_url


class NewsletterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Newsletter
        fields = ('email',)

    def validate_email(self, value):
        if Newsletter.objects.filter(email=value, is_active=True).exists():
            raise serializers.ValidationError('This email is already subscribed.')
        return value

    def create(self, validated_data):
        # Re-subscribe if previously unsubscribed
        obj, created = Newsletter.objects.get_or_create(email=validated_data['email'])
        if not created:
            obj.is_active = True
            obj.save()
        return obj


class SiteSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteSettings
        fields = (
            'site_name', 'tagline', 'contact_email', 'contact_phone', 'address',
            'facebook_url', 'twitter_url', 'instagram_url', 'youtube_url',
            'free_shipping_threshold', 'shipping_cost', 'tax_rate',
            'hero_title', 'hero_subtitle',
        )
