from rest_framework import serializers

from .models import Post, Comment


class PostSerializer(serializers.ModelSerializer):
    author_id = serializers.IntegerField(source="author.id", read_only=True)
    author_name = serializers.CharField(source="author.full_name", read_only=True)
    author_headline = serializers.SerializerMethodField()
    author_photo = serializers.SerializerMethodField()
    like_count = serializers.SerializerMethodField()
    comment_count = serializers.SerializerMethodField()
    liked_by_me = serializers.SerializerMethodField()

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
            "like_count",
            "comment_count",
            "liked_by_me",
        )
        read_only_fields = (
            "id",
            "author_id",
            "author_name",
            "author_headline",
            "author_photo",
            "created_at",
            "updated_at",
            "like_count",
            "comment_count",
            "liked_by_me",
        )

    def get_author_headline(self, obj):
        profile = getattr(obj.author, "profile", None)
        return profile.headline if profile else ""

    def get_author_photo(self, obj):
        profile = getattr(obj.author, "profile", None)
        return profile.photo_url if profile else ""

    def get_like_count(self, obj):
        if hasattr(obj, "_prefetched_like_count"):
            return obj._prefetched_like_count
        return obj.reactions.count()

    def get_comment_count(self, obj):
        if hasattr(obj, "_prefetched_comment_count"):
            return obj._prefetched_comment_count
        return obj.comments.count()

    def get_liked_by_me(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return False
        if hasattr(obj, "_liked_by_me"):
            return obj._liked_by_me
        return obj.reactions.filter(user=request.user).exists()


class CommentSerializer(serializers.ModelSerializer):
    author_id = serializers.IntegerField(source="author.id", read_only=True)
    author_name = serializers.CharField(source="author.full_name", read_only=True)
    author_headline = serializers.SerializerMethodField()
    author_photo = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = (
            "id",
            "author_id",
            "author_name",
            "author_headline",
            "author_photo",
            "body",
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
