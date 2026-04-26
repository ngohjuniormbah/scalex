from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path


def healthcheck(_request):
    return JsonResponse({"status": "ok", "service": "scalex-api"})


urlpatterns = [
    path("", healthcheck),
    path("admin/", admin.site.urls),
    path("api/auth/", include("apps.accounts.urls")),
    path("api/applications/", include("apps.applications.urls")),
    path("api/founders/", include("apps.founders.urls")),
    path("api/social/", include("apps.social.urls")),
    path("api/posts/", include("apps.posts.urls")),
    path("api/search/", include("apps.search.urls")),
]
