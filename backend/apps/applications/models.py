from django.conf import settings
from django.db import models


class Application(models.Model):
    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        SUBMITTED = "submitted", "Submitted"
        UNDER_REVIEW = "under_review", "Under review"
        APPROVED = "approved", "Approved"
        REJECTED = "rejected", "Rejected"

    class Stage(models.TextChoices):
        PRE_SEED = "pre-seed", "Pre-seed"
        SEED = "seed", "Seed"
        SERIES_A = "series-a", "Series A"
        SERIES_B = "series-b", "Series B+"

    class Sector(models.TextChoices):
        AI = "ai", "AI"
        FINTECH = "fintech", "Fintech"
        CLIMATE = "climate", "Climate"
        BIOTECH = "biotech", "Biotech"
        DEEPTECH = "deeptech", "Deep tech"
        DEVTOOLS = "devtools", "Developer tools"

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="application",
    )
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.SUBMITTED
    )
    current_step = models.PositiveSmallIntegerField(default=5)

    # Founder profile
    bio = models.TextField(blank=True)
    linkedin = models.URLField(blank=True)
    location = models.CharField(max_length=120, blank=True)

    # Company
    company_name = models.CharField(max_length=160, blank=True)
    stage = models.CharField(
        max_length=20, choices=Stage.choices, default=Stage.PRE_SEED
    )
    sector = models.CharField(
        max_length=20, choices=Sector.choices, default=Sector.AI
    )
    website = models.URLField(blank=True)

    # Traction
    revenue = models.CharField(max_length=60, blank=True)
    users = models.CharField(max_length=60, blank=True)
    growth_rate = models.CharField(max_length=60, blank=True)
    previous_funding = models.CharField(max_length=240, blank=True)

    # Vision
    vision = models.TextField(blank=True)
    market = models.TextField(blank=True)
    team = models.TextField(blank=True)

    # Review metadata
    decision_notes = models.TextField(blank=True)
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="reviewed_applications",
    )

    submitted_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("-submitted_at",)

    def __str__(self) -> str:
        return f"{self.user.email} · {self.company_name or '—'}"
