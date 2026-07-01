import React, { useState, useEffect } from 'react';
import './App.css';

const API_URL = 'http://localhost:8000/todos/';

export function App() {
  const [todos, setTodos] = useState([]);
  const [newTodoText, setNewTodoText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all todos from the backend
  const fetchTodos = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`);
      }
      const data = await response.json();
      setTodos(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Could not connect to the backend server.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch on mount
  useEffect(() => {
    fetchTodos();
  }, []);

  // Handle new todo submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const trimmedText = newTodoText.strip ? newTodoText.strip() : newTodoText.trim();
    if (!trimmedText) {
      setError('Todo description cannot be empty.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: trimmedText }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to create todo item.');
      }

      setNewTodoText('');
      // Re-fetch list to ensure consistency with backend
      await fetchTodos();
    } catch (err) {
      setError(err.message || 'Could not save the todo item.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Task Manager</h1>
      </header>

      <main className="app-content">
        {error && (
          <div className="error-banner" role="alert">
            <span className="error-message">{error}</span>
            <button className="error-dismiss" onClick={() => setError(null)}>×</button>
          </div>
        )}

        <section className="form-section">
          <h2>Create a New Task</h2>
          <form onSubmit={handleSubmit} className="todo-form">
            <div className="form-group">
              <label htmlFor="todo-input">Task Description</label>
              <input
                id="todo-input"
                type="text"
                value={newTodoText}
                onChange={(e) => setNewTodoText(e.target.value)}
                placeholder="What needs to be done?"
                disabled={isSubmitting}
              />
            </div>
            <button type="submit" className="btn-primary" disabled={isSubmitting || !newTodoText.trim()}>
              {isSubmitting ? 'Adding...' : 'Add Task'}
            </button>
          </form>
        </section>

        <section className="list-section">
          <h2>Tasks List</h2>
          {isLoading && todos.length === 0 ? (
            <div className="loading-state">Loading tasks...</div>
          ) : todos.length === 0 ? (
            <div className="empty-state">No tasks found. Get started by creating one above!</div>
          ) : (
            <ul className="todo-list">
              {todos.map((todo) => (
                <li key={todo.id || todo._id} className="todo-item">
                  <span className="todo-text">{todo.text}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
