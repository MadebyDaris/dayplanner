import { useState, useEffect } from 'react';
import './App.css';
import { api } from '../../services/api';
import Header from '../Header';
import Dashboard from '../../pages/Dashboard';
import AllTasksPage from '../../pages/AllTasksPage';
import LoadingSpinner from '../LoadingSpinner';
import ErrorMessage from '../ErrorMessage';

const useRouter = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  return { currentPage, setCurrentPage };
};

function DayPlanner() {
  const { currentPage, setCurrentPage } = useRouter();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  useEffect(() => {
    loadTasks();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }
  
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <Header currentPage={currentPage} setCurrentPage={setCurrentPage} />
      
      {error && <ErrorMessage message={error} onRetry={loadTasks} />}

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
      </main>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default DayPlanner;
