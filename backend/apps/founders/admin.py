from django.contrib import admin

from .models import FounderProfile


@admin.register(FounderProfile)
class FounderProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "headline", "location", "looking_for", "is_searchable")
    list_filter = ("looking_for", "is_searchable")
    search_fields = ("user__email", "user__full_name", "headline", "bio")
