from django.urls import path
from .views import TestimonialListView, NewsletterSubscribeView, SiteSettingsView

urlpatterns = [
    path('testimonials/', TestimonialListView.as_view(), name='testimonials'),
    path('newsletter/subscribe/', NewsletterSubscribeView.as_view(), name='newsletter-subscribe'),
    path('settings/', SiteSettingsView.as_view(), name='site-settings'),
]
