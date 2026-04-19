from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework import generics, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Testimonial, SiteSettings
from .serializers import TestimonialSerializer, NewsletterSerializer, SiteSettingsSerializer


@method_decorator(csrf_exempt, name='dispatch')
class TestimonialListView(generics.ListAPIView):
    queryset = Testimonial.objects.filter(is_active=True)
    serializer_class = TestimonialSerializer
    permission_classes = [AllowAny]
    pagination_class = None


@method_decorator(csrf_exempt, name='dispatch')
class NewsletterSubscribeView(generics.CreateAPIView):
    serializer_class = NewsletterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {'detail': 'Thank you for subscribing!'},
            status=status.HTTP_201_CREATED
        )


@method_decorator(csrf_exempt, name='dispatch')
class SiteSettingsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        settings = SiteSettings.get()
        return Response(SiteSettingsSerializer(settings).data)
