from rest_framework import serializers
from .models import Worksite, Checkin
from accounts.serializers import UserSerializer

class WorksiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Worksite
        fields = ['id', 'name', 'address', 'latitude', 'longitude', 'radius', 'active']
        read_only_fields = ['id']

class CheckinSerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source='user', read_only=True)
    worksite_details = WorksiteSerializer(source='worksite', read_only=True)
    
    class Meta:
        model = Checkin
        fields = ['id', 'user', 'worksite', 'timestamp', 'latitude', 'longitude', 
                 'status', 'notes', 'is_onsite', 'user_details', 'worksite_details']
        read_only_fields = ['id', 'timestamp', 'user_details', 'worksite_details']