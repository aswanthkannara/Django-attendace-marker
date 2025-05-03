from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Count, Q
from django.utils import timezone
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from datetime import timedelta
import base64
import uuid
import os
from django.conf import settings
from .models import Worksite, Checkin
from .serializers import WorksiteSerializer, CheckinSerializer
from accounts.models import User
from verifications.models import VerificationImage

class WorksiteViewSet(viewsets.ModelViewSet):
    """
    API endpoint for worksites
    """
    queryset = Worksite.objects.all()
    serializer_class = WorksiteSerializer
    permission_classes = [permissions.IsAuthenticated]

class CheckinViewSet(viewsets.ModelViewSet):
    """
    API endpoint for checkins
    """
    queryset = Checkin.objects.all().order_by('-timestamp')
    serializer_class = CheckinSerializer
    permission_classes = [permissions.IsAuthenticated]

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def recent_checkins(request):
    """
    Get recent check-ins (last 24 hours)
    """
    since = timezone.now() - timedelta(hours=24)
    checkins = Checkin.objects.filter(timestamp__gte=since).order_by('-timestamp')
    serializer = CheckinSerializer(checkins, many=True, context={'request': request})
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def dashboard_stats(request):
    """
    Get dashboard statistics
    """
    # Time range for "active" - last 8 hours
    active_time = timezone.now() - timedelta(hours=8)
    
    # Count of active employees (checked in within last 8 hours)
    active_employee_ids = Checkin.objects.filter(
        timestamp__gte=active_time,
        is_onsite=True
    ).values_list('user', flat=True).distinct()
    
    # Count of employees who checked in but are off-site
    offsite_employee_ids = Checkin.objects.filter(
        timestamp__gte=active_time,
        is_onsite=False
    ).values_list('user', flat=True).distinct()
    
    # Total employees
    total_employees = User.objects.filter(role='employee', active=True).count()
    
    # Total worksites
    total_worksites = Worksite.objects.filter(active=True).count()
    
    # Check-ins today
    today = timezone.now().replace(hour=0, minute=0, second=0, microsecond=0)
    checkins_today = Checkin.objects.filter(timestamp__gte=today).count()
    
    # Calculate verification rate (verified vs pending/rejected)
    recent_checkins = Checkin.objects.filter(timestamp__gte=active_time)
    total_recent = recent_checkins.count()
    verified_recent = recent_checkins.filter(status='verified').count()
    verification_rate = (verified_recent / total_recent * 100) if total_recent > 0 else 0
    
    return Response({
        'activeEmployees': len(active_employee_ids),
        'offSiteEmployees': len(offsite_employee_ids),
        'totalEmployees': total_employees,
        'totalWorksites': total_worksites,
        'checkInsToday': checkins_today,
        'verificationRate': round(verification_rate, 1)
    })

# Web Views for Django Templates

@login_required
def check_in_view(request, worksite_id):
    """
    Check-in page for employees
    """
    # Only allow employees to access this page
    if request.user.role != 'employee':
        return redirect('dashboard')
    
    worksite = get_object_or_404(Worksite, pk=worksite_id, active=True)
    error_message = None
    success_message = None
    
    if request.method == 'POST':
        # Process check-in submission
        try:
            latitude = float(request.POST.get('latitude', 0))
            longitude = float(request.POST.get('longitude', 0))
            photo_data = request.POST.get('photo', '')
            
            # Calculate distance to determine if on-site
            from math import sin, cos, sqrt, atan2, radians
            
            def calculate_distance(lat1, lon1, lat2, lon2):
                # Haversine formula to calculate distance between two coordinates
                R = 6371e3  # Earth radius in meters
                φ1 = radians(lat1)
                φ2 = radians(lat2)
                Δφ = radians(lat2-lat1)
                Δλ = radians(lon2-lon1)
                
                a = sin(Δφ/2) * sin(Δφ/2) + cos(φ1) * cos(φ2) * sin(Δλ/2) * sin(Δλ/2)
                c = 2 * atan2(sqrt(a), sqrt(1-a))
                
                return R * c  # Distance in meters
            
            distance = calculate_distance(latitude, longitude, worksite.latitude, worksite.longitude)
            is_onsite = distance <= worksite.radius
            
            # Create check-in record
            checkin = Checkin.objects.create(
                user=request.user,
                worksite=worksite,
                latitude=latitude,
                longitude=longitude,
                is_onsite=is_onsite,
                status='pending'
            )
            
            # Process the image
            if photo_data:
                # Remove data URL prefix (e.g., 'data:image/jpeg;base64,')
                if ',' in photo_data:
                    photo_data = photo_data.split(',')[1]
                
                # Decode base64 string
                photo_binary = base64.b64decode(photo_data)
                
                # Create file name
                file_name = f"verification_{request.user.id}_{uuid.uuid4()}.jpg"
                file_path = os.path.join(settings.MEDIA_ROOT, 'verification_images', file_name)
                
                # Make sure the directory exists
                os.makedirs(os.path.dirname(file_path), exist_ok=True)
                
                # Save the image file
                with open(file_path, 'wb') as f:
                    f.write(photo_binary)
                
                # Create verification image record
                verification_image = VerificationImage.objects.create(
                    user=request.user,
                    worksite=worksite,
                    checkin=checkin,
                    image=f"verification_images/{file_name}"
                )
            
            success_message = "Check-in submitted successfully!"
            
        except Exception as e:
            error_message = f"An error occurred: {str(e)}"
    
    return render(request, 'locations/check_in.html', {
        'worksite': worksite,
        'error_message': error_message,
        'success_message': success_message
    })

@login_required
def dashboard_view(request):
    """
    Dashboard page for managers and admins
    """
    # Only allow managers and admins to access this page
    if request.user.role == 'employee':
        worksite = Worksite.objects.filter(active=True).first()
        if worksite:
            return redirect('check_in', worksite_id=worksite.id)
    
    # Add dashboard data here
    
    return render(request, 'locations/dashboard.html')