# first stage
LABEL version="0.0.1-django-backend"
MAINTAINER "James Troy <james@james-troy.com>"

FROM node:14.15-buster-slim as nodebuilder

# set working directory
WORKDIR /node_build
RUN apt-get update -y && \
    apt-get install dh-autoreconf -y --no-install-recommends

# copy project file
COPY . .
# install node packages
RUN npm set progress=false && \
    npm config set depth 0 && \
    npm install && \
    npm run postinstall && \
    npm run build


# second stage
FROM python:3.8
ARG PORT
ENV PYTHONDONTWRITEBYTECODE 1
# Prevents Python from buffering stdout and stderr
ENV PYTHONUNBUFFERED 1

WORKDIR /app
COPY  . /app

COPY --from=nodebuilder /node_build/websiteBackend/static/vendors /app/websiteBackend/static/vendors
COPY --from=nodebuilder /node_build/websiteBackend/static/js /app/websiteBackend/static/js

#HEALTHCHECK --interval=1m --timeout=20s --retries=2 --start-period=20s \
#  CMD wget -qO- http://localhost:$PORT/healthcheck/ || exit 1
# install dependencies
RUN pip install --no-cache-dir pip --upgrade && \
    pip install -r requirements/base.txt  --no-cache-dir

# run as non-root user
RUN useradd -m app_user
RUN chown -R app_user:app_user /app
USER app_user

CMD ["gunicorn", "websiteBackend.asgi:application", "--bind", "0.0.0.0:${PORT}"]