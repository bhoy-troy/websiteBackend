
Backend REST API for a VUEX frontend running on Heroku


#### Heroku

Setting up docker on Heroku

[comment]: <> (https://testdriven.io/blog/deploying-django-to-heroku-with-docker/)


Push to master branch to live on Heroku

    $ git push heroku master:master
    
Run migrations
  
     heroku run python manage.py migrate -a <APP>


#### Docker

##### Linting
  
    docker run --rm -i hadolint/hadolint < Dockerfile

##### Build
    $ docker build -t jtroy/djangobackend:latest .


### Dev

    npm install
    npm run dev
    
    autopep8 --in-place --aggressive --aggressive -r websiteBackend/
    black websiteBackend