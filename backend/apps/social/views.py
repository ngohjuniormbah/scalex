from django.contrib.auth import get_user_model
from django.db.models import Q
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Connection, Message, MessageThread
from .serializers import (
    ConnectionSerializer,
    MessageSerializer,
    ThreadSerializer,
)

User = get_user_model()


def _are_connected(u1, u2) -> bool:
    return Connection.objects.filter(
        status=Connection.Status.ACCEPTED,
    ).filter(
        Q(requester=u1, recipient=u2) | Q(requester=u2, recipient=u1)
    ).exists()


# ---- Connections --------------------------------------------------------

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def request_connection(request, user_id: int):
    """Send a connection request to another founder."""
    if user_id == request.user.id:
        return Response(
            {"detail": "Cannot connect to yourself"},
            status=status.HTTP_400_BAD_REQUEST,
        )
    try:
        recipient = User.objects.get(pk=user_id)
    except User.DoesNotExist:
        return Response(
            {"detail": "User not found"}, status=status.HTTP_404_NOT_FOUND
        )

    note = request.data.get("note", "")[:300]

    # If a connection already exists in either direction, return it
    existing = Connection.objects.filter(
        Q(requester=request.user, recipient=recipient)
        | Q(requester=recipient, recipient=request.user)
    ).first()
    if existing:
        return Response(ConnectionSerializer(existing).data)

    conn = Connection.objects.create(
        requester=request.user, recipient=recipient, note=note
    )
    return Response(
        ConnectionSerializer(conn).data, status=status.HTTP_201_CREATED
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_connections(request):
    """List my connections, grouped by direction and status."""
    me = request.user
    incoming = Connection.objects.filter(
        recipient=me, status=Connection.Status.PENDING
    ).select_related("requester__profile")
    outgoing = Connection.objects.filter(
        requester=me, status=Connection.Status.PENDING
    ).select_related("recipient__profile")
    accepted = Connection.objects.filter(
        Q(requester=me) | Q(recipient=me),
        status=Connection.Status.ACCEPTED,
    ).select_related("requester__profile", "recipient__profile")

    return Response({
        "incoming": ConnectionSerializer(incoming, many=True).data,
        "outgoing": ConnectionSerializer(outgoing, many=True).data,
        "accepted": ConnectionSerializer(accepted, many=True).data,
    })


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def respond_connection(request, conn_id: int):
    """Accept or decline a pending request you received."""
    action = request.data.get("action")
    if action not in ("accept", "decline"):
        return Response(
            {"detail": "action must be 'accept' or 'decline'"},
            status=status.HTTP_400_BAD_REQUEST,
        )
    try:
        conn = Connection.objects.get(pk=conn_id, recipient=request.user)
    except Connection.DoesNotExist:
        return Response(
            {"detail": "Request not found"}, status=status.HTTP_404_NOT_FOUND
        )
    if conn.status != Connection.Status.PENDING:
        return Response(
            {"detail": "Already decided"}, status=status.HTTP_400_BAD_REQUEST
        )

    conn.status = (
        Connection.Status.ACCEPTED
        if action == "accept"
        else Connection.Status.DECLINED
    )
    conn.decided_at = timezone.now()
    conn.save()
    return Response(ConnectionSerializer(conn).data)


# ---- Messaging ----------------------------------------------------------

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def thread_list(request):
    me = request.user
    threads = MessageThread.objects.filter(
        Q(user_a=me) | Q(user_b=me)
    ).select_related("user_a__profile", "user_b__profile")
    return Response(
        ThreadSerializer(threads, many=True, context={"request": request}).data
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def open_thread(request, user_id: int):
    """Open (or create) a thread with another user. Must be connected."""
    if user_id == request.user.id:
        return Response(
            {"detail": "Cannot message yourself"},
            status=status.HTTP_400_BAD_REQUEST,
        )
    try:
        other = User.objects.get(pk=user_id)
    except User.DoesNotExist:
        return Response(
            {"detail": "User not found"}, status=status.HTTP_404_NOT_FOUND
        )
    if not _are_connected(request.user, other):
        return Response(
            {"detail": "You must be connected to message this founder."},
            status=status.HTTP_403_FORBIDDEN,
        )
    thread = MessageThread.between(request.user, other)
    return Response(
        ThreadSerializer(thread, context={"request": request}).data
    )


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def thread_messages(request, thread_id: int):
    """List or post messages in a thread."""
    me = request.user
    try:
        thread = MessageThread.objects.get(
            Q(user_a=me) | Q(user_b=me), pk=thread_id
        )
    except MessageThread.DoesNotExist:
        return Response(
            {"detail": "Thread not found"}, status=status.HTTP_404_NOT_FOUND
        )

    if request.method == "POST":
        body = (request.data.get("body") or "").strip()
        if not body:
            return Response(
                {"detail": "body is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if len(body) > 4000:
            return Response(
                {"detail": "Message too long (max 4000 chars)"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        msg = Message.objects.create(thread=thread, sender=me, body=body)
        thread.save()  # bumps last_activity
        return Response(
            MessageSerializer(msg).data, status=status.HTTP_201_CREATED
        )

    # GET — also mark unread messages from other party as read
    Message.objects.filter(
        thread=thread, read_at__isnull=True
    ).exclude(sender=me).update(read_at=timezone.now())

    msgs = thread.messages.all()
    return Response(MessageSerializer(msgs, many=True).data)
