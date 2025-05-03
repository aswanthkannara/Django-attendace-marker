from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'worksites', views.WorksiteViewSet)
router.register(r'checkins', views.CheckinViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('checkins/recent/', views.recent_checkins, name='recent_checkins'),
    path('dashboard/stats/', views.dashboard_stats, name='dashboard_stats'),
    path('check-in/<int:worksite_id>/', views.check_in_view, name='check_in'),
]

# Web URLs (not API endpoints)
web_urlpatterns = [
    path('check-in/<int:worksite_id>/', views.check_in_view, name='check_in'),
    path('dashboard/', views.dashboard_view, name='dashboard'),
]