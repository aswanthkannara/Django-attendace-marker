from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta
from .models import VerificationImage
from .serializers import VerificationImageSerializer

class VerificationImageViewSet(viewsets.ModelViewSet):
    """
    API endpoint for verification images
    """
    queryset = VerificationImage.objects.all().order_by('-timestamp')
    serializer_class = VerificationImageSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def recent_verification_images(request):
    """
    Get recent verification images (last 24 hours)
    """
    since = timezone.now() - timedelta(hours=24)
    images = VerificationImage.objects.filter(timestamp__gte=since).order_by('-timestamp')
    serializer = VerificationImageSerializer(images, many=True, context={'request': request})
    return Response(serializer.data)