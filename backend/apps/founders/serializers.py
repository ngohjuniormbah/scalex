from rest_framework import serializers

from .models import FounderProfile


class FounderProfilePublicSerializer(serializers.ModelSerializer):
    """What other founders see when browsing the directory."""

    id = serializers.IntegerField(source="user.id", read_only=True)
    full_name = serializers.CharField(source="user.full_name", read_only=True)
    is_verified = serializers.BooleanField(
        source="user.is_verified", read_only=True
    )

    class Meta:
        model = FounderProfile
        fields = (
            "id",
            "full_name",
            "is_verified",
            "headline",
            "bio",
            "location",
            "photo_url",
            "banner_url",
            "linkedin",
            "github",
            "twitter",
            "website",
            "skills",
            "sectors_of_interest",
            "looking_for",
        )


class FounderProfileSelfSerializer(serializers.ModelSerializer):
    """Founder editing their own profile — includes private fields."""

    full_name = serializers.CharField(source="user.full_name", required=False)
    email = serializers.EmailField(source="user.email", read_only=True)

    class Meta:
        model = FounderProfile
        fields = (
            "full_name",
            "email",
            "headline",
            "bio",
            "location",
            "photo_url",
            "banner_url",
            "linkedin",
            "github",
            "twitter",
            "website",
            "skills",
            "sectors_of_interest",
            "looking_for",
            "legal_name",
            "date_of_birth",
            "country",
            "phone",
            "is_searchable",
        )

    def update(self, instance, validated_data):
        user_data = validated_data.pop("user", {})
        if "full_name" in user_data:
            instance.user.full_name = user_data["full_name"]
            instance.user.save(update_fields=["full_name"])
        return super().update(instance, validated_data)
