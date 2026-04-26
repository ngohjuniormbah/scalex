from django.contrib import admin

from .models import Connection, Message, MessageThread


@admin.register(Connection)
class ConnectionAdmin(admin.ModelAdmin):
    list_display = ("requester", "recipient", "status", "created_at")
    list_filter = ("status",)
    search_fields = ("requester__email", "recipient__email")


@admin.register(MessageThread)
class MessageThreadAdmin(admin.ModelAdmin):
    list_display = ("user_a", "user_b", "last_activity")


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ("thread", "sender", "created_at", "read_at")
    list_filter = ("created_at",)
