# Adbrew TODO Application - Submission

This repository contains the completed submission for the Adbrew SDE Intern coding assignment. 

The implementation focuses heavily on **clean architecture, strict validation, database resilience, and frontend robustness**, while maintaining a clean and functional design.

---

## Architecture Overview

To ensure separation of concerns and database independence, the application utilizes a **Repository Pattern** on the backend. This decouples our HTTP request-handling view controllers from the database implementation details.

```mermaid
graph TD
    subgraph Frontend Container (React App)
        UI[App.js Component] -->|State Hooks| State[Todos / Loading / Errors]
        UI -->|Fetch Requests| API_Client[HTTP Client]
    end

    subgraph Backend Container (Django API)
        API_Client -->|POST / GET /todos/| Views[views.py TodoListView]
        Views -->|Request Validation| Validation[Type & Content Checks]
        Views -->|Query / Save| Repo[repositories.py MongoTodoRepository]
    end

    subgraph Database Container (MongoDB)
        Repo -->|PyMongo Client| DB[(MongoDB: test_db)]
    end
```

---

## Architectural Decisions & Design Patterns

### 1. Repository Pattern (`MongoTodoRepository`)
Rather than placing database connection logic and raw queries directly inside the Django views, all database tasks are encapsulated within a dedicated `MongoTodoRepository` class inside `repositories.py`.
- **Decoupling**: If the database changes in the future (e.g. from MongoDB to PostgreSQL), the views do not need to be refactored; only a new repository adapter is required.
- **Connection Isolation**: Encapsulates connection timeout limits and error propagation.

### 2. Strict Input Validation
The POST handler in `views.py` performs clean schema and semantic validation on every incoming request:
- **Presence**: Verifies that the required `text` field exists.
- **Type Safety**: Ensures that `text` is a string (rejecting numbers or objects).
- **Format Integrity**: Trims whitespace and rejects blank or empty strings.
- **HTTP status codes**: Returns `400 Bad Request` with structured error messages explaining the validation failure.

### 3. Database Resilience & Failure Isolation
To prevent the API from crashing or hanging if MongoDB is unreachable:
- Database connections specify a short 2-second timeout window.
- Operations are wrapped in try-except blocks catching `PyMongoError`.
- Returns an explicit `503 Service Unavailable` status with a descriptive JSON message, preventing internal server errors (`500`).

### 4. Resilient Frontend (React Hooks)
The React application (`App.js`) implements production-level UI state management using functional components and hooks:
- **Loading State**: Displays clean feedback during initial data load.
- **Error Banners**: Displays dismissible alerts when backend requests fail.
- **Double-Submit Protection**: Tracks a `isSubmitting` state to disable inputs and the submit button during API calls, preventing duplicate document creation on rapid user clicks.
- **Aesthetic**: Simple, clean, and professional layout.

---

## Verification & Unit Testing

### Automated Backend Tests
A suite of Django unit tests has been implemented inside `tests.py` using mock interfaces. They test:
- Successful GET and POST requests.
- Input validation (missing field, wrong data type, and empty string errors).
- MongoDB connection outage handling (returning `503`).

To run the test suite locally:
```bash
# Execute within the project root directory
.\venv\Scripts\python.exe src/rest/manage.py test rest
```

---

## original Instructions Setup

*Refer to the original instructions below for configuring paths and starting Docker.*

1. Set the codebase path variable:
   ```powershell
   $env:ADBREW_CODEBASE_PATH = "D:\Assessment\Adbrew\adb_test-master\src"
   ```
2. Build and start containers:
   ```bash
   docker-compose build
   docker-compose up -d
   ```
3. Access:
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:8000/todos/`
