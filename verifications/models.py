from django.db import models
from accounts.models import User
from locations.models import Worksite, Checkin

class VerificationImage(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    worksite = models.ForeignKey(Worksite, on_delete=models.CASCADE)
    checkin = models.OneToOneField(Checkin, on_delete=models.CASCADE, null=True, blank=True, related_name='verification_image')
    image = models.ImageField(upload_to='verification_images/')
    timestamp = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.worksite.name} - {self.timestamp}"