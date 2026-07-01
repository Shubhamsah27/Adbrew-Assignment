from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from pymongo.errors import PyMongoError
from .repositories import MongoTodoRepository

# Instantiate the repository
todo_repo = MongoTodoRepository()

class TodoListView(APIView):

    def get(self, request):
        try:
            todos = todo_repo.get_all()
            return Response(todos, status=status.HTTP_200_OK)
        except PyMongoError:
            return Response(
                {"error": "Database service is temporarily unavailable. Please try again later."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )

    def post(self, request):
        text = request.data.get("text")
        
        # Input validation
        if text is None:
            return Response(
                {"error": "Missing required field: 'text'"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not isinstance(text, str):
            return Response(
                {"error": "Field 'text' must be a string"},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        text = text.strip()
        if not text:
            return Response(
                {"error": "Todo text cannot be empty or blank"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            todo = todo_repo.create(text)
            return Response(todo, status=status.HTTP_201_CREATED)
        except PyMongoError:
            return Response(
                {"error": "Database service is temporarily unavailable. Please try again later."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
