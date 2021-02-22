"""websiteBackend URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.conf import settings
from django.conf.urls import url

from django.contrib import admin
from django.urls import path, include
from django.conf.urls.static import static
from django.views import defaults as default_views
from django.views.i18n import JavaScriptCatalog

from websiteBackend.sitemaps import StaticViewSitemap
from websiteBackend.views import HomeView
from api.urls import urlpatterns as api_urlpatterns

sitemaps = {
    "static": StaticViewSitemap,
}


handler404 = "websiteBackend.views.handler404"
handler500 = "websiteBackend.views.handler500"

urlpatterns = [
    # path("/", include("grappelli.urls")),  # grappelli URLS
    path("", HomeView.as_view(), name="home"),
    path("grappelli/", include("grappelli.urls")),  # grappelli URLS
    path("admin/", admin.site.urls),
    path("jsi18n/", JavaScriptCatalog.as_view(), name="javascript-catalog"),
    url(r"^api/", include((api_urlpatterns, "api"), namespace="api")),
    # path(
    #     "favicon.ico",
    #     RedirectView.as_view(url=settings.STATIC_URL + "images/favicons/favicon.ico"),
    # ),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)


if settings.DEBUG:
    # This allows the error pages to be debugged during development, just visit
    # these url in browser to see how these error pages look like.
    urlpatterns += [
        path(
            "400/",
            default_views.bad_request,
            kwargs={"exception": Exception("Bad Request!")},
        ),
        path(
            "403/",
            default_views.permission_denied,
            kwargs={"exception": Exception("Permission Denied")},
        ),
        path(
            "404/",
            default_views.page_not_found,
            kwargs={"exception": Exception("Page not Found")},
        ),
        path("500/", default_views.server_error),
    ]
    if "debug_toolbar" in settings.INSTALLED_APPS:
        import debug_toolbar

        urlpatterns = [
            path(
                "__debug__/",
                include(
                    debug_toolbar.urls))] + urlpatterns