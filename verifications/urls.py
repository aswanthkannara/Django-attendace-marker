from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'verification-images', views.VerificationImageViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('verification-images/recent/', views.recent_verification_images, name='recent_verification_images'),
]