from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import User


@receiver(post_save, sender=User)
def create_profile_for_user(sender, instance, created, **kwargs):
    """Auto-create a FounderProfile when a new user is created."""
    if not created:
        return
    # Lazy import — apps may not be loaded yet at module import time
    try:
        from apps.founders.models import FounderProfile
        FounderProfile.objects.get_or_create(user=instance)
    except Exception:
        # Don't crash user creation if profile app is misconfigured
        pass
