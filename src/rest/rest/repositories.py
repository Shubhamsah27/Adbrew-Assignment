import os
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError

class MongoTodoRepository:
    def __init__(self):
        host = os.environ.get("MONGO_HOST", "mongo")
        port = os.environ.get("MONGO_PORT", "27017")
        mongo_uri = f"mongodb://{host}:{port}"
        # Setting a short timeout for server selection so outages are caught quickly
        self.client = MongoClient(mongo_uri, serverSelectionTimeoutMS=2000)
        self.db = self.client["test_db"]
        self.collection = self.db["todos"]

    def check_connection(self):
        # Force a command to verify the connection is alive
        self.client.admin.command("ping")

    def get_all(self):
        self.check_connection()
        todos = []
        for doc in self.collection.find():
            todos.append({
                "id": str(doc["_id"]),
                "text": doc.get("text", "")
            })
        return todos

    def create(self, text):
        self.check_connection()
        doc = {"text": text}
        result = self.collection.insert_one(doc)
        return {
            "id": str(result.inserted_id),
            "text": text
        }
