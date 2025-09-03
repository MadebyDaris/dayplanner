import {
    collection,
    doc,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    serverTimestamp,
} from 'firebase/firestore';
import {
    db
} from './firebase';

const TASKS_COLLECTION = 'tasks';

export const firebaseApi = {
    // Get all tasks for a user
    getTasks: async (userId, filters = {}) => {
        try {
            if (!userId) {
                throw new Error('User ID is required');
            }

            let tasksQuery = query(
                collection(db, TASKS_COLLECTION),
                where('userId', '==', userId),
                orderBy('createdAt', 'desc')
            );

            // Apply filters
            if (filters.project) {
                tasksQuery = query(tasksQuery, where('project', '==', filters.project));
            }

            if (filters.importance) {
                tasksQuery = query(tasksQuery, where('importance', '==', filters.importance));
            }

            if (filters.completed !== undefined) {
                const isCompleted = filters.completed === 'true' || filters.completed === true;
                tasksQuery = query(tasksQuery, where('completed', '==', isCompleted));
            }

            const querySnapshot = await getDocs(tasksQuery);
            const tasks = [];

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                tasks.push({
                    id: doc.id,
                    ...data,
                    // Convert Firebase timestamps to ISO strings
                    createdAt: data.createdAt ? .toDate().toISOString() || new Date().toISOString(),
                    updatedAt: data.updatedAt ? .toDate().toISOString() || new Date().toISOString(),
                    // Calculate is_overdue property
                    is_overdue: calculateIsOverdue(data)
                });
            });

            console.log(`Retrieved ${tasks.length} tasks from Firebase`);
            return tasks;
        } catch (error) {
            console.error('Error fetching tasks from Firebase:', error);
            throw error;
        }
    },

    // Create a new task
    createTask: async (userId, taskData) => {
        try {
            if (!userId) {
                throw new Error('User ID is required');
            }

            if (!taskData.title ? .trim()) {
                throw new Error('Task title is required');
            }

            const newTask = {
                ...taskData,
                userId,
                title: taskData.title.trim(),
                description: taskData.description ? .trim() || '',
                completed: false,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                // Set default values
                importance: taskData.importance || 'medium',
                has_specific_time: taskData.has_specific_time ? ? true,
                duration_hours: taskData.duration_hours || 0,
                duration_minutes: taskData.duration_minutes || 30,
            };

            console.log('Creating task in Firebase:', newTask);
            const docRef = await addDoc(collection(db, TASKS_COLLECTION), newTask);

            // Return the created task with the new ID
            return {
                id: docRef.id,
                ...newTask,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                is_overdue: calculateIsOverdue(newTask)
            };
        } catch (error) {
            console.error('Error creating task in Firebase:', error);
            throw error;
        }
    },

    // Update a task
    updateTask: async (taskId, updates) => {
        try {
            if (!taskId) {
                throw new Error('Task ID is required for update');
            }

            const updateData = {
                ...updates,
                updatedAt: serverTimestamp()
            };

            console.log(`Updating task ${taskId} in Firebase:`, updateData);

            const taskRef = doc(db, TASKS_COLLECTION, taskId);
            await updateDoc(taskRef, updateData);

            // Return the updated task data
            return {
                id: taskId,
                ...updates,
                updatedAt: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error updating task in Firebase:', error);
            throw error;
        }
    },

    // Delete a task
    deleteTask: async (taskId) => {
        try {
            if (!taskId) {
                throw new Error('Task ID is required for deletion');
            }

            console.log(`Deleting task ${taskId} from Firebase`);

            const taskRef = doc(db, TASKS_COLLECTION, taskId);
            await deleteDoc(taskRef);

            return true;
        } catch (error) {
            console.error('Error deleting task from Firebase:', error);
            throw error;
        }
    },

    // Get task statistics
    getTaskStats: async (userId) => {
        try {
            const tasks = await firebaseApi.getTasks(userId);

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
                        pending: 0,
                        project_info: getProjectInfo(task.project)
                    };
                }

                stats.by_project[project].total++;
                if (task.completed) {
                    stats.by_project[project].completed++;
                } else {
                    stats.by_project[project].pending++;
                }
            });

            stats.completion_rate = stats.total > 0 ?
                Math.round((stats.completed / stats.total) * 100 * 10) / 10 : 0;

            return stats;
        } catch (error) {
            console.error('Error calculating task stats from Firebase:', error);
            throw error;
        }
    }
};

// Helper function to get project information
function getProjectInfo(project) {
    if (!project) return null;

    const projects = {
        'work': {
            name: 'Work Tasks',
            color: '#3b82f6',
            icon: '💼'
        },
        'personal': {
            name: 'Personal',
            color: '#10b981',
            icon: '👤'
        },
        'learning': {
            name: 'Learning & Development',
            color: '#f59e0b',
            icon: '📚'
        },
        'health': {
            name: 'Health & Fitness',
            color: '#ef4444',
            icon: '🏃'
        },
        'finance': {
            name: 'Finance & Planning',
            color: '#8b5cf6',
            icon: '💰'
        },
        'home': {
            name: 'Home & Family',
            color: '#06b6d4',
            icon: '🏠'
        }
    };

    return projects[project] || {
        name: project.charAt(0).toUpperCase() + project.slice(1),
        color: '#6b7280',
        icon: '📁'
    };
} // calculate if a task is overdue
function calculateIsOverdue(taskData) {
    if (taskData.completed || !taskData.scheduled_date) {
        return false;
    }

    const today = new Date();
    const scheduledDate = new Date(taskData.scheduled_date);

    if (scheduledDate < today) {
        return true;
    }

    if (
        scheduledDate.toDateString() === today.toDateString() &&
        taskData.has_specific_time &&
        taskData.scheduled_end_time
    ) {
        const currentTime = today.toTimeString().substring(0, 5);
        return taskData.scheduled_end_time < currentTime;
    }

    return false;
}