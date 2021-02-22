from rest_framework import routers

from api.v1.views import HealthViewSet, UserViewSet

__all__ = ["urls"]


def urls():
    router = routers.DefaultRouter()
    router.register(r"health", HealthViewSet, basename="health")
    router.register(r"users", UserViewSet, basename="users")

    return (router.urls, "v1")
