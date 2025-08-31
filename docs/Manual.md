# Guide to lerarning React as well was Django
# Django + React Development Manual
## Building a Day Planner from Beginner to Advanced

This comprehensive manual covers everything you need to know to build a full-stack application using Django (backend) and React (frontend).

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [React Fundamentals](#react-fundamentals)
3. [React Hooks Deep Dive](#react-hooks-deep-dive)
4. [Django Models](#django-models)
5. [Django Views](#django-views)
6. [Django URLs and Routing](#django-urls-and-routing)
7. [Integration Examples](#integration-examples)
8. [Quick Reference](#quick-reference)
9. [Common Patterns](#common-patterns)
10. [Troubleshooting Guide](#troubleshooting-guide)

---

## Project Overview

### Architecture
```
Frontend (React) ←→ API (Django REST) ←→ Database (SQLite/PostgreSQL)
```

**React (Port 3000)**: User interface, forms, interactions
**Django (Port 8000)**: API endpoints, business logic, data storage

### Development Flow
In Django three main concepts are important:
1. **Models First**: Define your data structure
2. **Views Next**: Create API endpoints  
3. **URLs**: Connect URLs to views  

With that covered we can then work on the React integration  
**React Integration** and
**Testing**  
Finally ensuring everything works together

## This project
I will create a simple day planner app where users can:
- Create, read, update, delete tasks
- Mark tasks as completed  

This can help understand the full stack development process

---
## React Fundamentals

### Setup
Create the react app:
```bash
npx create-react-app day-planner
cd day-planner
npm start
```

### Core Concepts

#### 1. Components
Components are the building blocks of React applications.

```javascript
// Function Component
function TaskItem({ task, onToggle, onDelete }) {
  return (
    <div className="task-item">
      <span>{task.title}</span>
      <button onClick={() => onToggle(task.id)}>
        {task.completed ? '✓' : '○'}
      </button>
      <button onClick={() => onDelete(task.id)}>🗑️</button>
    </div>
  );
}
```

#### 2. Props
Props pass data from parent to child components.

```javascript
// Parent component
<TaskItem 
  task={taskObject} 
  onToggle={handleToggle} 
  onDelete={handleDelete} 
/>

// Child component receives props
function TaskItem({ task, onToggle, onDelete }) {
  // Use props here
}
```

#### 3. State with useState
State manages data that can change over time.

```javascript
import { useState } from 'react';

function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  
  const addTask = () => {
    setTasks([...tasks, { id: Date.now(), title: newTask, completed: false }]);
    setNewTask('');
  };
  
  return (
    <div>
      <input 
        value={newTask} 
        onChange={(e) => setNewTask(e.target.value)} 
      />
      <button onClick={addTask}>Add Task</button>
      {tasks.map(task => (
        <TaskItem key={task.id} task={task} />
      ))}
    </div>
  );
}
```

#### 4. Event Handling
```javascript
// onClick events
<button onClick={handleClick}>Click Me</button>
<button onClick={() => handleClickWithParam(id)}>Delete</button>

// Form events
<input onChange={(e) => setValue(e.target.value)} />
<form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
```

#### Key React Rules
- **Always use keys** in lists: `<div key={item.id}>`
- **Never mutate state directly**: Use `setState` functions
- **Components must return JSX**: Wrap multiple elements in `<div>` or `<>`
- **Props are read-only**: Don't modify props in child components

---

## React Hooks Deep Dive

Hooks are special functions that let you "hook into" React features.

### 1. useState - State Management
```javascript
const [value, setValue] = useState(initialValue);

// Examples
const [count, setCount] = useState(0);
const [user, setUser] = useState({ name: '', email: '' });
const [items, setItems] = useState([]);

// Updating state
setCount(count + 1);                    // Simple value
setCount(prev => prev + 1);             // Function update (safer)
setUser(prev => ({ ...prev, name: 'John' })); // Object update
setItems(prev => [...prev, newItem]);   // Array update
```

### 2. useEffect - Side Effects
```javascript
useEffect(() => {
  // Effect code
  return () => {
    // Cleanup code (optional)
  };
}, [dependencies]);

// Examples
// Run once on mount
useEffect(() => {
  fetchData();
}, []);

// Run when dependencies change
useEffect(() => {
  document.title = `Tasks: ${tasks.length}`;
}, [tasks]);

// Run on every render (be careful!)
useEffect(() => {
  console.log('Component rendered');
});
```

### 3. useRef - References
```javascript
const ref = useRef(initialValue);

// Examples
const inputRef = useRef(null);
const renderCount = useRef(0);

// Focus input
inputRef.current.focus();

// Count renders without causing re-render
useEffect(() => {
  renderCount.current += 1;
});
```

### 4. useMemo - Expensive Calculations
```javascript
const expensiveValue = useMemo(() => {
  return heavyCalculation(data);
}, [data]);

// Example
const taskStats = useMemo(() => {
  return {
    total: tasks.length,
    completed: tasks.filter(t => t.completed).length,
    pending: tasks.filter(t => !t.completed).length,
  };
}, [tasks]);
```

### 5. useCallback - Function Memoization
```javascript
const memoizedCallback = useCallback(() => {
  doSomething(a, b);
}, [a, b]);

// Example
const handleToggle = useCallback((taskId) => {
  setTasks(prev => prev.map(task => 
    task.id === taskId 
      ? { ...task, completed: !task.completed }
      : task
  ));
}, []);
```

### 6. useContext - Global State
```javascript
// Create context
const ThemeContext = createContext();

// Provide context
<ThemeContext.Provider value={{ theme, setTheme }}>
  <App />
</ThemeContext.Provider>

// Use context
const { theme, setTheme } = useContext(ThemeContext);
```

### Hook Rules
- **Only call at top level** - Never in loops, conditions, or nested functions
- **Only call from React functions** - Components or custom hooks
- **Call in same order every time** - React relies on call order

---

## Django backend
We now move to the Django applcation.

Models define your data structure and become database tables.

### Setup
```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows

# Install Django
pip install django djangorestframework django-cors-headers

# Create project
django-admin startproject dayplanner .
cd dayplanner
python manage.py startapp tasks

# Initial setup
python manage.py migrate
python manage.py createsuperuser
```

### Basic Model Structure
```python
# tasks/models.py
from django.db import models
from django.contrib.auth.models import User

class Task(models.Model):
    # Field types
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    scheduled_date = models.DateField()
    scheduled_time = models.TimeField()
    completed = models.BooleanField(default=False)
    
    # Choices
    PRIORITY_CHOICES = [
        ('low', 'Low Priority'),
        ('medium', 'Medium Priority'),
        ('high', 'High Priority'),
        ('urgent', 'Urgent'),
    ]
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    
    # Relationships
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tasks')
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        db_table = 'day_planner_tasks'
    
    def __str__(self):
        return f"{self.title} ({self.scheduled_date})"
    
    @property
    def is_overdue(self):
        from django.utils import timezone
        import datetime
        
        if self.completed:
            return False
            
        task_datetime = datetime.datetime.combine(self.scheduled_date, self.scheduled_time)
        task_datetime = timezone.make_aware(task_datetime)
        return task_datetime < timezone.now()
```

### Field Types Reference
```python
# Text fields
title = models.CharField(max_length=200)        # Limited text
description = models.TextField()                # Unlimited text
slug = models.SlugField()                       # URL-friendly text

# Number fields  
age = models.IntegerField()                     # Integer
price = models.DecimalField(max_digits=10, decimal_places=2)  # Decimal
rating = models.FloatField()                    # Float

# Date/Time fields
created_date = models.DateField()               # Date only
created_time = models.TimeField()               # Time only  
created_at = models.DateTimeField()             # Date and time
created_at = models.DateTimeField(auto_now_add=True)  # Set on creation
updated_at = models.DateTimeField(auto_now=True)      # Updated on save

# Boolean
is_active = models.BooleanField(default=True)
is_featured = models.BooleanField(default=False)

# File fields
image = models.ImageField(upload_to='images/')
document = models.FileField(upload_to='documents/')

# Other fields
email = models.EmailField()
url = models.URLField()
uuid = models.UUIDField()
```

### Relationships
```python
# One-to-Many (Foreign Key)
user = models.ForeignKey(User, on_delete=models.CASCADE)

# Many-to-Many
tags = models.ManyToManyField('Tag', blank=True)

# One-to-One
profile = models.OneToOneField('UserProfile', on_delete=models.CASCADE)
```

### Model Operations
```python
# Creating
task = Task.objects.create(
    title="Learn Django",
    scheduled_date="2024-01-15",
    scheduled_time="14:00",
    user=user
)

# Querying
all_tasks = Task.objects.all()
pending_tasks = Task.objects.filter(completed=False)
user_tasks = Task.objects.filter(user=user)
specific_task = Task.objects.get(id=1)

# Updating
task.completed = True
task.save()

# Deleting
task.delete()

# Complex queries
from django.utils import timezone
today_tasks = Task.objects.filter(scheduled_date=timezone.now().date())
high_priority = Task.objects.filter(priority='high')
overdue_tasks = Task.objects.filter(
    scheduled_date__lt=timezone.now().date(),
    completed=False
)
```

### Migrations
```bash
# Create migration after model changes
python manage.py makemigrations

# Apply migrations to database
python manage.py migrate

# View migration SQL
python manage.py sqlmigrate tasks 0001
```

---

## Django Views

Views process HTTP requests and return responses.

### Function-Based Views (FBV)
```python
# tasks/views.py
from django.shortcuts import render, get_object_or_404
from django.http import HttpResponse, JsonResponse
from .models import Task

def task_list(request):
    """List all tasks"""
    tasks = Task.objects.all()
    
    # Simple HTML response
    html = "<h1>Tasks</h1><ul>"
    for task in tasks:
        html += f"<li>{task.title}</li>"
    html += "</ul>"
    
    return HttpResponse(html)

def task_detail(request, task_id):
    """Show specific task"""
    task = get_object_or_404(Task, id=task_id)
    
    return HttpResponse(f"<h1>{task.title}</h1><p>{task.description}</p>")

def create_task(request):
    """Handle task creation"""
    if request.method == 'GET':
        # Show form
        return HttpResponse('<form method="post">...</form>')
    
    elif request.method == 'POST':
        # Process form
        title = request.POST.get('title')
        # ... create task logic
        return HttpResponse('Task created!')
```

### API Views (JSON Responses)
```python
import json
from django.contrib.auth.models import User

def api_task_list(request):
    """API endpoint for tasks"""
    if request.method == 'GET':
        tasks = Task.objects.all()
        data = [{
            'id': task.id,
            'title': task.title,
            'completed': task.completed,
            'scheduled_date': task.scheduled_date.strftime('%Y-%m-%d'),
            'scheduled_time': task.scheduled_time.strftime('%H:%M'),
        } for task in tasks]
        
        return JsonResponse({'tasks': data})
    
    elif request.method == 'POST':
        # Parse JSON from request body
        data = json.loads(request.body)
        
        # Create task
        user = User.objects.get(username='demo_user')  # In real app: request.user
        task = Task.objects.create(
            title=data['title'],
            scheduled_date=data['scheduled_date'],
            scheduled_time=data['scheduled_time'],
            user=user
        )
        
        return JsonResponse({
            'id': task.id,
            'title': task.title,
            'created': True
        }, status=201)

def api_task_detail(request, task_id):
    """API endpoint for specific task"""
    task = get_object_or_404(Task, id=task_id)
    
    if request.method == 'GET':
        return JsonResponse({
            'id': task.id,
            'title': task.title,
            'description': task.description,
            'completed': task.completed,
        })
    
    elif request.method == 'PUT':
        data = json.loads(request.body)
        task.title = data.get('title', task.title)
        task.completed = data.get('completed', task.completed)
        task.save()
        
        return JsonResponse({'updated': True})
    
    elif request.method == 'DELETE':
        task.delete()
        return JsonResponse({'deleted': True})
```

### Class-Based Views (CBV)
```python
from django.views import View

class TaskView(View):
    def get(self, request, task_id=None):
        if task_id:
            task = get_object_or_404(Task, id=task_id)
            return JsonResponse({'task': task.title})
        else:
            tasks = Task.objects.all()
            return JsonResponse({'tasks': [task.title for task in tasks]})
    
    def post(self, request):
        # Handle creation
        pass
    
    def put(self, request, task_id):
        # Handle updates
        pass
    
    def delete(self, request, task_id):
        # Handle deletion
        pass
```

### Request Object
```python
def my_view(request):
    # Request information
    method = request.method              # GET, POST, PUT, DELETE
    path = request.path                  # /tasks/123/
    full_url = request.build_absolute_uri()  # http://localhost:8000/tasks/123/
    
    # Parameters
    url_params = request.GET             # ?name=value&age=25
    form_data = request.POST             # Form submission data
    json_data = request.body             # Raw request body
    
    # Headers
    user_agent = request.META.get('HTTP_USER_AGENT')
    content_type = request.META.get('CONTENT_TYPE')
    
    # Files (if any)
    uploaded_files = request.FILES
```

### Error Handling
```python
from django.http import Http404

def safe_task_view(request, task_id):
    try:
        task = Task.objects.get(id=task_id)
        return JsonResponse({'task': task.title})
    except Task.DoesNotExist:
        return JsonResponse({'error': 'Task not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
```

---

## Django URLs and Routing

URLs connect HTTP requests to view functions.

### Project-Level URLs
```python
# dayplanner/urls.py
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('tasks/', include('tasks.urls')),
    path('', home_view, name='home'),
]
```

### App-Level URLs
```python
# tasks/urls.py
from django.urls import path
from . import views

app_name = 'tasks'

urlpatterns = [
    # Static URLs
    path('', views.task_list, name='list'),
    path('create/', views.create_task, name='create'),
    
    # Dynamic URLs
    path('<int:task_id>/', views.task_detail, name='detail'),
    path('<int:task_id>/edit/', views.edit_task, name='edit'),
    path('<int:task_id>/delete/', views.delete_task, name='delete'),
    
    # API endpoints
    path('api/', views.api_task_list, name='api-list'),
    path('api/<int:task_id>/', views.api_task_detail, name='api-detail'),
    
    # Complex patterns
    path('user/<str:username>/', views.user_tasks, name='user-tasks'),
    path('date/<int:year>/<int:month>/<int:day>/', views.tasks_by_date, name='by-date'),
    path('priority/<str:level>/', views.tasks_by_priority, name='by-priority'),
]
```

### URL Parameter Types
```python
<int:var_name>     # Integers: 123, 456
<str:var_name>     # Strings: hello, world  
<slug:var_name>    # Slugs: hello-world, my_task
<uuid:var_name>    # UUIDs: 550e8400-e29b-41d4-a716-446655440000
<path:var_name>    # Paths: docs/readme.txt
```

### Named URLs and Reverse Lookups
```python
# In views
from django.urls import reverse
from django.shortcuts import redirect

def create_task(request):
    # ... create task ...
    return redirect('tasks:detail', task_id=task.id)

# Generate URLs
list_url = reverse('tasks:list')                    # /tasks/
detail_url = reverse('tasks:detail', args=[123])    # /tasks/123/
```

### Query Parameters
```python
# URL: /tasks/?status=pending&priority=high
def filtered_tasks(request):
    status = request.GET.get('status')      # 'pending'
    priority = request.GET.get('priority')  # 'high'
    
    tasks = Task.objects.all()
    if status == 'pending':
        tasks = tasks.filter(completed=False)
    if priority:
        tasks = tasks.filter(priority=priority)
```

### Common URL Patterns
```python
# CRUD operations
path('', views.list_view),              # List all
path('create/', views.create_view),     # Create new
path('<int:id>/', views.detail_view),   # View one
path('<int:id>/edit/', views.edit_view), # Edit
path('<int:id>/delete/', views.delete_view), # Delete

# API patterns
path('api/tasks/', views.api_list),           # GET (list), POST (create)
path('api/tasks/<int:id>/', views.api_detail), # GET, PUT, DELETE

# Filtering patterns
path('search/', views.search),                     # /tasks/search/?q=term
path('category/<str:cat>/', views.by_category),    # /tasks/category/work/
path('date/<int:year>/<int:month>/', views.by_month), # /tasks/date/2024/01/
```

---

## Integration Examples

### Django Settings Configuration
```python
# dayplanner/settings.py
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Third party
    'rest_framework',
    'corsheaders',
    
    # Local apps
    'tasks',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Must be first
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# CORS settings for React
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

# REST Framework settings
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20
}
```

### React API Service
```javascript
// api.js - Centralized API communication
class TaskAPI {
  static BASE_URL = 'http://localhost:8000/api';
  
  static async handleResponse(response) {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Network error' }));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }
    return response.json();
  }
  
  // GET /api/tasks/
  static async getTasks(filters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, value);
      }
    });
    
    const url = `${this.BASE_URL}/tasks/${params.toString() ? '?' + params.toString() : ''}`;
    const response = await fetch(url);
    return this.handleResponse(response);
  }
  
  // POST /api/tasks/
  static async createTask(taskData) {
    const response = await fetch(`${this.BASE_URL}/tasks/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData)
    });
    return this.handleResponse(response);
  }
  
  // PUT /api/tasks/{id}/
  static async updateTask(id, taskData) {
    const response = await fetch(`${this.BASE_URL}/tasks/${id}/`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData)
    });
    return this.handleResponse(response);
  }
  
  // DELETE /api/tasks/{id}/
  static async deleteTask(id) {
    const response = await fetch(`${this.BASE_URL}/tasks/${id}/`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return true;
  }
}
```

### React Component with Django Integration
```javascript
import React, { useState, useEffect } from 'react';

function TaskManager() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Load tasks on component mount
  useEffect(() => {
    loadTasks();
  }, []);
  
  const loadTasks = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await TaskAPI.getTasks();
      setTasks(data.results || data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const createTask = async (taskData) => {
    try {
      const newTask = await TaskAPI.createTask(taskData);
      setTasks(prev => [newTask, ...prev]);
    } catch (err) {
      setError(err.message);
    }
  };
  
  const updateTask = async (id, updates) => {
    try {
      const updatedTask = await TaskAPI.updateTask(id, updates);
      setTasks(prev => prev.map(task => 
        task.id === id ? updatedTask : task
      ));
    } catch (err) {
      setError(err.message);
    }
  };
  
  const deleteTask = async (id) => {
    try {
      await TaskAPI.deleteTask(id);
      setTasks(prev => prev.filter(task => task.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };
  
  return (
    <div>
      <h1>Task Manager</h1>
      {error && <div className="error">{error}</div>}
      {loading && <div>Loading...</div>}
      
      <TaskForm onSubmit={createTask} />
      
      <TaskList 
        tasks={tasks}
        onUpdate={updateTask}
        onDelete={deleteTask}
      />
    </div>
  );
}
```

---

## Quick Reference

### Django Commands
```bash
# Project setup
django-admin startproject projectname
python manage.py startapp appname

# Database
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser

# Development
python manage.py runserver
python manage.py shell
python manage.py collectstatic

# Debugging
python manage.py check
python manage.py showmigrations
python manage.py dbshell
```

### React Commands
```bash
# Setup
npx create-react-app appname
cd appname
npm start

# Dependencies
npm install package-name
npm uninstall package-name

# Build for production
npm run build
```

### Common Django Imports
```python
# Models
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

# Views
from django.shortcuts import render, get_object_or_404, redirect
from django.http import HttpResponse, JsonResponse, Http404
from django.views import View
from django.urls import reverse

# URLs
from django.urls import path, include, re_path
```

### Common React Imports
```javascript
// Core React
import React, { useState, useEffect, useCallback, useMemo } from 'react';

// For routing (if using React Router)
import { BrowserRouter, Route, Switch, Link } from 'react-router-dom';
```

---

## Common Patterns

### CRUD Operations Pattern

#### Django Views
```python
def task_crud(request, task_id=None):
    if request.method == 'GET':
        if task_id:
            # READ one
            task = get_object_or_404(Task, id=task_id)
            return JsonResponse({'task': task.title})
        else:
            # READ all
            tasks = Task.objects.all()
            return JsonResponse({'tasks': [task.title for task in tasks]})
    
    elif request.method == 'POST':
        # CREATE
        data = json.loads(request.body)
        task = Task.objects.create(**data)
        return JsonResponse({'id': task.id})
    
    elif request.method == 'PUT':
        # UPDATE
        task = get_object_or_404(Task, id=task_id)
        data = json.loads(request.body)
        for key, value in data.items():
            setattr(task, key, value)
        task.save()
        return JsonResponse({'updated': True})
    
    elif request.method == 'DELETE':
        # DELETE
        task = get_object_or_404(Task, id=task_id)
        task.delete()
        return JsonResponse({'deleted': True})
```

#### React CRUD Hook
```javascript
function useTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      const data = await TaskAPI.getTasks();
      setTasks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);
  
  const createTask = useCallback(async (taskData) => {
    const newTask = await TaskAPI.createTask(taskData);
    setTasks(prev => [newTask, ...prev]);
    return newTask;
  }, []);
  
  const updateTask = useCallback(async (id, updates) => {
    const updatedTask = await TaskAPI.updateTask(id, updates);
    setTasks(prev => prev.map(task => 
      task.id === id ? updatedTask : task
    ));
    return updatedTask;
  }, []);
  
  const deleteTask = useCallback(async (id) => {
    await TaskAPI.deleteTask(id);
    setTasks(prev => prev.filter(task => task.id !== id));
  }, []);
  
  return {
    tasks,
    loading,
    error,
    loadTasks,
    createTask,
    updateTask,
    deleteTask
  };
}
```

### Form Handling Pattern

#### Django Form Processing
```python
def handle_form(request):
    if request.method == 'POST':
        # Get form data
        title = request.POST.get('title')
        description = request.POST.get('description')
        
        # Validate
        errors = {}
        if not title:
            errors['title'] = 'Title is required'
        if len(title) < 3:
            errors['title'] = 'Title must be at least 3 characters'
            
        if errors:
            return JsonResponse({'errors': errors}, status=400)
        
        # Save if valid
        task = Task.objects.create(title=title, description=description)
        return JsonResponse({'success': True, 'id': task.id})
```

#### React Form Hook
```javascript
function useForm(initialValues, validationRules) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  
  const handleChange = (name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));