import { useState } from 'react';
import TaskForm from '../components/TaskForm';
import TaskItem from '../components/TaskItem';
import '../styles/Dashboard.css';
import { Plus, TrendingUp, Calendar, AlertTriangle, CheckCircle } from 'lucide-react';


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
    { 
      label: 'Total Tasks', 
      value: stats.total, 
      color: '#3b82f6',
      icon: TrendingUp,
      change: '+12%'
    },
    { 
      label: "Today's Tasks", 
      value: stats.today, 
      color: '#10b981',
      icon: Calendar,
      change: '+5%'
    },
    { 
      label: 'Pending', 
      value: stats.pending, 
      color: '#f59e0b',
      icon: CheckCircle,
      change: '-8%'
    },
    { 
      label: 'Overdue', 
      value: stats.overdue, 
      color: '#dc2626',
      icon: AlertTriangle,
      change: '+3%'
    },
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
          
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={18} />
            Add New Task
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                    <p className={`text-sm mt-2 ${stat.change.startsWith('+') && !stat.label.includes('Overdue') ? 'text-green-600' : stat.change.startsWith('-') ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.change} from last week
                    </p>
                  </div>
                  <div 
                    className="p-3 rounded-full"
                    style={{ backgroundColor: stat.color + '20' }}
                  >
                    <Icon size={24} style={{ color: stat.color }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

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

        {/* Tasks Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Today's Tasks */}
          <section className="bg-white rounded-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Today's Tasks
                </h2>
                <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                  {todayTasks.length}
                </span>
              </div>
            </div>
            
            <div className="p-6">
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
          </section>

          {/* Overdue Tasks */}
          {overdueTasks.length > 0 && (
            <section className="bg-white rounded-lg border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-red-600">
                    Overdue Tasks
                  </h2>
                  <span className="bg-red-100 text-red-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                    {overdueTasks.length}
                  </span>
                </div>
              </div>
              
              <div className="p-6">
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
              </div>
            </section>
          )}

          {/* Upcoming Tasks */}
          {upcomingTasks.length > 0 && (
            <section className="bg-white rounded-lg border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Upcoming Tasks
                  </h2>
                  <span className="bg-green-100 text-green-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                    {upcomingTasks.length}
                  </span>
                </div>
              </div>
              
              <div className="p-6">
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
              </div>
            </section>
          )}

          {/* Quick Stats */}
          {!overdueTasks.length && !upcomingTasks.length && (
            <section className="bg-white rounded-lg border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Quick Stats
                </h2>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Completion Rate</span>
                    <span className="font-semibold text-gray-900">
                      {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ 
                        width: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%` 
                      }}
                    ></div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
                      <div className="text-xs text-gray-500">Completed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
                      <div className="text-xs text-gray-500">Pending</div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;