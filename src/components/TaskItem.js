import React, { useState } from 'react';
import { api } from '../services/api';
import '../styles/TaskItem.css';

const TaskItem = ({ task, onTaskUpdated, onTaskDeleted, showActions = true }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const projects = {
    'work': { name: 'Work Tasks', color: '#3b82f6' },
    'personal': { name: 'Personal', color: '#10b981' },
    'learning': { name: 'Learning & Development', color: '#f59e0b' },
    'health': { name: 'Health & Fitness', color: '#ef4444' },
    'finance': { name: 'Finance & Planning', color: '#8b5cf6' },
    'home': { name: 'Home & Family', color: '#06b6d4'  }
  };

  const toggleComplete = async () => {
    setLoading(true);
    setError('');
    try {
      await api.updateTask(task.id, { completed: !task.completed });
      onTaskUpdated();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteTask = async () => {
    if (window.confirm(`Delete "${task.title}"?`)) {
      setLoading(true);
      setError('');
      try {
        await api.deleteTask(task.id);
        onTaskDeleted();
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const getPriorityConfig = (importance) => {
    const configs = {
      'low': { color: '#6b7280', label: 'Low', icon: '●' },
      'medium': { color: '#f59e0b', label: 'Medium', icon: '●●' },
      'high': { color: '#ef4444', label: 'High', icon: '●●●' },
      'critical': { color: '#dc2626', label: 'Critical', icon: '●●●●' }
    };
    return configs[importance] || configs['medium'];
  };

  const project = task.project ? projects[task.project] : null;
  const priorityConfig = getPriorityConfig(task.importance);
return (
    <div className={`task-item-container ${loading ? 'loading' : ''} ${task.completed ? 'completed' : ''}`}>
      {error && (
        <div className="task-item-error">
          <span>{error}</span>
          <button onClick={() => setError('')} className="error-close">×</button>
        </div>
      )}

      <div className="task-item-content">
        <div className="task-item-main">
          {/* Header with title and status */}
          <div className="task-item-header">
            <div className="task-title-section">
              <h4 className={`task-item-title ${task.completed ? 'completed' : ''}`}>
                {task.title}
              </h4>
              
              {/* Project badge */}
              {project && (
                <div 
                  className="project-badge"
                  style={{ backgroundColor: project.color }}
                >
                  {/* <span className="project-icon">{project.icon}</span> */}
                  <span className="project-name">{project.name}</span>
                </div>
              )}
            </div>

            <div className="status-indicators">
              {/* Priority indicator */}
              <div 
                className="priority-indicator"
                style={{ color: priorityConfig.color }}
                title={`${priorityConfig.label} Priority`}
              >
                {priorityConfig.icon}
              </div>

              {/* Status badges */}
              {task.completed && (
                <span className="status-badge completed">
                  ✓ Completed
                </span>
              )}

              {task.is_overdue && !task.completed && (
                <span className="status-badge overdue">
                  ⚠ Overdue
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          {task.description && (
            <p className="task-item-description">{task.description}</p>
          )}

          {/* Task details */}
          <div className="task-item-details">
            {task.scheduled_date && (
              <div className="detail-item">
                <span className="detail-icon">📅</span>
                <span className="detail-text">
                  {new Date(task.scheduled_date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short', 
                    day: 'numeric'
                  })}
                </span>
              </div>
            )}

            {task.has_specific_time && task.formatted_time && (
              <div className="detail-item">
                <span className="detail-icon">🕐</span>
                <span className="detail-text">{task.formatted_time}</span>
              </div>
            )}

            {!task.has_specific_time && task.formatted_duration && (
              <div className="detail-item">
                <span className="detail-icon">⏱️</span>
                <span className="detail-text">~{task.formatted_duration}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action buttons */}
        {showActions && (
          <div className="task-item-actions">
            <button
              onClick={toggleComplete}
              disabled={loading}
              className={`action-button ${task.completed ? 'undo-button' : 'complete-button'}`}
              title={task.completed ? 'Mark as pending' : 'Mark as complete'}
            >
              {task.completed ? '↶' : '✓'}
            </button>

            <button
              onClick={deleteTask}
              disabled={loading}
              className="action-button delete-button"
              title="Delete task"
            >
              🗑️
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskItem;