import { useState } from 'react';
import TaskForm from '../components/TaskForm';
import TaskItem from '../components/TaskItem';
import '../styles/Dashboard.css';

const Dashboard = ({ tasks, onTaskUpdated, onTaskDeleted, loadTasks }) => {
  const [showForm, setShowForm] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const todayTasks = tasks.filter(task => task.scheduled_date === today);
  const upcomingTasks = tasks.filter(task => 
    task.scheduled_date && task.scheduled_date > today && !task.completed
  ).slice(0, 5);
  const overdueTasks = tasks.filter(task => task.is_overdue && !task.completed);

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.completed).length,
    pending: tasks.filter(t => !t.completed).length,
    overdue: overdueTasks.length,
    today: todayTasks.length
  };

  const statCards = [
    { label: 'Total Tasks', value: stats.total, color: '#3b82f6' },
    { label: 'Today\'s Tasks', value: stats.today, color: '#10b981' },
    { label: 'Pending', value: stats.pending, color: '#f59e0b' },
    { label: 'Overdue', value: stats.overdue, color: '#dc2626' },
  ];

  return (
    <div className="dashboard-container">
      <div className="stats-grid">
        {statCards.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-value" style={{ color: stat.color }}>
              {stat.value}
            </div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="add-task-container">
        {!showForm ? (
          <button
            onClick={() => setShowForm(true)}
            className="add-task-button"
          >
            + Add New Task
          </button>
        ) : (
          <TaskForm 
            onTaskCreated={() => {
              loadTasks();
              setShowForm(false);
            }}
            onCancel={() => setShowForm(false)}
          />
        )}
      </div>

      <div className="tasks-grid">
        <section>
          <h2 className="task-section-header">
            Today's Tasks ({todayTasks.length})
          </h2>
          
          {todayTasks.length === 0 ? (
            <div className="no-tasks-message">
              <p>No tasks scheduled for today</p>
            </div>
          ) : (
            <div>
              {todayTasks.map(task => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onTaskUpdated={onTaskUpdated}
                  onTaskDeleted={onTaskDeleted}
                />
              ))}
            </div>
          )}
        </section>

        {overdueTasks.length > 0 && (
          <section>
            <h2 className="task-section-header task-section-header-overdue">
              Overdue Tasks ({overdueTasks.length})
            </h2>
            
            <div>
              {overdueTasks.map(task => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onTaskUpdated={onTaskUpdated}
                  onTaskDeleted={onTaskDeleted}
                />
              ))}
            </div>
          </section>
        )}

        {upcomingTasks.length > 0 && (
          <section>
            <h2 className="task-section-header">
              Upcoming Tasks
            </h2>
            
            <div>
              {upcomingTasks.map(task => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onTaskUpdated={onTaskUpdated}
                  onTaskDeleted={onTaskDeleted}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default Dashboard;