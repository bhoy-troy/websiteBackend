# Create your views here.
from django.db import connections
from django.db.utils import OperationalError
from django.contrib.auth import get_user_model

from rest_framework import viewsets, response
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import authentication, permissions

User = get_user_model()


class HealthViewSet(viewsets.ViewSet):
    permission_classes = (AllowAny,)

    def _can_connect_to_db(self):
        db_conn = connections["default"]
        try:
            c = db_conn.cursor()
        except OperationalError:
            connected = False
        else:
            connected = True
        return "up" if connected else "down"

    def list(self, request, format=None):

        ## make sure we can connect to the database
        all_statuses = []
        status = "up"

        db_status = self._can_connect_to_db()

        all_statuses.append(db_status)

        if "down" in all_statuses:
            status = "down"

        data = {
            "data": {
                "explorer": "/api-explorer",
            },
            "status": {"db": db_status, "status": status},
        }
        return response.Response(data)


class UserViewSet(viewsets.ViewSet):
    """
    View to list all users in the system.

    * Requires token authentication.
    * Only admin users are able to access this view.
    """

    authentication_classes = [authentication.TokenAuthentication]
    permission_classes = [permissions.IsAdminUser]

    def list(self, request, format=None):
        """
        Return a list of all users.
        """
        usernames = [user.username for user in User.objects.all()]
        return Response(usernames)
