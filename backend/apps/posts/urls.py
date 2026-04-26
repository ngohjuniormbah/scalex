from django.urls import path

from . import views

urlpatterns = [
    path("", views.feed, name="post-feed"),
    path("upload-url/", views.request_upload_url, name="post-upload-url"),
    path("by/<int:user_id>/", views.author_posts, name="post-by-author"),
    path("<int:post_id>/", views.delete_post, name="post-delete"),
    path("<int:post_id>/like/", views.toggle_like, name="post-like"),
    path("<int:post_id>/comments/", views.post_comments, name="post-comments"),
    path("comments/<int:comment_id>/", views.delete_comment, name="comment-delete"),
]
