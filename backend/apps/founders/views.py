from django.db.models import Q
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import FounderProfile
from .serializers import (
    FounderProfilePublicSerializer,
    FounderProfileSelfSerializer,
)
from apps.storage.client import get_signed_upload_url


@api_view(["GET", "PATCH"])
@permission_classes([IsAuthenticated])
def my_profile(request):
    """GET or update your own profile."""
    profile, _ = FounderProfile.objects.get_or_create(user=request.user)
    if request.method == "GET":
        return Response(FounderProfileSelfSerializer(profile).data)

    serializer = FounderProfileSelfSerializer(
        profile, data=request.data, partial=True
    )
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def directory(request):
    """List founders. Supports ?q= search and ?sector= filter."""
    q = request.query_params.get("q", "").strip()
    sector = request.query_params.get("sector", "").strip()

    qs = FounderProfile.objects.filter(is_searchable=True).exclude(
        user=request.user
    )

    if q:
        qs = qs.filter(
            Q(user__full_name__icontains=q)
            | Q(headline__icontains=q)
            | Q(bio__icontains=q)
            | Q(location__icontains=q)
        )

    if sector:
        # JSONField contains lookup
        qs = qs.filter(sectors_of_interest__contains=[sector])

    qs = qs.select_related("user")[:60]

    return Response(FounderProfilePublicSerializer(qs, many=True).data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def founder_detail(request, user_id: int):
    """Public profile of one founder."""
    try:
        profile = FounderProfile.objects.select_related("user").get(
            user_id=user_id, is_searchable=True
        )
    except FounderProfile.DoesNotExist:
        return Response(
            {"detail": "Founder not found"}, status=status.HTTP_404_NOT_FOUND
        )
    return Response(FounderProfilePublicSerializer(profile).data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def request_upload_url(request):
    """
    Get a signed upload URL for the founder's photo or banner.
    Body: { "kind": "photo" | "banner", "content_type": "image/jpeg" }
    Returns: { "upload_url": "...", "public_url": "..." }
    The frontend then PUTs the file directly to upload_url and saves
    public_url to the profile.
    """
    kind = request.data.get("kind")
    content_type = request.data.get("content_type", "image/jpeg")
    if kind not in ("photo", "banner"):
        return Response(
            {"detail": "kind must be 'photo' or 'banner'"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        upload = get_signed_upload_url(
            user_id=request.user.id, kind=kind, content_type=content_type
        )
    except Exception as exc:
        return Response(
            {"detail": f"Storage not configured: {exc}"},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )
    return Response(upload)
