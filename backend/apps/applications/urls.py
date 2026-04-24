from django.urls import path

from . import views

urlpatterns = [
    path("", views.create_application, name="application-create"),
    path("me/", views.my_application, name="application-me"),
]
