from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from unittest.mock import patch
from pymongo.errors import ServerSelectionTimeoutError

class TodoListViewTests(APITestCase):
    def setUp(self):
        self.url = reverse('signup')  # View name is registered as 'signup' in urls.py

    @patch('rest.views.todo_repo.get_all')
    def test_get_todos_success(self, mock_get_all):
        mock_get_all.return_value = [
            {"id": "60c72b2f9b1d8a23c4a12345", "text": "Test Todo 1"},
            {"id": "60c72b2f9b1d8a23c4a12346", "text": "Test Todo 2"}
        ]
        
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
        self.assertEqual(response.data[0]["text"], "Test Todo 1")

    @patch('rest.views.todo_repo.get_all')
    def test_get_todos_db_error(self, mock_get_all):
        mock_get_all.side_effect = ServerSelectionTimeoutError("Connection timed out")
        
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_503_SERVICE_UNAVAILABLE)
        self.assertIn("error", response.data)

    @patch('rest.views.todo_repo.create')
    def test_post_todo_success(self, mock_create):
        mock_create.return_value = {"id": "60c72b2f9b1d8a23c4a12347", "text": "New Todo"}
        
        data = {"text": "New Todo"}
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["text"], "New Todo")

    def test_post_todo_missing_text(self):
        data = {}
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["error"], "Missing required field: 'text'")

    def test_post_todo_invalid_type(self):
        data = {"text": 12345}
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["error"], "Field 'text' must be a string")

    def test_post_todo_empty_string(self):
        data = {"text": "   "}
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["error"], "Todo text cannot be empty or blank")

    @patch('rest.views.todo_repo.create')
    def test_post_todo_db_error(self, mock_create):
        mock_create.side_effect = ServerSelectionTimeoutError("Connection timed out")
        
        data = {"text": "Valid Todo"}
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_503_SERVICE_UNAVAILABLE)
        self.assertIn("error", response.data)
