import { useState } from 'react';
import TaskForm from '../components/TaskForm';
import TaskItem from '../components/TaskItem';
import Card from '../components/Card';
import '../styles/Dashboard.css';
import '../styles/TeamManagement.css';
import { Plus, TrendingUp, Calendar, AlertTriangle, CheckCircle, Users } from 'lucide-react';
import { useAuth } from '../services/AuthContext';

const TeamManagement = () => {
    const { createTeam, joinTeam, leaveTeam, currentTeam, user } = useAuth();
    const [showMenu, setShowMenu] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [teamName, setTeamName] = useState('');
    const [teamId, setTeamId] = useState('');

    const handleCreateTeam = async () => {
        if (!teamName.trim()) return;
        await createTeam({ name: teamName }, user.uid);
        setShowCreateModal(false);
        setTeamName('');
    };

    const handleJoinTeam = async () => {
        if (!teamId.trim()) return;
        await joinTeam(teamId, user.uid);
        setShowJoinModal(false);
        setTeamId('');
    };

    const handleLeaveTeam = async () => {
        if (window.confirm(`Are you sure you want to leave ${currentTeam.name}?`)) {
            await leaveTeam(currentTeam.id, user.uid);
        }
    };

    return (
        <div className="team-management-dropdown">
            <button onClick={() => setShowMenu(!showMenu)} className="team-management-button">
                <Users size={18} />
                <span>Team</span>
            </button>
            {showMenu && (
                <div className="team-management-menu">
                    <button onClick={() => { setShowCreateModal(true); setShowMenu(false); }} className="team-management-menu-item">Create Team</button>
                    <button onClick={() => { setShowJoinModal(true); setShowMenu(false); }} className="team-management-menu-item">Join Team</button>
                    {currentTeam && <button onClick={handleLeaveTeam} className="team-management-menu-item">Leave Team</button>}
                </div>
            )}

            {showCreateModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3 className="modal-title">Create a New Team</h3>
                        <input type="text" value={teamName} onChange={(e) => setTeamName(e.target.value)} placeholder="Team Name" className="search-input" />
                        <div className="modal-actions">
                            <button onClick={() => setShowCreateModal(false)} className="add-task-btn">Cancel</button>
                            <button onClick={handleCreateTeam} className="add-task-btn">Create</button>
                        </div>
                    </div>
                </div>
            )}

            {showJoinModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3 className="modal-title">Join an Existing Team</h3>
                        <input type="text" value={teamId} onChange={(e) => setTeamId(e.target.value)} placeholder="Team ID" className="search-input" />
                        <div className="modal-actions">
                            <button onClick={() => setShowJoinModal(false)} className="add-task-btn">Cancel</button>
                            <button onClick={handleJoinTeam} className="add-task-btn">Join</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

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

  const dashboardCards = [
    {
      id: 'stats',
      title: 'Quick Stats',
      component: () => (
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-xs text-gray-500">Total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <div className="text-xs text-gray-500">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
            <div className="text-xs text-gray-500">Pending</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
            <div className="text-xs text-gray-500">Overdue</div>
          </div>
        </div>
      )
    },
    {
      id: 'today',
      title: "Today's Tasks",
      component: () => (
        <div>
          {todayTasks.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="mx-auto h-12 w-12 text-gray-300" />
              <p className="mt-2 text-sm text-gray-500">No tasks scheduled for today</p>
            </div>
          ) : (
            <div className="space-y-4">
              {todayTasks.slice(0, 3).map(task => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onTaskUpdated={onTaskUpdated}
                  onTaskDeleted={onTaskDeleted}
                  showActions={true}
                />
              ))}
              {todayTasks.length > 3 && (
                <p className="text-sm text-gray-500 text-center pt-2">
                  +{todayTasks.length - 3} more tasks
                </p>
              )}
            </div>
          )}
        </div>
      )
    },
    {
      id: 'overdue',
      title: 'Overdue Tasks',
      component: () => (
        <div>
          {overdueTasks.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="mx-auto h-12 w-12 text-gray-300" />
              <p className="mt-2 text-sm text-gray-500">No overdue tasks</p>
            </div>
          ) : (
            <div className="space-y-4">
              {overdueTasks.slice(0, 3).map(task => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onTaskUpdated={onTaskUpdated}
                  onTaskDeleted={onTaskDeleted}
                  showActions={true}
                />
              ))}
              {overdueTasks.length > 3 && (
                <p className="text-sm text-gray-500 text-center pt-2">
                  +{overdueTasks.length - 3} more overdue tasks
                </p>
              )}
            </div>
          )}
        </div>
      )
    },
    {
      id: 'upcoming',
      title: 'Upcoming Tasks',
      component: () => (
        <div>
          {upcomingTasks.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="mx-auto h-12 w-12 text-gray-300" />
              <p className="mt-2 text-sm text-gray-500">No upcoming tasks</p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingTasks.slice(0, 3).map(task => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onTaskUpdated={onTaskUpdated}
                  onTaskDeleted={onTaskDeleted}
                  showActions={true}
                />
              ))}
              {upcomingTasks.length > 3 && (
                <p className="text-sm text-gray-500 text-center pt-2">
                  +{upcomingTasks.length - 3} more upcoming tasks
                </p>
              )}
            </div>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="flex-1 flex flex-col">
      {/* Dashboard Header */}
      <div className="bg-white p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back! Here's your task overview.</p>
          </div>
          
          <div className="flex items-center gap-4">
            <TeamManagement />
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={18} />
              Add New Task
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {/* Add Task Form */}
        {showForm && (
          <div className="bg-white rounded-lg border border-gray-200 mb-8">
            <TaskForm 
              onTaskCreated={() => {
                loadTasks();
                setShowForm(false);
              }}
              onCancel={() => setShowForm(false)}
            />
          </div>
        )}

        {/* Dashboard Grid */}
        <div className="dashboard-grid">
          {dashboardCards.map(card => (
            <Card key={card.id} title={card.title}>
              <card.component />
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;