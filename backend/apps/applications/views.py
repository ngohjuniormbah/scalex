from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework.response import Response

from .models import Application
from .serializers import ApplicationSerializer


# ---- Founder-facing -----------------------------------------------------

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_application(request):
    """Create or overwrite the current user's application."""
    existing = Application.objects.filter(user=request.user).first()
    serializer = ApplicationSerializer(
        instance=existing, data=request.data, partial=True
    )
    serializer.is_valid(raise_exception=True)

    if existing is None:
        serializer.save(
            user=request.user, status=Application.Status.SUBMITTED
        )
    else:
        serializer.save()
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_application(request):
    app = Application.objects.filter(user=request.user).first()
    if app is None:
        return Response(None)
    return Response(ApplicationSerializer(app).data)


# ---- Admin --------------------------------------------------------------

@api_view(["GET"])
@permission_classes([IsAdminUser])
def admin_stats(request):
    qs = Application.objects.all()
    return Response({
        "total": qs.count(),
        "submitted": qs.filter(status=Application.Status.SUBMITTED).count(),
        "under_review": qs.filter(status=Application.Status.UNDER_REVIEW).count(),
        "approved": qs.filter(status=Application.Status.APPROVED).count(),
        "rejected": qs.filter(status=Application.Status.REJECTED).count(),
    })


@api_view(["GET"])
@permission_classes([IsAdminUser])
def admin_list(request):
    """Admin: list applications, filterable by status."""
    qs = Application.objects.select_related("user").all()
    status_filter = request.query_params.get("status")
    if status_filter:
        qs = qs.filter(status=status_filter)
    q = request.query_params.get("q", "").strip()
    if q:
        from django.db.models import Q
        qs = qs.filter(
            Q(user__email__icontains=q)
            | Q(user__full_name__icontains=q)
            | Q(company_name__icontains=q)
        )
    return Response(ApplicationSerializer(qs[:200], many=True).data)


@api_view(["GET"])
@permission_classes([IsAdminUser])
def admin_detail(request, app_id: int):
    try:
        app = Application.objects.select_related("user").get(pk=app_id)
    except Application.DoesNotExist:
        return Response(
            {"detail": "Not found"}, status=status.HTTP_404_NOT_FOUND
        )
    return Response(ApplicationSerializer(app).data)


@api_view(["POST"])
@permission_classes([IsAdminUser])
def admin_decide(request, app_id: int):
    """Approve, reject, or move to under_review."""
    decision = request.data.get("decision")
    notes = request.data.get("notes", "")
    if decision not in ("approve", "reject", "review"):
        return Response(
            {"detail": "decision must be approve|reject|review"},
            status=status.HTTP_400_BAD_REQUEST,
        )
    try:
        app = Application.objects.get(pk=app_id)
    except Application.DoesNotExist:
        return Response(
            {"detail": "Not found"}, status=status.HTTP_404_NOT_FOUND
        )

    if decision == "approve":
        app.status = Application.Status.APPROVED
        app.decided_at = timezone.now()
        # Mark the founder account as verified
        app.user.is_verified = True
        app.user.save(update_fields=["is_verified"])
    elif decision == "reject":
        app.status = Application.Status.REJECTED
        app.decided_at = timezone.now()
    else:
        app.status = Application.Status.UNDER_REVIEW

    app.decision_notes = notes
    app.reviewed_by = request.user
    app.save()
    return Response(ApplicationSerializer(app).data)
