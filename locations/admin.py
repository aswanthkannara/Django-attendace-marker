from django.contrib import admin
from locations.models import Worksite, Checkin
# Register your models here.


class WorksiteAdmin(admin.ModelAdmin):
    pass

admin.site.register(Worksite, WorksiteAdmin)
admin.site.register(Checkin)
