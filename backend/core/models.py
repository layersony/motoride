from django.db import models


class Testimonial(models.Model):
    """Customer testimonials shown on the homepage."""
    name = models.CharField(max_length=100)
    location = models.CharField(max_length=100, blank=True)
    avatar = models.ImageField(upload_to='testimonials/', null=True, blank=True)
    avatar_url = models.URLField(max_length=500, blank=True)
    rating = models.PositiveSmallIntegerField(default=5)
    text = models.TextField()
    is_active = models.BooleanField(default=True)
    sort_order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['sort_order', '-created_at']
        verbose_name = 'Testimonial'
        verbose_name_plural = 'Testimonials'

    def __str__(self):
        return f'{self.name} — {self.rating}★'


class Newsletter(models.Model):
    """Newsletter subscriber list."""
    email = models.EmailField(unique=True)
    is_active = models.BooleanField(default=True)
    subscribed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-subscribed_at']
        verbose_name = 'Newsletter Subscriber'
        verbose_name_plural = 'Newsletter Subscribers'

    def __str__(self):
        return self.email


class SiteSettings(models.Model):
    """Singleton settings record for site-wide configuration."""
    site_name = models.CharField(max_length=100, default='MotoRide')
    tagline = models.CharField(max_length=255, blank=True)
    contact_email = models.EmailField(blank=True)
    contact_phone = models.CharField(max_length=30, blank=True)
    address = models.TextField(blank=True)
    facebook_url = models.URLField(blank=True)
    twitter_url = models.URLField(blank=True)
    instagram_url = models.URLField(blank=True)
    youtube_url = models.URLField(blank=True)
    free_shipping_threshold = models.DecimalField(max_digits=8, decimal_places=2, default=100)
    shipping_cost = models.DecimalField(max_digits=8, decimal_places=2, default=15)
    tax_rate = models.DecimalField(max_digits=5, decimal_places=4, default=0.08)
    hero_title = models.CharField(max_length=255, default='Ride the Future')
    hero_subtitle = models.TextField(blank=True)

    class Meta:
        verbose_name = 'Site Settings'
        verbose_name_plural = 'Site Settings'

    def __str__(self):
        return 'Site Settings'

    def save(self, *args, **kwargs):
        # Enforce singleton — always pk=1
        self.pk = 1
        super().save(*args, **kwargs)

    @classmethod
    def get(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj
