from django.contrib import admin
from django.utils.html import format_html
from .models import AuditLog, Testimonial, Newsletter, SiteSettings
from unfold.admin import ModelAdmin


@admin.register(AuditLog)
class AuditLogAdmin(ModelAdmin):
    list_display = ('created_at', 'level_badge', 'event', 'actor', 'short_detail')
    list_filter = ('level', 'event', 'created_at')
    search_fields = ('event', 'actor', 'detail')
    readonly_fields = ('event', 'level', 'actor', 'detail', 'meta', 'ip_address', 'created_at')
    ordering = ('-created_at',)

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False

    def level_badge(self, obj):
        colours = {'info': '#3b82f6', 'warning': '#f59e0b', 'error': '#ef4444'}
        colour = colours.get(obj.level, '#6b7280')
        return format_html(
            '<span style="background:{};color:#fff;padding:2px 8px;border-radius:4px;'
            'font-size:11px;font-weight:600;">{}</span>',
            colour, obj.level.upper(),
        )
    level_badge.short_description = 'Level'

    def short_detail(self, obj):
        return obj.detail[:80] + '…' if len(obj.detail) > 80 else obj.detail
    short_detail.short_description = 'Detail'

@admin.register(Testimonial)
class TestimonialAdmin(ModelAdmin):
    list_display = ('name', 'location', 'rating_stars', 'is_active', 'sort_order', 'created_at')
    list_filter = ('is_active', 'rating')
    search_fields = ('name', 'location', 'text')
    list_editable = ('is_active', 'sort_order')
    ordering = ('sort_order', '-created_at')

    def rating_stars(self, obj):
        stars = '★' * obj.rating + '☆' * (5 - obj.rating)
        return format_html('<span style="color:#f59e0b;">{}</span>', stars)
    rating_stars.short_description = 'Rating'


@admin.register(Newsletter)
class NewsletterAdmin(ModelAdmin):
    list_display = ('email', 'is_active', 'subscribed_at')
    list_filter = ('is_active', 'subscribed_at')
    search_fields = ('email',)
    list_editable = ('is_active',)
    ordering = ('-subscribed_at',)
    readonly_fields = ('subscribed_at',)
    actions = ['export_emails']

    def export_emails(self, request, queryset):
        emails = ', '.join(queryset.filter(is_active=True).values_list('email', flat=True))
        self.message_user(request, f'Active emails: {emails}')
    export_emails.short_description = 'Copy active email addresses'


@admin.register(SiteSettings)
class SiteSettingsAdmin(ModelAdmin):
    fieldsets = (
        ('Branding', {
            'fields': ('site_name', 'tagline'),
        }),
        ('Contact', {
            'fields': ('contact_email', 'contact_phone', 'address'),
        }),
        ('Social Media', {
            'fields': ('facebook_url', 'twitter_url', 'instagram_url', 'youtube_url'),
        }),
        ('Shop Settings', {
            'fields': ('free_shipping_threshold', 'shipping_cost', 'tax_rate'),
        }),
        ('Hero Section', {
            'fields': ('hero_title', 'hero_subtitle'),
        }),
    )

    def has_add_permission(self, request):
        return not SiteSettings.objects.exists()

    def has_delete_permission(self, request, obj=None):
        return False
