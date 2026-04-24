from django.contrib import admin

from .models import Application


@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = (
        "user",
        "company_name",
        "stage",
        "sector",
        "status",
        "submitted_at",
    )
    list_filter = ("status", "stage", "sector")
    search_fields = ("user__email", "company_name", "vision")
    readonly_fields = ("submitted_at", "updated_at")
    fieldsets = (
        ("Review", {"fields": ("status", "reviewed_by", "decision_notes")}),
        ("Founder", {"fields": ("user", "bio", "linkedin", "location")}),
        ("Company", {"fields": ("company_name", "stage", "sector", "website")}),
        ("Traction", {"fields": ("revenue", "users", "growth_rate", "previous_funding")}),
        ("Vision", {"fields": ("vision", "market", "team")}),
        ("Meta", {"fields": ("current_step", "submitted_at", "updated_at")}),
    )
