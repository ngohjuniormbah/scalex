from rest_framework import serializers

from .models import Connection, Message, MessageThread


class UserMiniSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    full_name = serializers.CharField()
    email = serializers.EmailField()
    headline = serializers.SerializerMethodField()
    photo_url = serializers.SerializerMethodField()

    def get_headline(self, obj):
        profile = getattr(obj, "profile", None)
        return profile.headline if profile else ""

    def get_photo_url(self, obj):
        profile = getattr(obj, "profile", None)
        return profile.photo_url if profile else ""


class ConnectionSerializer(serializers.ModelSerializer):
    requester = UserMiniSerializer(read_only=True)
    recipient = UserMiniSerializer(read_only=True)

    class Meta:
        model = Connection
        fields = (
            "id",
            "requester",
            "recipient",
            "status",
            "note",
            "created_at",
            "decided_at",
        )
        read_only_fields = ("id", "status", "created_at", "decided_at")


class MessageSerializer(serializers.ModelSerializer):
    sender_id = serializers.IntegerField(source="sender.id", read_only=True)

    class Meta:
        model = Message
        fields = ("id", "sender_id", "body", "created_at", "read_at")
        read_only_fields = ("id", "sender_id", "created_at", "read_at")


class ThreadSerializer(serializers.ModelSerializer):
    other = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()

    class Meta:
        model = MessageThread
        fields = ("id", "other", "last_message", "unread_count", "last_activity")

    def get_other(self, obj):
        me = self.context["request"].user
        other = obj.other_user(me)
        return UserMiniSerializer(other).data

    def get_last_message(self, obj):
        msg = obj.messages.order_by("-created_at").first()
        if not msg:
            return None
        return {
            "body": msg.body[:140],
            "created_at": msg.created_at,
            "from_me": msg.sender_id == self.context["request"].user.id,
        }

    def get_unread_count(self, obj):
        me = self.context["request"].user
        return obj.messages.filter(read_at__isnull=True).exclude(sender=me).count()
