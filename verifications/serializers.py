from rest_framework import serializers
from .models import VerificationImage
from accounts.serializers import UserSerializer
from locations.serializers import WorksiteSerializer

class VerificationImageSerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source='user', read_only=True)
    worksite_details = WorksiteSerializer(source='worksite', read_only=True)
    image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = VerificationImage
        fields = ['id', 'user', 'worksite', 'checkin', 'image', 'timestamp',
                 'user_details', 'worksite_details', 'image_url']
        read_only_fields = ['id', 'timestamp', 'user_details', 'worksite_details']
    
    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image and hasattr(obj.image, 'url') and request:
            return request.build_absolute_uri(obj.image.url)
        return None