import logo from './logo.svg';
import './App.css';

import React, { useState } from 'react';
function DayPlanner() {
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Learn React basics', completed: false, time: '09:00' },
    { id: 2, text: 'Build day planner', completed: false, time: '10:00' }
  ]);

  const [newTask, setNewTask] = useState('');
  const [newTime, setNewTime] = useState('');
  
  const addTask = () => {
    if (newTask.trim() && newTime) {
      const task = {
        id: Date.now(),
        text: newTask,
        completed: false,
        time: newTime
      };
      setTasks([...tasks, task]);
      setNewTask('');
      setNewTime('');
    }
  };

  const toggleTask = (id) => {
    setTasks(tasks.map(task => task.id === id ? { ...task, completed: !task.completed } : task));
  }
  const deleteTask = (taskId) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  return (
    <div className="day-planner">
      <div className="header">
        <h1>Day Planner</h1>
        <p>Today: {new Date().toLocaleDateString()}</p>
      </div>

      <div className="add-task-form">
        <h3>Add New Task</h3>
        <div className="input-group">
          <input
            type="text"
            placeholder="What do you need to do?"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            className="task-input"
          />
          <input
            type="time"
            value={newTime}
            onChange={(e) => setNewTime(e.target.value)}
            className="time-input"
          />
          <button onClick={addTask} className="add-btn">
            Add Task
          </button>
        </div>
      </div>

      <div className="tasks-container">
        <h3>Today's Schedule ({tasks.length} tasks)</h3>
        {tasks.length === 0 ? (
          <p className="no-tasks">No tasks yet! Add one above.</p>
        ) : (
          <div className="tasks-list">
            {tasks.map(task => (
              // Each task is rendered by the TaskItem component
              <TaskItem
                key={task.id}
                task={task}
                onToggle={toggleTask}
                onDelete={deleteTask}
              />
            ))}
          </div>
        )}
      </div>

      <div className="stats">
        <div className="stat">
          <strong>Total Tasks:</strong> {tasks.length}
        </div>
        <div className="stat">
          <strong>Completed:</strong> {tasks.filter(t => t.completed).length}
        </div>
        <div className="stat">
          <strong>Remaining:</strong> {tasks.filter(t => !t.completed).length}
        </div>
      </div>

      <style jsx>{`
        .day-planner {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          color: white;
        }

        .header {
          text-align: center;
          margin-bottom: 30px;
          background: rgba(255,255,255,0.1);
          padding: 20px;
          border-radius: 15px;
          backdrop-filter: blur(10px);
        }

        .header h1 {
          margin: 0 0 10px 0;
          font-size: 2.5em;
        }

        .add-task-form {
          background: rgba(255,255,255,0.1);
          padding: 20px;
          border-radius: 15px;
          margin-bottom: 30px;
          backdrop-filter: blur(10px);
        }

        .input-group {
          display: flex;
          gap: 10px;
          margin-top: 15px;
          flex-wrap: wrap;
        }

        .task-input {
          flex: 1;
          min-width: 200px;
          padding: 12px;
          border: none;
          border-radius: 8px;
          font-size: 16px;
        }

        .time-input {
          padding: 12px;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          min-width: 120px;
        }

        .add-btn {
          padding: 12px 24px;
          background: #4CAF50;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 16px;
          font-weight: bold;
          transition: background 0.3s;
        }

        .add-btn:hover {
          background: #45a049;
          transform: translateY(-2px);
        }

        .tasks-container {
          background: rgba(255,255,255,0.1);
          padding: 20px;
          border-radius: 15px;
          margin-bottom: 20px;
          backdrop-filter: blur(10px);
        }

        .no-tasks {
          text-align: center;
          font-style: italic;
          opacity: 0.8;
          padding: 40px;
        }

        .tasks-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .stats {
          display: flex;
          justify-content: space-around;
          background: rgba(255,255,255,0.1);
          padding: 20px;
          border-radius: 15px;
          backdrop-filter: blur(10px);
        }

        .stat {
          text-align: center;
        }

        @media (max-width: 600px) {
          .input-group {
            flex-direction: column;
          }
          
          .stats {
            flex-direction: column;
            gap: 10px;
          }
        }
      `}</style>
    </div>
  );
}

function TaskItem({ task, onToggle, onDelete }) {
  return (
    <div className={`task-item ${task.completed ? 'completed' : ''}`}>
      <div className="task-time">{task.time}</div>
      <div className="task-content">
        <span className="task-text">{task.text}</span>
      </div>
      <div className="task-actions">
        <button 
          onClick={() => onToggle(task.id)}
          className="toggle-btn"
        >
          {task.completed ? '✓' : '○'}
        </button>
        <button 
          onClick={() => onDelete(task.id)}
          className="delete-btn"
        >
          🗑️
        </button>
      </div>

      <style jsx>{`
        .task-item {
          display: flex;
          align-items: center;
          padding: 15px;
          background: rgba(255,255,255,0.2);
          border-radius: 10px;
          transition: all 0.3s ease;
          border-left: 4px solid #4CAF50;
        }

        .task-item.completed {
          opacity: 0.7;
          border-left-color: #888;
        }

        .task-item:hover {
          transform: translateX(5px);
          background: rgba(255,255,255,0.3);
        }

        .task-time {
          background: rgba(0,0,0,0.2);
          padding: 5px 10px;
          border-radius: 5px;
          font-weight: bold;
          min-width: 70px;
          text-align: center;
          margin-right: 15px;
        }

        .task-content {
          flex: 1;
        }

        .task-text {
          font-size: 16px;
          text-decoration: ${task => task.completed ? 'line-through' : 'none'};
        }

        .task-actions {
          display: flex;
          gap: 10px;
        }

        .toggle-btn, .delete-btn {
          background: none;
          border: none;
          font-size: 18px;
          cursor: pointer;
          padding: 5px;
          border-radius: 5px;
          transition: background 0.3s;
        }

        .toggle-btn:hover {
          background: rgba(76, 175, 80, 0.3);
        }

        .delete-btn:hover {
          background: rgba(244, 67, 54, 0.3);
        }
      `}</style>
    </div>
  );
}
export default DayPlanner;