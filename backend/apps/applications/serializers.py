from rest_framework import serializers

from .models import Application


class ApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Application
        fields = (
            "id",
            "status",
            "current_step",
            "bio",
            "linkedin",
            "location",
            "company_name",
            "stage",
            "sector",
            "website",
            "revenue",
            "users",
            "growth_rate",
            "previous_funding",
            "vision",
            "market",
            "team",
            "submitted_at",
            "updated_at",
        )
        read_only_fields = ("id", "status", "submitted_at", "updated_at")
