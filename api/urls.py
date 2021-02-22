from django.conf.urls import url
from django.urls import include
from django.urls import re_path
from rest_framework_swagger.views import get_swagger_view

from api import v1

schema_view = get_swagger_view(title="Backend")
urlpatterns = [
    url(r"^auth", include("rest_framework.urls", namespace="rest_framework")),
    url(r"^$", schema_view, name="swagger"),
    re_path(r"^v1/", include(v1.urls(), namespace="v1")),
]
