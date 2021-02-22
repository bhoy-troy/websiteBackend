# first stage
FROM python:3.8 AS pybuilder

COPY requirements/base.txt requirements/dev.txt ./
RUN pip install --user -r requirements/dev.txt --no-cache-dir



# first stage

FROM node:14.15-buster-slim as nodebuilder

# set working directory
WORKDIR /node_build
# copy project file
COPY . .
# install node packages
RUN npm set progress=false && \
    npm config set depth 0 && \
    npm install --only=production && \
    npm cache clean


# third unnamed stage
FROM python:3.8-slim
WORKDIR /app

ENV PYTHONUNBUFFERED 1
ENV PYTHONDONTWRITEBYTECODE 1

RUN useradd -m app_user
COPY --chown=app_user:app_user . /app

COPY --from=nodebuilder /node_build/websiteBackend/static/vendors /app/websiteBackend/static/vendors
COPY --from=nodebuilder /node_build/websiteBackend/static/js /app/websiteBackend/static/js
# copy only the dependencies installation from the 1st stage image
COPY --from=pybuilder /root/.local/bin /root/.local
ENV PATH="/home/app/.local/bin:${PATH}"



USER app_user
CMD ["python3", "manage.py", "runserver", "0.0.0.0:8000"]