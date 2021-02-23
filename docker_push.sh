#!/bin/bash

REPOSITORY=djangobackend

VERSION=$(python -c "from websiteBackend import __version__; print(__version__)")

docker build --rm=false \
    -t=jtroy/${REPOSITORY}:v${VERSION} .
docker push jtroy/${REPOSITORY}:v${VERSION}
docker push jtroy/${REPOSITORY}:latest
PUSHED=$?
# delete successfully pushed image on CI platform
if [[ $PUSHED -eq 0 ]] && [[ "$CI" == "true" ]]
then
    docker rmi jtroy/${REPOSITORY}:v${VERSION}
    docker rmi jtroy/${REPOSITORY}:latest
fi
