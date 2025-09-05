import { useState, useEffect } from 'react';
import './App.css';
import { api } from '../../services/api';
import SideBar from '../SideBar';
import { AuthProvider, useAuth } from '../../services/AuthContext';

import Dashboard from '../../pages/Dashboard';
import AllTasksPage from '../../pages/AllTasksPage';
import AgendaPage from '../../pages/AgendaPage';
import ReportsPage from '../../pages/ReportsPage';
import AuthPage from '../../pages/AuthPage';
import TasksView from '../../pages/TasksView';

import LoadingSpinner from '../LoadingSpinner';
import ErrorMessage from '../ErrorMessage';
import { ThemeProvider } from '../../services/ThemeContext';

const useRouter = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  return { currentPage, setCurrentPage };
};

function MainApp() {
  const { currentPage, setCurrentPage } = useRouter();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, userProfile, currentTeam, logout, userTeams, switchTeam } = useAuth();

  const loadTasks = async () => {
    setLoading(true);
    setError('');

    try {
      const fetchedTasks = await api.getTasks();
      setTasks(fetchedTasks);
    } catch (error) {
      console.error('Failed to load tasks:', error);
      setError('Failed to load tasks. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setTasks([]);
      setCurrentPage('dashboard');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  useEffect(() => {
    if (user) {
      loadTasks();
    } else {
      setLoading(false);
      setTasks([]);
    }
  }, [user]);

  if (loading) {
    return <LoadingSpinner />;
  }
  
  return (
    <div className="app-container">
      {/* Left Sidebar */}
      <SideBar 
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        user={{
          name: userProfile?.displayName || user.displayName || user.email?.split('@')[0] || 'User',
          role: currentTeam ? 'Team Member' : 'Individual User',
          company: currentTeam?.name || 'Personal',
          photoURL: userProfile?.photoURL,
          email: userProfile?.email
        }}
        onLogout={handleLogout}
        currentTeam={currentTeam}
        userTeams={userTeams}
        switchTeam={switchTeam}
      />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col main-content">
        {error && <ErrorMessage message={error} onRetry={loadTasks} />}

        <main className="overflow-auto">
          {currentPage === 'dashboard' && (
            <Dashboard
              tasks={tasks}
              onTaskUpdated={loadTasks}
              onTaskDeleted={loadTasks}
              loadTasks={loadTasks}
            />
          )}
          
          {currentPage === 'tasks' && (
            <TasksView
              tasks={tasks}
              onTaskUpdated={loadTasks}
              onTaskDeleted={loadTasks}
              loadTasks={loadTasks}
            />
          )}
          
          {currentPage === 'all-tasks' && (
            <AllTasksPage
              tasks={tasks}
              onTaskUpdated={loadTasks}
              onTaskDeleted={loadTasks}
            />
          )}
          
          {currentPage === 'reports' && (
            <ReportsPage
              tasks={tasks}
            />
          )}

          {currentPage === 'agenda' && (
            <AgendaPage
              tasks={tasks}
              onTaskUpdated={loadTasks}
              onTaskDeleted={loadTasks}
              loadTasks={loadTasks}
            />
          )}

          {currentPage === 'team' && (
            <div className="team-placeholder">
              <div className="placeholder-content">
                <h1>Team Collaboration</h1>
                <p>Team features coming soon!</p>
                {currentTeam && (
                  <div className="current-team-info">
                    <h3>Current Team: {currentTeam.name}</h3>
                    <p>{currentTeam.description}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};


const App = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Content />
      </ThemeProvider>
    </AuthProvider>
  );
};

const Content = () => {
  const { user } = useAuth();

  if (!user) {
    return <AuthPage />;
  }

  return <MainApp />;
};

export default App;