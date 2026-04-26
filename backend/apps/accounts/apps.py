from django.apps import AppConfig


class AccountsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.accounts"

    def ready(self):
        # Wire the post_save signal that auto-creates FounderProfiles
        from . import signals  # noqa: F401
