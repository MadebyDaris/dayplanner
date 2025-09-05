import React, { useState } from 'react';
import { Plus, Search, CheckCircle2, AlertCircle, Calendar, Clock } from 'lucide-react';
import TaskForm from '../components/TaskForm';
import { api } from '../services/api';
import '../styles/TasksView.css';

// Status color mapping
const statusColors = {
  "pending": { bg: "#fef2f2", text: "#dc2626", dot: "#dc2626" },
  "completed": { bg: "#f0fdf4", text: "#16a34a", dot: "#16a34a" },
  "overdue": { bg: "#fffbeb", text: "#d97706", dot: "#d97706" }
};

const priorityColors = {
  "low": "#10b981",
  "medium": "#f59e0b", 
  "high": "#ef4444",
  "critical": "#dc2626"
};

const projects = {
  'work': { name: 'Work Tasks', color: '#3b82f6' },
  'personal': { name: 'Personal', color: '#10b981' },
  'learning': { name: 'Learning & Development', color: '#f59e0b' },
  'health': { name: 'Health & Fitness', color: '#ef4444' },
  'finance': { name: 'Finance & Planning', color: '#8b5cf6' },
  'home': { name: 'Home & Family', color: '#06b6d4' }
};

// Reusable Components
const StatusBadge = ({ task }) => {
  let status, config;
  
  if (task.completed) {
    status = "completed";
    config = statusColors.completed;
  } else if (task.is_overdue) {
    status = "overdue";
    config = statusColors.overdue;
  } else {
    status = "pending";
    config = statusColors.pending;
  }
  
  return (
    <div className="status-badge" style={{ backgroundColor: config.bg, color: config.text }}>
      <div className="status-dot" style={{ backgroundColor: config.dot }}/>
      <span>{status}</span>
    </div>
  );
};

const ProjectBadge = ({ project }) => {
  if (!project || !projects[project]) return null;
  
  const projectInfo = projects[project];
  
  return (
    <span 
      className="project-badge"
      style={{ backgroundColor: projectInfo.color }}
    >
      {projectInfo.name}
    </span>
  );
};

const TaskRow = ({ task, onToggleComplete, onDelete }) => {
  const [loading, setLoading] = useState(false);

  const handleComplete = async () => {
    setLoading(true);
    try {
      await api.updateTask(task.id, { completed: !task.completed });
      onToggleComplete();
    } catch (error) {
      console.error('Error updating task:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Delete "${task.title}"?`)) {
      setLoading(true);
      try {
        await api.deleteTask(task.id);
        onDelete();
      } catch (error) {
        console.error('Error deleting task:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className={`task-row ${task.completed ? 'completed' : ''}`}>
      <div className="task-title-cell">
        <div className="priority-indicator" style={{ backgroundColor: priorityColors[task.importance] || priorityColors.medium }}/>
        <div>
          <h3 className="task-title">{task.title}</h3>
          <div className="task-meta">
            <ProjectBadge project={task.project} />
            {task.description && <p className="task-description">{task.description}</p>}
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar size={14} />
          <span>{formatDate(task.scheduled_date)}</span>
        </div>
        {task.formatted_time && (
          <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
            <Clock size={12} />
            <span>{task.formatted_time}</span>
          </div>
        )}
      </div>

      <div>
        <StatusBadge task={task} />
      </div>

      <div>
        <span className="priority-text">{task.importance}</span>
      </div>

      <div className="task-actions">
        <button onClick={handleComplete} disabled={loading} className="action-btn">
          <CheckCircle2 size={18} />
        </button>
        <button onClick={handleDelete} disabled={loading} className="action-btn">
          <AlertCircle size={18} />
        </button>
      </div>
    </div>
  );
};

const TasksHeader = ({ tasksCount, onAddTask, searchTerm, setSearchTerm }) => {
  return (
    <div className="tasks-header">
      <div className="tasks-header-top">
        <div>
          <h1 className="tasks-title">To Do's</h1>
          <p className="tasks-count">{tasksCount} tasks</p>
        </div>
        <div className="tasks-header-actions">
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button onClick={onAddTask} className="add-task-btn">
            <Plus size={18} />
            Create New Task
          </button>
        </div>
      </div>
      <div className="filter-tabs">
        {['All', 'Pending', 'Completed', 'Overdue'].map((tab, index) => (
          <button key={tab} className={`filter-tab ${index === 0 ? 'active' : ''}`}>
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
};

const TaskTable = ({ tasks, onToggleComplete, onDelete, searchTerm }) => {
  const filteredTasks = tasks.filter(task =>
    task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="task-table">
      <div className="task-table-header">
        <span>Task</span>
        <span>Due Date</span>
        <span>Status</span>
        <span>Priority</span>
        <span>Actions</span>
      </div>
      <div>
        {filteredTasks.length === 0 ? (
          <div className="no-tasks-found">
            <p>{searchTerm ? 'No tasks match your search.' : 'No tasks found. Create your first task!'}</p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <TaskRow 
              key={task.id} 
              task={task} 
              onToggleComplete={onToggleComplete}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </div>
  );
};

const TasksView = ({ tasks, onTaskUpdated, onTaskDeleted, loadTasks }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleAddTask = () => {
    setShowAddForm(true);
  };

  const handleTaskCreated = () => {
    setShowAddForm(false);
    loadTasks();
  };

  return (
    <div className="tasks-view-container">
      <TasksHeader 
        tasksCount={tasks.length}
        onAddTask={handleAddTask}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />
      
      {showAddForm && (
        <div className="add-task-form-container">
          <TaskForm 
            onTaskCreated={handleTaskCreated}
            onCancel={() => setShowAddForm(false)}
          />
        </div>
      )}
      
      <TaskTable 
        tasks={tasks}
        onToggleComplete={onTaskUpdated}
        onDelete={onTaskDeleted}
        searchTerm={searchTerm}
      />
    </div>
  );
};

export default TasksView;