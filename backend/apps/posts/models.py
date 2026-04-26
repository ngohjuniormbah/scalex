from django.conf import settings
from django.db import models


class Post(models.Model):
    """A short text post, optionally with one image. Founder updates / showcase."""

    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="posts",
    )
    body = models.TextField(max_length=4000)
    image_url = models.URLField(blank=True)
    link_url = models.URLField(
        blank=True,
        help_text="Optional link the post points to (e.g. demo, blog, GitHub repo)",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("-created_at",)

    def __str__(self) -> str:
        return f"{self.author.email}: {self.body[:40]}"


class Reaction(models.Model):
    """A like on a post. One reaction per (user, post) pair."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="reactions",
    )
    post = models.ForeignKey(
        Post,
        on_delete=models.CASCADE,
        related_name="reactions",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=("user", "post"),
                name="unique_reaction_per_user_post",
            ),
        ]
        ordering = ("-created_at",)

    def __str__(self) -> str:
        return f"{self.user.email} liked {self.post_id}"


class Comment(models.Model):
    """A comment on a post."""

    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="comments",
    )
    post = models.ForeignKey(
        Post,
        on_delete=models.CASCADE,
        related_name="comments",
    )
    body = models.TextField(max_length=2000)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("created_at",)

    def __str__(self) -> str:
        return f"{self.author.email} on {self.post_id}: {self.body[:40]}"
