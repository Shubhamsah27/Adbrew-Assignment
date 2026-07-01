import React, { useState, useEffect } from 'react';
import './App.css';

const API_URL = 'http://localhost:8000/todos/';

export function App() {
  const [todos, setTodos] = useState([]);
  const [newTodoText, setNewTodoText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  // Local state to track completed items (for the interactive progress bar)
  const [completedIds, setCompletedIds] = useState(new Set());

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
    
    const trimmedText = newTodoText.trim();
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
      await fetchTodos();
    } catch (err) {
      setError(err.message || 'Could not save the todo item.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle completion local state
  const toggleTodo = (id) => {
    const nextCompleted = new Set(completedIds);
    if (nextCompleted.has(id)) {
      nextCompleted.delete(id);
    } else {
      nextCompleted.add(id);
    }
    setCompletedIds(nextCompleted);
  };

  // Calculate completion percentage
  const totalTodos = todos.length;
  const completedCount = todos.filter(t => completedIds.has(t.id || t._id)).length;
  const progressPercent = totalTodos > 0 ? Math.round((completedCount / totalTodos) * 100) : 0;

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Task Manager</h1>
        <p>Efficient workflow dashboard with persistent storage</p>
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
                autoComplete="off"
              />
            </div>
            <button type="submit" className="btn-primary" disabled={isSubmitting || !newTodoText.trim()}>
              {isSubmitting ? 'Adding...' : 'Add Task'}
            </button>
          </form>
        </section>

        <section className="list-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h2>Tasks List</h2>
            <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', fontWeight: '600' }}>
              {completedCount}/{totalTodos} Completed
            </span>
          </div>

          <div className="progress-container">
            <div className="progress-bar" style={{ width: `${progressPercent}%` }} />
          </div>

          {isLoading && todos.length === 0 ? (
            <div className="loading-state">Loading tasks...</div>
          ) : todos.length === 0 ? (
            <div className="empty-state">
              <svg className="empty-icon" viewBox="0 0 24 24">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              <p>No tasks found. Get started by creating one above!</p>
            </div>
          ) : (
            <ul className="todo-list">
              {todos.map((todo) => {
                const id = todo.id || todo._id;
                const isCompleted = completedIds.has(id);
                return (
                  <li key={id} className="todo-item" onClick={() => toggleTodo(id)} style={{ cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      <div style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '4px',
                        border: '2px solid rgba(255,255,255,0.2)',
                        background: isCompleted ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' : 'transparent',
                        borderColor: isCompleted ? '#3b82f6' : 'rgba(255,255,255,0.2)',
                        marginRight: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        transition: 'all 0.2s ease'
                      }}>
                        {isCompleted && (
                          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                      <span className="todo-text" style={{
                        textDecoration: isCompleted ? 'line-through' : 'none',
                        color: isCompleted ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.85)'
                      }}>
                        {todo.text}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
