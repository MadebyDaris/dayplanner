const API_URL = 'http://localhost:8000/api';

const api = {
  getTasks: async (filters = {}) => {
    try {
      const params = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, value);
        }
      });

      const url = `${API_URL}/tasks/${params.toString() ? '?' + params.toString() : ''}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      console.log('API Response:', data);
      return data.tasks || [];
    } catch (error) {
      console.error('Error fetching tasks:', error);
      return [];
    }
  },


  createTask: async (taskData) => {
    try {
      if (!taskData.title?.trim()) {
        throw new Error('Task title is required');
      }

    //  TASK STRUCTURE
    // title: '',
    // description: '',
    // scheduled_date: '',
    // has_specific_time: true,
    // scheduled_start_time: '',
    // scheduled_end_time: '',
    // duration_hours: 0,
    // duration_minutes: 30,
    // importance: 'medium',
    // project: ''

      const payload = {
        title: taskData.title.trim(),
        description: taskData.description?.trim() || '',
        scheduled_date: taskData.scheduled_date || null,
        has_specific_time: taskData.has_specific_time ?? true,
        scheduled_start_time: taskData.scheduled_start_time || null,
        scheduled_end_time: taskData.scheduled_end_time || null,
        duration_hours: taskData.duration_hours || 0,
        duration_minutes: taskData.duration_minutes || 30,
        importance: taskData.importance || 'medium',
        project: taskData.project || null
      };
      
      console.log('Creating task with payload:', payload);
      
      const response = await fetch(`${API_URL}/tasks/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Task created:', data);
      return data;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  },


  updateTask: async (taskId, updates) => {
    try {
      if (!taskId) {
        throw new Error('Task ID is required for update');
      }

      console.log(`Updating task ${taskId} with:`, updates);

      const response = await fetch(`${API_URL}/tasks/${taskId}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Task updated:', data);
      return data;
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  },

  deleteTask: async (taskId) => {
    try {
      if (!taskId) {
        throw new Error('Task ID is required for deletion');
      }

      console.log(`Deleting task ${taskId}`);

      const response = await fetch(`${API_URL}/tasks/${taskId}/`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  },

  getProjects: async () => {
    try {
      // Mock data for now - in real app this would be an API call
      return [
        { id: 'work', name: 'Work Tasks', color: '#3b82f6'},
        { id: 'personal', name: 'Personal', color: '#10b981'},
        { id: 'learning', name: 'Learning & Development', color: '#f59e0b'},
        { id: 'health', name: 'Health & Fitness', color: '#ef4444'},
        { id: 'finance', name: 'Finance & Planning', color: '#8b5cf6'},
        { id: 'home', name: 'Home & Family', color: '#06b6d4'}
      ];
    } catch (error) {
      console.error('Error fetching projects:', error);
      return [];
    }
  },

  // Create new project (for future implementation)
  createProject: async (projectData) => {
    try {
      // This would be implemented when backend supports projects
      console.log('Creating project:', projectData);
      throw new Error('Project creation not yet implemented in backend');
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  },

  // Get task statistics
  getTaskStats: async () => {
    try {
      const tasks = await api.getTasks();
      
      const stats = {
        total: tasks.length,
        completed: tasks.filter(t => t.completed).length,
        pending: tasks.filter(t => !t.completed).length,
        overdue: tasks.filter(t => t.is_overdue && !t.completed).length,
        today: tasks.filter(t => {
          const today = new Date().toISOString().split('T')[0];
          return t.scheduled_date === today;
        }).length,
        by_priority: {
          critical: tasks.filter(t => t.importance === 'critical' && !t.completed).length,
          high: tasks.filter(t => t.importance === 'high' && !t.completed).length,
          medium: tasks.filter(t => t.importance === 'medium' && !t.completed).length,
          low: tasks.filter(t => t.importance === 'low' && !t.completed).length,
        },
        by_project: {}
      };

      // Calculate stats by project
      tasks.forEach(task => {
        const project = task.project || 'unassigned';
        if (!stats.by_project[project]) {
          stats.by_project[project] = {
            total: 0,
            completed: 0,
            pending: 0
          };
        }
        
        stats.by_project[project].total++;
        if (task.completed) {
          stats.by_project[project].completed++;
        } else {
          stats.by_project[project].pending++;
        }
      });

      return stats;
    } catch (error) {
      console.error('Error calculating task stats:', error);
      return {
        total: 0,
        completed: 0,
        pending: 0,
        overdue: 0,
        today: 0,
        by_priority: { critical: 0, high: 0, medium: 0, low: 0 },
        by_project: {}
      };
    }
  },

  // Utility function to format API errors
  formatError: (error) => {
    if (error.message) {
      return error.message;
    }
    
    if (typeof error === 'string') {
      return error;
    }
    
    return 'An unexpected error occurred';
  },
};

export { api };
