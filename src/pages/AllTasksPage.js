import { useState } from 'react';
import TaskItem from '../components/TaskItem';
import '../styles/AllTasksPage.css';

const AllTasksPage = ({ tasks, onTaskUpdated, onTaskDeleted }) => {
  const [filter, setFilter] = useState('all');
  const [importanceFilter, setImportanceFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created');

  // Filter tasks
  let filteredTasks = tasks.filter(task => {
    if (filter === 'pending' && task.completed) return false;
    if (filter === 'completed' && !task.completed) return false;
    if (filter === 'overdue' && (!task.is_overdue || task.completed)) return false;
    if (importanceFilter !== 'all' && task.importance !== importanceFilter) return false;
    return true;
  });

  // Sort tasks
  filteredTasks.sort((a, b) => {
    switch (sortBy) {
      case 'created':
        return new Date(b.created_at) - new Date(a.created_at);
      case 'date':
        if (!a.scheduled_date && !b.scheduled_date) return 0;
        if (!a.scheduled_date) return 1;
        if (!b.scheduled_date) return -1;
        return new Date(a.scheduled_date) - new Date(b.scheduled_date);
      case 'importance':
        const importanceOrder = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
        return importanceOrder[b.importance] - importanceOrder[a.importance];
      default:
        return 0;
    }
  });

  return (
    <div className="all-tasks-container">
      <div className="all-tasks-header">
        <h1 className="all-tasks-title">All Tasks ({filteredTasks.length})</h1>
      </div>

      <div className="filters-container">
        <div>
          <label className="filter-label">Status</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Tasks</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>

        <div>
          <label className="filter-label">Priority</label>
          <select
            value={importanceFilter}
            onChange={(e) => setImportanceFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        <div>
          <label className="filter-label">Sort By</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="filter-select"
          >
            <option value="created">Date Created</option>
            <option value="date">Scheduled Date</option>
            <option value="importance">Priority Level</option>
          </select>
        </div>
      </div>

      {filteredTasks.length === 0 ? (
        <div className="no-tasks-found-container">
          <h3 className="no-tasks-found-title">No tasks found</h3>
          <p className="no-tasks-found-text">
            Try adjusting your filters or create a new task
          </p>
        </div>
      ) : (
        <div>
          {filteredTasks.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              onTaskUpdated={onTaskUpdated}
              onTaskDeleted={onTaskDeleted}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AllTasksPage;