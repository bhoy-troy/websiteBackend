#!/bin/bash

REPOSITORY=djangobackend

VERSION=$(python -c "from websiteBackend import __version__; print(__version__)")

docker build --rm=false \
    -t=jtroy/${REPOSITORY}:v${VERSION} .
