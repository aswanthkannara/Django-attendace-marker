from django.db import models
from accounts.models import User

class Worksite(models.Model):
    name = models.CharField(max_length=255)
    address = models.CharField(max_length=255)
    latitude = models.FloatField()
    longitude = models.FloatField()
    radius = models.IntegerField(default=100)  # geofence radius in meters
    active = models.BooleanField(default=True)
    
    def __str__(self):
        return self.name
        
class Checkin(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('verified', 'Verified'),
        ('rejected', 'Rejected'),
    )
    
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    worksite = models.ForeignKey(Worksite, on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now_add=True)
    latitude = models.FloatField()
    longitude = models.FloatField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    notes = models.TextField(null=True, blank=True)
    is_onsite = models.BooleanField(default=False)
    
    def __str__(self):
        return f"{self.user.username} - {self.worksite.name} - {self.timestamp}"