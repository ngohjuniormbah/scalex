from django.urls import path

from . import views

urlpatterns = [
    path("me/", views.my_profile, name="profile-me"),
    path("upload-url/", views.request_upload_url, name="profile-upload-url"),
    path("", views.directory, name="founder-directory"),
    path("<int:user_id>/", views.founder_detail, name="founder-detail"),
]
