from datetime import datetime

from django.contrib.sitemaps import Sitemap
from django.contrib.sites.models import Site
from django.urls import reverse


class StaticViewSitemap(Sitemap):
    def items(self):
        return [
            "home",
        ]

    def get_urls(self, site=None, **kwargs):
        site = Site(domain="james-troy.com", name="james_troy")
        return super(StaticViewSitemap, self).get_urls(site=site, **kwargs)

    def location(self, item):
        return reverse(item)

    def changefreq(self, obj):
        return "weekly"

    def lastmod(self, obj):
        return datetime.now()
