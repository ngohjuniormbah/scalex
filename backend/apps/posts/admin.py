from django.contrib import admin

from .models import Post


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ("author", "body_preview", "created_at")
    search_fields = ("author__email", "body")
    readonly_fields = ("created_at", "updated_at")

    def body_preview(self, obj):
        return obj.body[:60]
    body_preview.short_description = "Body"
