from django.db.models import Q
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.founders.models import FounderProfile
from apps.founders.serializers import FounderProfilePublicSerializer
from apps.posts.models import Post
from apps.posts.serializers import PostSerializer
from apps.posts.views import _annotated_posts_qs


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def search(request):
    """Unified search across founders and posts.

    Query params:
        q: search query (min 2 chars)
        limit: per-section limit (default 5, max 20)
    """
    q = (request.GET.get("q") or "").strip()
    try:
        limit = min(int(request.GET.get("limit", 5)), 20)
    except (TypeError, ValueError):
        limit = 5

    if len(q) < 2:
        return Response({"founders": [], "posts": [], "query": q})

    founder_q = (
        Q(user__full_name__icontains=q)
        | Q(headline__icontains=q)
        | Q(location__icontains=q)
        | Q(bio__icontains=q)
        | Q(skills__icontains=q)
        | Q(sectors_of_interest__icontains=q)
    )
    founders = (
        FounderProfile.objects.filter(is_searchable=True)
        .filter(founder_q)
        .select_related("user")
        .distinct()[:limit]
    )

    posts_q = _annotated_posts_qs(request.user).filter(
        body__icontains=q
    )[:limit]

    return Response(
        {
            "query": q,
            "founders": FounderProfilePublicSerializer(founders, many=True).data,
            "posts": PostSerializer(
                posts_q, many=True, context={"request": request}
            ).data,
        }
    )
