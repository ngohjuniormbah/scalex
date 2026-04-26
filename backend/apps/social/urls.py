from django.urls import path

from . import views

urlpatterns = [
    # Connections
    path("connect/<int:user_id>/", views.request_connection, name="connect"),
    path("connections/", views.my_connections, name="my-connections"),
    path(
        "connections/<int:conn_id>/respond/",
        views.respond_connection,
        name="respond-connection",
    ),
    # Messaging
    path("threads/", views.thread_list, name="thread-list"),
    path("threads/open/<int:user_id>/", views.open_thread, name="open-thread"),
    path(
        "threads/<int:thread_id>/messages/",
        views.thread_messages,
        name="thread-messages",
    ),
]
