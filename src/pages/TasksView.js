import React, { useState } from 'react';
import { Plus, Search, CheckCircle2, AlertCircle, Calendar, Clock } from 'lucide-react';
import TaskForm from '../components/TaskForm';
import { api } from '../services/api';

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
    <div className="flex items-center gap-2">
      <div 
        className="w-2 h-2 rounded-full" 
        style={{ backgroundColor: config.dot }}
      />
      <span 
        className="px-3 py-1 rounded-full text-xs font-semibold capitalize"
        style={{ 
          backgroundColor: config.bg,
          color: config.text
        }}
      >
        {status}
      </span>
    </div>
  );
};

const ProjectBadge = ({ project }) => {
  if (!project || !projects[project]) return null;
  
  const projectInfo = projects[project];
  
  return (
    <span 
      className="px-2 py-1 rounded-full text-xs font-semibold text-white"
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
    <div className={`grid grid-cols-12 gap-4 items-center p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${task.completed ? 'opacity-60' : ''}`}>
      {/* Task Title & Project */}
      <div className="col-span-4">
        <div className="flex items-center gap-3">
          <div 
            className="w-1 h-8 rounded-full" 
            style={{ backgroundColor: priorityColors[task.importance] || priorityColors.medium }}
          />
          <div className="min-w-0 flex-1">
            <h3 className={`font-semibold text-gray-900 truncate ${task.completed ? 'line-through' : ''}`}>
              {task.title}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <ProjectBadge project={task.project} />
              {task.description && (
                <span className="text-xs text-gray-500 truncate">
                  {task.description.substring(0, 50)}...
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Due Date */}
      <div className="col-span-2">
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

      {/* Status */}
      <div className="col-span-2">
        <StatusBadge task={task} />
      </div>

      {/* Priority */}
      <div className="col-span-2">
        <span 
          className="px-2 py-1 rounded-full text-xs font-semibold text-white capitalize"
          style={{ backgroundColor: priorityColors[task.importance] || priorityColors.medium }}
        >
          {task.importance || 'medium'}
        </span>
      </div>

      {/* Actions */}
      <div className="col-span-2 flex items-center justify-end gap-2">
        <button 
          onClick={handleComplete}
          disabled={loading}
          className={`p-2 rounded-lg transition-colors ${
            task.completed 
              ? 'text-green-600 bg-green-50 hover:bg-green-100' 
              : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
          }`}
          title={task.completed ? "Mark as incomplete" : "Mark as complete"}
        >
          <CheckCircle2 size={18} />
        </button>
        <button 
          onClick={handleDelete}
          disabled={loading}
          className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
          title="Delete task"
        >
          <AlertCircle size={18} />
        </button>
      </div>
    </div>
  );
};

const TasksHeader = ({ tasksCount, onAddTask, searchTerm, setSearchTerm }) => {
  return (
    <div className="bg-white p-6 border-b border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">To Do's</h1>
          <p className="text-gray-600 mt-1">{tasksCount} tasks</p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          {/* Add Task Button */}
          <button 
            onClick={onAddTask}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={18} />
            Create New Task
          </button>
        </div>
      </div>
      
      {/* Filter Tabs */}
      <div className="flex gap-6 mt-6">
        {['All', 'Pending', 'Completed', 'Overdue'].map((tab, index) => (
          <button
            key={tab}
            className={`flex items-center gap-2 pb-2 text-sm font-semibold transition-colors ${
              index === 0 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
};

const TaskTable = ({ tasks, onToggleComplete, onDelete, searchTerm }) => {
  // Filter tasks based on search term
  const filteredTasks = tasks.filter(task =>
    task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white">
      {/* Table Header */}
      <div className="grid grid-cols-12 gap-4 items-center p-4 border-b border-gray-200 bg-gray-50">
        <div className="col-span-4">
          <span className="text-sm font-semibold text-gray-700">Task</span>
        </div>
        <div className="col-span-2">
          <span className="text-sm font-semibold text-gray-700">Due Date</span>
        </div>
        <div className="col-span-2">
          <span className="text-sm font-semibold text-gray-700">Status</span>
        </div>
        <div className="col-span-2">
          <span className="text-sm font-semibold text-gray-700">Priority</span>
        </div>
        <div className="col-span-2">
          <span className="text-sm font-semibold text-gray-700">Actions</span>
        </div>
      </div>

      {/* Table Body */}
      <div className="divide-y divide-gray-100">
        {filteredTasks.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {searchTerm ? 'No tasks match your search.' : 'No tasks found. Create your first task!'}
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

// Main TasksView Component
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
    <div className="flex-1 flex flex-col">
      <TasksHeader 
        tasksCount={tasks.length}
        onAddTask={handleAddTask}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />
      
      {showAddForm && (
        <div className="bg-white border-b border-gray-200 p-6">
          <TaskForm 
            onTaskCreated={handleTaskCreated}
            onCancel={() => setShowAddForm(false)}
          />
        </div>
      )}
      
      <div className="flex-1 overflow-auto">
        <TaskTable 
          tasks={tasks}
          onToggleComplete={onTaskUpdated}
          onDelete={onTaskDeleted}
          searchTerm={searchTerm}
        />
      </div>
    </div>
  );
};

export default TasksView;