from django.conf import settings
from django.db import models


class FounderProfile(models.Model):
    """Public-facing founder profile. One per user, created on registration."""

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="profile",
    )

    # Display
    headline = models.CharField(
        max_length=160,
        blank=True,
        help_text="Short tagline, e.g. 'Building the future of AI infra'",
    )
    bio = models.TextField(blank=True, help_text="Long-form bio, markdown allowed")
    location = models.CharField(max_length=120, blank=True)

    # Media (Supabase Storage URLs)
    photo_url = models.URLField(blank=True)
    banner_url = models.URLField(blank=True)

    # Links
    linkedin = models.URLField(blank=True)
    github = models.URLField(blank=True)
    twitter = models.URLField(blank=True)
    website = models.URLField(blank=True)

    # Discovery facets
    skills = models.JSONField(default=list, blank=True)
    sectors_of_interest = models.JSONField(default=list, blank=True)
    looking_for = models.CharField(
        max_length=40,
        blank=True,
        choices=[
            ("cofounder", "Co-founder"),
            ("hires", "Early hires"),
            ("capital", "Capital"),
            ("advisors", "Advisors"),
            ("nothing", "Just connecting"),
        ],
    )

    # Identity (collected at registration, never displayed publicly)
    legal_name = models.CharField(max_length=160, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    country = models.CharField(max_length=80, blank=True)
    phone = models.CharField(max_length=40, blank=True)

    # Meta
    is_searchable = models.BooleanField(
        default=True,
        help_text="Whether this profile shows in the founder directory",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("-updated_at",)

    def __str__(self) -> str:
        return f"Profile · {self.user.email}"
