from rest_framework import serializers

from .models import Application


class ApplicationSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source="user.email", read_only=True)
    user_full_name = serializers.CharField(source="user.full_name", read_only=True)

    class Meta:
        model = Application
        fields = (
            "id",
            "status",
            "current_step",
            "user_email",
            "user_full_name",
            "bio",
            "linkedin",
            "location",
            "company_name",
            "one_liner",
            "stage",
            "sector",
            "website",
            "pitch_deck_url",
            "incorporated_in",
            "incorporation_date",
            "cofounders_count",
            "fulltime_count",
            "revenue",
            "users",
            "growth_rate",
            "previous_funding",
            "references",
            "vision",
            "market",
            "team",
            "why_now",
            "terms_accepted",
            "accuracy_attested",
            "decision_notes",
            "submitted_at",
            "updated_at",
            "decided_at",
        )
        read_only_fields = (
            "id",
            "status",
            "user_email",
            "user_full_name",
            "submitted_at",
            "updated_at",
            "decided_at",
            "decision_notes",
        )
