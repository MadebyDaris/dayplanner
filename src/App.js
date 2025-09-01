import { useState, useEffect, setLoading } from 'react';
import './App.css';
import { api, TaskForm, TaskItem } from './api';

function DayPlanner() {

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all') // all, completed, pending

  const loadTasks = async () => {
    setLoading(true);
    try {
      const fetchedTasks = await api.getTasks();
      setTasks(fetchedTasks);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.completed).length;
  const pendingTasks = totalTasks - completedTasks;

  // Filter tasks based on selected filter
  const filteredTasks = tasks.filter(task => {
    if (filter === 'pending') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true; // 'all'
  });

 return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <header style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#333', marginBottom: '10px' }}>Day Planner</h1>
        <p style={{ color: '#666', margin: 0 }}>
          Total: {totalTasks} | Completed: {completedTasks} | Pending: {pendingTasks}
        </p>
      </header>

      <TaskForm onTaskCreated={loadTasks} />

      <div style={{ marginBottom: '20px' }}>
        <h2>Your Tasks</h2>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ marginRight: '10px' }}>Filter:</label>
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            style={{ padding: '5px', fontSize: '14px' }}
          >
            <option value="all">All Tasks</option>
            <option value="pending">Pending Only</option>
            <option value="completed">Completed Only</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <p>Loading tasks...</p>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
          <p>
            {filter === 'all' 
              ? 'No tasks yet. Create your first task above' 
              : filter === 'pending'
              ? 'No pending tasks.'
              : 'No completed tasks yet.'}
          </p>
        </div>
      ) : (
        <div>
          {filteredTasks.map(task => (
            <TaskItem 
              key={task.id} 
              task={task} 
              onTaskUpdated={loadTasks}
              onTaskDeleted={loadTasks}
            />
          ))}
        </div>
      )}

      <footer style={{ marginTop: '40px', textAlign: 'center', color: '#666', fontSize: '14px' }}>
        <p>React + Django Day Planner</p>
      </footer>
    </div>
  );
}

export default DayPlanner;