from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Application
from .serializers import ApplicationSerializer


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
            user=request.user,
            status=Application.Status.SUBMITTED,
        )
    else:
        serializer.save()

    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_application(request):
    """Return the logged-in user's application or null if none."""
    app = Application.objects.filter(user=request.user).first()
    if app is None:
        return Response(None)
    return Response(ApplicationSerializer(app).data)
