from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Post
from .serializers import PostSerializer
from apps.storage.client import get_signed_upload_url


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def feed(request):
    """GET: global feed (most recent first). POST: create a post."""
    if request.method == "POST":
        serializer = PostSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        body = (serializer.validated_data.get("body") or "").strip()
        if not body:
            return Response(
                {"detail": "body is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        post = serializer.save(author=request.user)
        return Response(
            PostSerializer(post).data, status=status.HTTP_201_CREATED
        )

    qs = Post.objects.select_related("author__profile").all()[:60]
    return Response(PostSerializer(qs, many=True).data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def author_posts(request, user_id: int):
    """All posts by a specific user."""
    qs = (
        Post.objects.filter(author_id=user_id)
        .select_related("author__profile")
        .all()[:60]
    )
    return Response(PostSerializer(qs, many=True).data)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_post(request, post_id: int):
    try:
        post = Post.objects.get(pk=post_id, author=request.user)
    except Post.DoesNotExist:
        return Response(
            {"detail": "Not found"}, status=status.HTTP_404_NOT_FOUND
        )
    post.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def request_upload_url(request):
    """Get a signed Supabase upload URL for a post image."""
    content_type = request.data.get("content_type", "image/jpeg")
    try:
        upload = get_signed_upload_url(
            user_id=request.user.id, kind="post", content_type=content_type
        )
    except Exception as exc:
        return Response(
            {"detail": f"Storage not configured: {exc}"},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )
    return Response(upload)
