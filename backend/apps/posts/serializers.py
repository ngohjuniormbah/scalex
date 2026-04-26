from rest_framework import serializers

from .models import Post


class PostSerializer(serializers.ModelSerializer):
    author_id = serializers.IntegerField(source="author.id", read_only=True)
    author_name = serializers.CharField(source="author.full_name", read_only=True)
    author_headline = serializers.SerializerMethodField()
    author_photo = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = (
            "id",
            "author_id",
            "author_name",
            "author_headline",
            "author_photo",
            "body",
            "image_url",
            "link_url",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "id",
            "author_id",
            "author_name",
            "author_headline",
            "author_photo",
            "created_at",
            "updated_at",
        )

    def get_author_headline(self, obj):
        profile = getattr(obj.author, "profile", None)
        return profile.headline if profile else ""

    def get_author_photo(self, obj):
        profile = getattr(obj.author, "profile", None)
        return profile.photo_url if profile else ""
