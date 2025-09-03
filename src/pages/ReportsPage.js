import { useState, useEffect } from 'react';
import { api } from '../services/api';
import '../styles/ReportsPage.css';

const ReportsPage = ({ tasks }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const calculateStats = async () => {
      setLoading(true);
      try {
        const taskStats = await api.getTaskStats();
        setStats(taskStats);
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setLoading(false);
      }
    };

    calculateStats();
  }, [tasks]);

  if (loading) {
    return (
      <div className="reports-container">
        <div className="reports-loading">Loading reports...</div>
      </div>
    );
  }

  return (
    <div className="reports-container">
      <div className="reports-header">
        <h1 className="reports-title">Task Reports & Analytics</h1>
        <p className="reports-subtitle">Get insights into your productivity</p>
      </div>

      <div className="stats-grid">
        {/* Overall Stats */}
        <div className="stat-card">
          <h3>Overall Progress</h3>
          <div className="stat-value">{stats?.total || 0}</div>
          <div className="stat-label">Total Tasks</div>
          {stats?.total > 0 && (
            <div className="completion-rate">
              {((stats.completed / stats.total) * 100).toFixed(1)}% Complete
            </div>
          )}
        </div>

        <div className="stat-card">
          <h3>Completed</h3>
          <div className="stat-value completed">{stats?.completed || 0}</div>
          <div className="stat-label">Tasks Done</div>
        </div>

        <div className="stat-card">
          <h3>Pending</h3>
          <div className="stat-value pending">{stats?.pending || 0}</div>
          <div className="stat-label">Tasks Remaining</div>
        </div>

        <div className="stat-card">
          <h3>Overdue</h3>
          <div className="stat-value overdue">{stats?.overdue || 0}</div>
          <div className="stat-label">Need Attention</div>
        </div>

        <div className="stat-card">
          <h3>Today</h3>
          <div className="stat-value today">{stats?.today || 0}</div>
          <div className="stat-label">Scheduled Today</div>
        </div>
      </div>

      {/* Priority Breakdown */}
      {stats?.by_priority && (
        <div className="priority-section">
          <h3>Priority Breakdown (Pending Tasks)</h3>
          <div className="priority-bars">
            {Object.entries(stats.by_priority).map(([priority, count]) => (
              <div key={priority} className="priority-bar">
                <div className="priority-label">
                  <span className={`priority-dot priority-${priority}`}></span>
                  {priority.charAt(0).toUpperCase() + priority.slice(1)}
                </div>
                <div className="priority-count">{count}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Project Breakdown */}
      {stats?.by_project && Object.keys(stats.by_project).length > 0 && (
        <div className="project-section">
          <h3>Project Breakdown</h3>
          <div className="project-stats">
            {Object.entries(stats.by_project).map(([project, projectStats]) => (
              <div key={project} className="project-card">
                <h4>{project === 'unassigned' ? 'No Project' : project}</h4>
                <div className="project-numbers">
                  <span>Total: {projectStats.total}</span>
                  <span>Done: {projectStats.completed}</span>
                  <span>Pending: {projectStats.pending}</span>
                </div>
                {projectStats.total > 0 && (
                  <div className="project-progress">
                    <div 
                      className="project-progress-bar"
                      style={{ 
                        width: `${(projectStats.completed / projectStats.total) * 100}%` 
                      }}
                    ></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="coming-soon">
        <h3>🚀 Coming Soon</h3>
        <ul>
          <li>Time tracking analytics</li>
          <li>Productivity trends</li>
          <li>Goal setting & tracking</li>
          <li>Mobile app companion</li>
        </ul>
      </div>
    </div>
  );
};

export default ReportsPage;