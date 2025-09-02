import React, { useState } from 'react';
import { api } from '../services/api';
import { Input, Textarea, Select, Button} from './utils';
import '../styles/TaskForm.css';

function TaskForm({ onTaskCreated, onCancel }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    scheduled_date: '',
    has_specific_time: true,
    scheduled_start_time: '',
    scheduled_end_time: '',
    duration_hours: 0,
    duration_minutes: 30,
    importance: 'medium',
    project: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const projects = [
    { id: '', name: 'No Project', color: '#6b7280' },
    { id: 'work', name: 'Work Tasks', color: '#3b82f6' },
    { id: 'personal', name: 'Personal', color: '#10b981' },
    { id: 'learning', name: 'Learning & Development', color: '#f59e0b' },
    { id: 'health', name: 'Health & Fitness', color: '#ef4444' },
    { id: 'finance', name: 'Finance & Planning', color: '#8b5cf6' },
    { id: 'home', name: 'Home & Family', color: '#06b6d4' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return alert('Title is required');
    if (formData.has_specific_time) {
      const totalMinutes = (formData.duration_hours * 60) + formData.duration_minutes;
      if (totalMinutes <= 0) {
        setError('Duration must be greater than 0');
        return;
      }
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
        has_specific_time: true,
        scheduled_start_time: '',
        scheduled_end_time: '',
        duration_hours: 0,
        duration_minutes: 30,
        importance: 'medium',
        project: ''
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

  const selectedProject = projects.find(p => p.id === formData.project) || projects[0];

  return (
    <div className="task-form-container">
      <div className="task-form-header">
        <h3 className="task-form-title">Create New Task</h3>
        {formData.project && (
          <div 
            className="project-indicator"
            style={{ 
              backgroundColor: selectedProject.color,
              color: 'white'
            }}
          >
            {selectedProject.name}
          </div>
        )}
      </div>

      {error && <div className="task-form-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="task-form-grid">
          {/* Title */}
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

          {/* Project Selection */}
          <div>
            <label className="task-form-label">Project / Category</label>
            <Select
              value={formData.project}
              onChange={(e) => setFormData({ ...formData, project: e.target.value })}
              className="task-form-input task-form-select"
            >
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </Select>
            <div className="project-preview">
              {projects.filter(p => p.id).map(project => (
                <div
                  key={project.id}
                  className={`project-chip ${formData.project === project.id ? 'selected' : ''}`}
                  style={{ backgroundColor: project.color }}
                  onClick={() => setFormData({ ...formData, project: project.id })}
                >
                  {project.name}
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
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

          {/* Date */}
          <div>
            <label className="task-form-label">Scheduled Date</label>
            <Input
              type="date"
              value={formData.scheduled_date}
              onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
              className="task-form-input"
            />
          </div>

          {/* Time Type Toggle */}
          <div className="time-toggle-section">
            <label className="task-form-label">Time Planning</label>
            <div className="toggle-container">
              <button
                type="button"
                className={`toggle-option ${formData.has_specific_time ? 'active' : ''}`}
                onClick={() => setFormData({ ...formData, has_specific_time: true })}
              >
                Specific Time
              </button>
              <button
                type="button"
                className={`toggle-option ${!formData.has_specific_time ? 'active' : ''}`}
                onClick={() => setFormData({ ...formData, has_specific_time: false })}
              >
                Duration Based
              </button>
            </div>
          </div>

          {/* Time or Duration Fields */}
          {formData.has_specific_time ? (
            <div>
              <label className="task-form-label">Scheduled Time</label>
              <label className="task-form-label">From : To</label>
              <Input
                type="time"
                value={formData.scheduled_start_time}
                onChange={(e) => setFormData({ ...formData, scheduled_time: e.target.value })}
                className="task-form-input"
              />
              
              <Input
                type="time"
                value={formData.scheduled_start_time}
                onChange={(e) => setFormData({ ...formData, scheduled_time: e.target.value })}
                className="task-form-input"
              />
            </div>
          ) : (
            <div className="duration-inputs">
              <label className="task-form-label">Estimated Duration</label>
              <div className="duration-grid">
                <div>
                  <label className="duration-label">Hours</label>
                  <Select
                    value={formData.duration_hours}
                    onChange={(e) => setFormData({ ...formData, duration_hours: parseInt(e.target.value) })}
                    className="task-form-input"
                  >
                    {[...Array(13)].map((_, i) => (
                      <option key={i} value={i}>{i}</option>
                    ))}
                  </Select>
                </div>
                <div>
                  <label className="duration-label">Minutes</label>
                  <Select
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                    className="task-form-input"
                  >
                    {[0, 15, 30, 45].map(mins => (
                      <option key={mins} value={mins}>{mins}</option>
                    ))}
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Priority */}
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
