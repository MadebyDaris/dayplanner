import React, { useState , useEffect} from 'react';
import './App.css';

const API_URL = 'http://localhost:8000/api';


function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

const api = {
  getTasks: async () => {
    try {
      const response = await fetch(`${API_URL}/tasks/`);
      if (!response.ok) throw new Error('Failed to fetch tasks');
      const data = await response.json();
      console.log(data);
      return data.tasks;
    } catch (error) {
      console.error(error);
      return [];
    }
  },

  createTask: async (task) => {
    const csrftoken = getCookie('csrftoken');
    const response = await fetch(`${API_URL}/tasks/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrftoken,
      },
      body: JSON.stringify(task),
    });
    const data = await response.json();
    return data;
  },


  updateTask: async (taskId, updates) => {
    const csrftoken = getCookie('csrftoken');
    try {
      const response = await fetch(`${API_URL}/tasks/${taskId}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrftoken,
        },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error('Failed to update task');
      return await response.json();
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  },

  deleteTask: async (taskId) => {
    const csrftoken = getCookie('csrftoken');
    try {
      const response = await fetch(`${API_URL}/tasks/${taskId}/`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrftoken,
        },
      });
      if (!response.ok) throw new Error('Failed to delete task');
      return true;
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }
};

function TaskForm({ onSubmit }) {
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const now = new Date();
    setDate(now.toISOString().slice(0, 10)); // YYYY-MM-DD
    setTime(now.toTimeString().slice(0, 5)); // HH:MM
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return alert('Title is required');
    setLoading(true);
    try {
      const task = {
        title: title.trim(),
        description: description.trim(),
        scheduled_date: date,
        scheduled_time: time,
      }
      await api.createTask(task);
      onSubmit();
    }
    catch (error) {
      console.error('Error creating task:', error);
      alert('Failed to create task');
    } finally {
      setLoading(false);
    }
    setTitle('');
    setDate(new Date().toISOString().slice(0, 10));
    setTime(new Date().toTimeString().slice(0, 5));
  }
  const handleAddClick = () => {
    const fakeEvent = { preventDefault: () => {} };
    handleSubmit(fakeEvent);
  };
   return (
    <div className="max-w-md mx-auto mt-8">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-2xl p-6 space-y-4"
      >
        <h2 className="text-2xl font-semibold text-gray-800 text-center">
          Add New Task
        </h2>

        <div>
          <label className="block text-sm font-medium text-gray-600">
            Title
          </label>
          <input
            type="text"
            className="mt-1 w-full rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task title"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600">
            Description
          </label>
          <textarea
            className="mt-1 w-full rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Write a short description..."
            rows={3}
          />
        </div>

        <div className="flex space-x-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-600">
              Date
            </label>
            <input
              type="date"
              className="mt-1 w-full rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-600">
              Time
            </label>
            <input
              type="time"
              className="mt-1 w-full rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60 transition"
        >
          {loading ? "Adding..." : "Add Task"}
        </button>
      </form>
    </div>
  );
}

function TaskItem({ task, onTaskUpdated, onTaskDeleted }) {
  const [loading, setLoading] = useState(false);

  const toggleComplete = async () => {
    setLoading(true);
    try {
      await api.updateTask(task.id, { completed: !task.completed });
      onTaskUpdated();
    } catch (error) {
      alert('Failed to update task');
    } finally {
      setLoading(false);
    }
  };

  const deleteTask = async () => {
    if (window.confirm(`Delete "${task.title}"?`)) {
      setLoading(true);
      try {
        await api.deleteTask(task.id);
        onTaskDeleted();
      } catch (error) {
        alert('Failed to delete task');
      } finally {
        setLoading(false);
      }
    }
  };
return (
    <div 
      style={{ 
        padding: '15px', 
        border: '1px solid #ddd', 
        borderRadius: '8px',
        marginBottom: '10px',
        backgroundColor: task.completed ? '#f8f9fa' : 'white',
        opacity: loading ? 0.6 : 1
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
        <div style={{ flex: 1 }}>
          <h3 
            style={{ 
              margin: '0 0 5px 0',
              textDecoration: task.completed ? 'line-through' : 'none',
              color: task.completed ? '#666' : 'black'
            }}
          >
            {task.title}
          </h3>
          <p style={{ margin: '5px 0', color: '#666', fontSize: '14px' }}>
            📅 {task.scheduled_date} ⏰ {task.scheduled_time}
          </p>
          <p style={{ margin: '5px 0', fontSize: '12px', color: task.completed ? '#28a745' : '#ffc107' }}>
            {task.completed ? '✅ Completed' : '⏳ Pending'}
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={toggleComplete}
            disabled={loading}
            style={{
              padding: '5px 10px',
              fontSize: '14px',
              backgroundColor: task.completed ? '#ffc107' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {task.completed ? 'Undo' : 'Done'}
          </button>
          
          <button
            onClick={deleteTask}
            disabled={loading}
            style={{
              padding: '5px 10px',
              fontSize: '14px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export { api, TaskForm, TaskItem };