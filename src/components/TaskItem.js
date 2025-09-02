import React, { useState } from 'react';
import { api } from '../services/api';
import '../styles/TaskItem.css';

const TaskItem = ({ task, onTaskUpdated, onTaskDeleted, showActions = true }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  const getPriorityColor = (importance) => {
    const colors = {
      'low': '#059669',
      'medium': '#d97706',
      'high': '#dc2626',
      'critical': '#7c2d12'
    };
    return colors[importance] || '#6b7280';
  };

  return (
    <div
      className={`task-item-container ${loading ? 'loading' : ''}`}
      style={{ borderLeft: `4px solid ${getPriorityColor(task.importance)}` }}
    >
      {error && <div className="task-item-error">{error}</div>}

      <div className="task-item-content">
        <div className="task-item-main">
          <div className="task-item-header">
            <h4 className={`task-item-title ${task.completed ? 'completed' : ''}`}>
              {task.title}
            </h4>
            
            {task.completed && (
              <span className="task-item-status-badge task-item-status-completed">
                Completed
              </span>
            )}

            {task.is_overdue && !task.completed && (
              <span className="task-item-status-badge task-item-status-overdue">
                Overdue
              </span>
            )}
          </div>

          {task.description && (
            <p className="task-item-description">{task.description}</p>
          )}

          <div className="task-item-details">
            {task.scheduled_date && (
              <div className="task-item-detail">
                <span className="task-item-detail-icon">📅</span>
                <span className="task-item-detail-text">
                  {new Date(task.scheduled_date).toLocaleDateString()}
                </span>
              </div>
            )}

            {task.formatted_time_range && (
              <div className="task-item-detail">
                <span className="task-item-detail-icon">🕐</span>
                <span className="task-item-detail-text">
                  {task.formatted_time_range}
                </span>
              </div>
            )}

            {task.formatted_duration && (
              <div className="task-item-detail">
                <span className="task-item-detail-icon">⏱️</span>
                <span className="task-item-detail-text">
                  {task.formatted_duration}
                </span>
              </div>
            )}

            <div className="task-item-detail">
              <span className="task-item-detail-icon">🎯</span>
              <span
                className="task-item-priority"
                style={{ color: getPriorityColor(task.importance) }}
              >
                {task.importance_display}
              </span>
            </div>
          </div>
        </div>

        {showActions && (
          <div className="task-item-actions">
            <button
              onClick={toggleComplete}
              disabled={loading}
              className={`task-item-button ${task.completed ? 'task-item-button-undo' : 'task-item-button-complete'}`}>
              {task.completed ? 'Undo' : 'Complete'}
            </button>

            <button
              onClick={deleteTask}
              disabled={loading}
              className="task-item-button task-item-button-delete"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskItem;