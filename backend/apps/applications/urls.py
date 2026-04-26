from django.urls import path

from . import views

urlpatterns = [
    # Founder-facing
    path("", views.create_application, name="application-create"),
    path("me/", views.my_application, name="application-me"),
    # Admin
    path("admin/stats/", views.admin_stats, name="admin-stats"),
    path("admin/list/", views.admin_list, name="admin-list"),
    path("admin/<int:app_id>/", views.admin_detail, name="admin-detail"),
    path("admin/<int:app_id>/decide/", views.admin_decide, name="admin-decide"),
]
