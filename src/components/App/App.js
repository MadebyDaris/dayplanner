import { useState, useEffect } from 'react';
import './App.css';
import { api } from '../../services/api';
import Header from '../Header';
import { AuthProvider, useAuth } from '../../services/AuthContext';

import Dashboard from '../../pages/Dashboard';
import AllTasksPage from '../../pages/AllTasksPage';
import ReportsPage from '../../pages/ReportsPage';
import AuthPage from '../../pages/AuthPage';


import LoadingSpinner from '../LoadingSpinner';
import ErrorMessage from '../ErrorMessage';

const useRouter = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  return { currentPage, setCurrentPage };
};

const UserProfile = ({ user, onLogout }) => {
  const [showProfile, setShowProfile] = useState(false);

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setShowProfile(!showProfile)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          color: 'white',
          padding: '0.5rem 1rem',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '0.9rem'
        }}
      >
        <span>👤</span>
        <span>{user.displayName || user.email}</span>
        <span style={{ fontSize: '0.7rem' }}>▼</span>
      </button>

      {showProfile && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          marginTop: '0.5rem',
          background: 'white',
          borderRadius: '8px',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          padding: '1rem',
          minWidth: '200px',
          zIndex: 50,
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ marginBottom: '0.75rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.75rem' }}>
            <div style={{ fontWeight: '600', color: '#1f2937' }}>
              {user.displayName || 'User'}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
              {user.email}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: '0.25rem' }}>
              Using {api.getDatabaseType()} Database
            </div>
          </div>
          
          <button
            onClick={() => {
              setShowProfile(false);
              onLogout();
            }}
            style={{
              width: '100%',
              background: '#ef4444',
              color: 'white',
              border: 'none',
              padding: '0.5rem',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '500'
            }}
          >
            🚪 Sign Out
          </button>
        </div>
      )}
    </div>
  );
};

function MainApp() {
  const { currentPage, setCurrentPage } = useRouter();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, logout } = useAuth();

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
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <Header currentPage={currentPage} setCurrentPage={setCurrentPage} />
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h1 style={{
              margin: 0,
              fontSize: '1.5rem',
              fontWeight: 'bold'
            }}>
              Day Planner
            </h1>
            <p style={{
              margin: 0,
              opacity: 0.9,
              fontSize: '0.9rem'
            }}>
              Welcome back, {user.displayName || user.email?.split('@')[0]}!
            </p>
          </div>
        </div>

      {error && <ErrorMessage message={error} onRetry={loadTasks} />}

      <UserProfile user={user} onLogout={handleLogout} />


      <main style={{ paddingBottom: '2rem' }}>
        {currentPage === 'dashboard' && (
          <Dashboard
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
      </main>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

const App = () => {
  return (
    <AuthProvider>
      <Content />
    </AuthProvider>
  );
};

const Content = () => {
  const { user } = useAuth();

  if (!user) {
    return <AuthPage />;
  }

  return <MainApp />;
}

export default App;
