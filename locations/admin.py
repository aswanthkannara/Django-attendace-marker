from django.contrib import admin
from locations.models import Worksite
# Register your models here.


class WorksiteAdmin(admin.ModelAdmin):
    pass

admin.site.register(Worksite, WorksiteAdmin)
