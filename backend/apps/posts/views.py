from django.db.models import Count, Exists, OuterRef
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Post, Reaction, Comment
from .serializers import PostSerializer, CommentSerializer
from apps.storage.client import get_signed_upload_url


def _annotated_posts_qs(user):
    """Posts queryset annotated with like_count, comment_count, liked_by_me."""
    liked_subquery = Reaction.objects.filter(
        user=user, post=OuterRef("pk")
    )
    return (
        Post.objects.select_related("author__profile")
        .annotate(
            _prefetched_like_count=Count("reactions", distinct=True),
            _prefetched_comment_count=Count("comments", distinct=True),
            _liked_by_me=Exists(liked_subquery),
        )
    )


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def feed(request):
    """GET: global feed (most recent first). POST: create a post."""
    if request.method == "POST":
        serializer = PostSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        body = (serializer.validated_data.get("body") or "").strip()
        if not body:
            return Response(
                {"detail": "body is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        post = serializer.save(author=request.user)
        post = _annotated_posts_qs(request.user).get(pk=post.pk)
        return Response(
            PostSerializer(post, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )

    qs = _annotated_posts_qs(request.user).all()[:60]
    return Response(
        PostSerializer(qs, many=True, context={"request": request}).data
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def author_posts(request, user_id: int):
    qs = _annotated_posts_qs(request.user).filter(author_id=user_id)[:60]
    return Response(
        PostSerializer(qs, many=True, context={"request": request}).data
    )


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


@api_view(["POST", "DELETE"])
@permission_classes([IsAuthenticated])
def toggle_like(request, post_id: int):
    """POST to like, DELETE to unlike. Returns updated like_count."""
    try:
        post = Post.objects.get(pk=post_id)
    except Post.DoesNotExist:
        return Response(
            {"detail": "Post not found"}, status=status.HTTP_404_NOT_FOUND
        )

    if request.method == "POST":
        Reaction.objects.get_or_create(user=request.user, post=post)
        liked = True
    else:
        Reaction.objects.filter(user=request.user, post=post).delete()
        liked = False

    return Response(
        {
            "post_id": post.id,
            "liked_by_me": liked,
            "like_count": post.reactions.count(),
        }
    )


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def post_comments(request, post_id: int):
    """GET: list comments on a post (oldest first). POST: add a comment."""
    try:
        post = Post.objects.get(pk=post_id)
    except Post.DoesNotExist:
        return Response(
            {"detail": "Post not found"}, status=status.HTTP_404_NOT_FOUND
        )

    if request.method == "POST":
        body = (request.data.get("body") or "").strip()
        if not body:
            return Response(
                {"detail": "body is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        comment = Comment.objects.create(
            author=request.user, post=post, body=body[:2000]
        )
        return Response(
            CommentSerializer(comment).data, status=status.HTTP_201_CREATED
        )

    qs = (
        Comment.objects.filter(post=post)
        .select_related("author__profile")
        .all()
    )
    return Response(CommentSerializer(qs, many=True).data)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_comment(request, comment_id: int):
    try:
        comment = Comment.objects.get(pk=comment_id, author=request.user)
    except Comment.DoesNotExist:
        return Response(
            {"detail": "Not found"}, status=status.HTTP_404_NOT_FOUND
        )
    comment.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)
