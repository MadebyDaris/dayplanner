import React, { useState } from 'react';
import { api } from '../services/api';
import { Input, Textarea, Select, Button} from './utils';
import '../styles/TaskForm.css';

function TaskForm({ onTaskCreated, onCancel }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    scheduled_date: '',
    start_time: '',
    end_time: '',
    importance: 'medium'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return alert('Title is required');
    if (formData.start_time && formData.end_time && formData.start_time >= formData.end_time) {
      setError('End time must be after start time');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await api.createTask({
        ...formData,
        title: formData.title.trim(),
        description: formData.description.trim(),
      });

      setFormData({
        title: '',
        description: '',
        scheduled_date: '',
        start_time: '',
        end_time: '',
        importance: 'medium'
      });
      alert('Task created successfully');
      onTaskCreated();
      if (onCancel) onCancel();
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  const importanceOptions = [
    { value: 'low', label: 'Low Priority', color: '#059669' },
    { value: 'medium', label: 'Medium Priority', color: '#d97706' },
    { value: 'high', label: 'High Priority', color: '#dc2626' },
    { value: 'critical', label: 'Critical Priority', color: '#7c2d12' },
  ];

  return (
    <div className="task-form-container">
      <h3 className="task-form-title">Create New Task</h3>

      {error && <div className="task-form-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="task-form-grid">
          <div>
            <label className="task-form-label">Task Title *</label>
            <Input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter task title"
              required
              className="task-form-input"
            />
          </div>

          <div>
            <label className="task-form-label">Description</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Add task description (optional)"
              rows={3}
              className="task-form-input task-form-textarea"
            />
          </div>

          <div className="task-form-grid-3-col">
            <div>
              <label className="task-form-label">Date</label>
              <Input
                type="date"
                value={formData.scheduled_date}
                onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                className="task-form-input"
              />
            </div>
            
            <div>
              <label className="task-form-label">Start Time</label>
              <Input
                type="time"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                className="task-form-input"
              />
            </div>
            
            <div>
              <label className="task-form-label">End Time</label>
              <Input
                type="time"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                className="task-form-input"
              />
            </div>
          </div>

          <div>
            <label className="task-form-label">Priority Level</label>
            <Select
              value={formData.importance}
              onChange={(e) => setFormData({ ...formData, importance: e.target.value })}
              className="task-form-input task-form-select"
            >
              {importanceOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="task-form-buttons">
          <Button
            type="submit"
            disabled={loading}
            className="task-form-button task-form-button-primary"
          >
            {loading ? 'Creating...' : 'Create Task'}
          </Button>
          
          {onCancel && (
            <Button
              type="button"
              onClick={onCancel}
              className="task-form-button task-form-button-secondary"
            >
              Cancel
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}

export default TaskForm;
