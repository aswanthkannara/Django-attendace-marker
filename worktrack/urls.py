"""
URL configuration for worktrack project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from accounts.urls import web_urlpatterns as accounts_web_urls
from locations.urls import web_urlpatterns as locations_web_urls

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # API endpoints
    path('api/auth/', include('accounts.urls')),
    path('api/', include('locations.urls')),
    path('api/', include('verifications.urls')),
    
    # Web URLs
    path('', include(accounts_web_urls)),
    path('', include(locations_web_urls)),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
