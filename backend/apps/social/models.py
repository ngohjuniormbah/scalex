from django.conf import settings
from django.db import models


class Connection(models.Model):
    """Bi-directional connection request / accepted relationship."""

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        ACCEPTED = "accepted", "Accepted"
        DECLINED = "declined", "Declined"

    requester = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="connection_requests_sent",
    )
    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="connection_requests_received",
    )
    status = models.CharField(
        max_length=10, choices=Status.choices, default=Status.PENDING
    )
    note = models.CharField(max_length=300, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    decided_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=("requester", "recipient"),
                name="unique_connection_pair",
            )
        ]
        ordering = ("-created_at",)

    def __str__(self) -> str:
        return f"{self.requester} → {self.recipient} ({self.status})"


class MessageThread(models.Model):
    """A 1:1 thread between two users (must be connected)."""

    user_a = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="threads_as_a",
    )
    user_b = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="threads_as_b",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    last_activity = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=("user_a", "user_b"), name="unique_thread_pair"
            )
        ]
        ordering = ("-last_activity",)

    @classmethod
    def between(cls, u1, u2):
        """Return canonical thread between two users (creates if missing)."""
        a, b = sorted([u1, u2], key=lambda u: u.id)
        thread, _ = cls.objects.get_or_create(user_a=a, user_b=b)
        return thread

    def other_user(self, user):
        return self.user_b if self.user_a_id == user.id else self.user_a


class Message(models.Model):
    thread = models.ForeignKey(
        MessageThread, on_delete=models.CASCADE, related_name="messages"
    )
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="messages_sent",
    )
    body = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    read_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ("created_at",)

    def __str__(self) -> str:
        return f"{self.sender} @ {self.created_at:%Y-%m-%d %H:%M}"
