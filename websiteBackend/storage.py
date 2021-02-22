from whitenoise.storage import CompressedManifestStaticFilesStorage


class SiteWhiteNoiseStaticFilesStorage(CompressedManifestStaticFilesStorage):
    manifest_strict = False
