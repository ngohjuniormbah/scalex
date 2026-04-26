from django.urls import path

from . import views

urlpatterns = [
    path("", views.feed, name="post-feed"),
    path("upload-url/", views.request_upload_url, name="post-upload-url"),
    path("by/<int:user_id>/", views.author_posts, name="post-by-author"),
    path("<int:post_id>/", views.delete_post, name="post-delete"),
]
