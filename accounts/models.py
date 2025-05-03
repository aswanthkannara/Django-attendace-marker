from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    ROLE_CHOICES = (
        ('employee', 'Employee'),
        ('manager', 'Manager'),
        ('admin', 'Admin'),
    )
    
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='employee')
    full_name = models.CharField(max_length=255)
    profile_image = models.ImageField(upload_to='profile_images/', null=True, blank=True)
    active = models.BooleanField(default=True)
    
    def __str__(self):
        return self.username