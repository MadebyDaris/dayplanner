from django.shortcuts import render, get_object_or_404
from django.http import HttpResponse, JsonResponse
from django.views.decorators.http import require_http_methods
from django.views import View
from django.contrib.auth.models import User
from .models import Task
import json
from django.utils import timezone

def helloworld(request):
    return HttpResponse("Hello, World! This is Django!")

def current_time(request):
    """
    A view that shows current time
    """
    now = timezone.now()
    html = f"<h1>Current time: {now}</h1>"
    return HttpResponse(html)

def task_list(request):
    """
    A view that lists all tasks with their status
    """
    all_tasks = Task.objects.all()

    pending_tasks = Task.objects.filter(completed=False)
    completed_count = Task.objects.filter(completed=True).count()

    html = "<h1>Task List</h1><ul>"
    for task in all_tasks:
        status = "done" if task.completed else "pending"
        html += f"<li>{status} {task.title} - {task.scheduled_date}</li>"
    html += "</ul>"
    html += f"<p>Total completed: {completed_count}</p>"

    return HttpResponse(html)

def task_detail(request, task_id):
    """
    View to show a specific task
    - task_id comes from the URL pattern
    - get_object_or_404 gets the object or returns 404 if not found
    """
    task = get_object_or_404(Task, id=task_id)
    
    html = f"""
    <h1>{task.title}</h1>
    <p><strong>Description:</strong> {task.description or 'No description'}</p>
    <p><strong>Date:</strong> {task.scheduled_date}</p>
    <p><strong>Time:</strong> {task.scheduled_time}</p>
    <p><strong>Priority:</strong> {task.get_priority_display()}</p>
    <p><strong>Status:</strong> {'Completed' if task.completed else 'Pending'}</p>
    <p><strong>Created:</strong> {task.created_at}</p>
    
    <a href="/tasks/">← Back to task list</a>
    """
    
    return HttpResponse(html)

@require_http_methods(["POST", "GET"])
def create_task(request):
    """
    Handle both GET (show form) and POST (process form)
    This demonstrates how views handle different HTTP methods
    """

    if request.method == "GET":
        html = """
        <h1>Create New Task</h1>
        <form method="post">
            <p>
                <label>Title:</label><br>
                <input type="text" name="title" required>
            </p>
            <p>
                <label>Description:</label><br>
                <textarea name="description"></textarea>
            </p>
            <p>
                <label>Date:</label><br>
                <input type="date" name="scheduled_date" required>
            </p>
            <p>
                <label>Time:</label><br>
                <input type="time" name="scheduled_time" required>
            </p>
            <p>
                <label>Priority:</label><br>
                <select name="priority">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                </select>
            </p>
            <button type="submit">Create Task</button>
        </form>
        <a href="/tasks/">← Back to task list</a>
        """
        return HttpResponse(html)
    elif request.method == "POST":
        title = request.POST.get('title')
        description = request.POST.get('description')
        scheduled_date = request.POST.get('scheduled_date')
        scheduled_time = request.POST.get('scheduled_time')
        priority = request.POST.get('priority', 'medium')
        
        # Basic validation
        if not title or not scheduled_date or not scheduled_time:
            return HttpResponse("Error: Missing required fields", status=400)
        
        # Get a default user (in real app, this would be request.user)
        user, created = User.objects.get_or_create(
            username='demo_user',
            defaults={'email': 'demo@example.com'}
        )
        
        # Create the task
        task = Task.objects.create(
            title=title,
            description=description,
            scheduled_date=scheduled_date,
            scheduled_time=scheduled_time,
            priority=priority,
            user=user
        )
        
        # Redirect to task detail (we'll learn about redirects later)
        html = f"""
        <h1>Task Created!</h1>
        <p>Task "{task.title}" was created successfully.</p>
        <a href="/tasks/{task.id}/">View task</a> |
        <a href="/tasks/">Back to task list</a> |
        <a href="/tasks/create/">Create another</a>
        """
        return HttpResponse(html)


def task_delete(request, task_id):
    """
    Demonstrate error handling in views
    """
    try:
        task = get_object_or_404(Task, id=task_id)
        
        if request.method == 'POST':
            task_title = task.title  # Save for confirmation message
            task.delete()
            return HttpResponse(f'Task "{task_title}" deleted successfully! <a href="/tasks/">Back to list</a>')
        
        # GET request - show confirmation
        html = f"""
        <h1>Delete Task</h1>
        <p>Are you sure you want to delete "{task.title}"?</p>
        <form method="post">
            <button type="submit" style="background: red; color: white;">Yes, Delete</button>
            <a href="/tasks/{task.id}/">Cancel</a>
        </form>
        """
        return HttpResponse(html)
        
    except Exception as e:
        return HttpResponse(f"Error: {str(e)}", status=500)

def edit_task(request, task_id):
    """
    Edit an existing task
    """
    task = get_object_or_404(Task, id=task_id)
    
    if request.method == "POST":
        title = request.POST.get('title')
        description = request.POST.get('description')
        scheduled_date = request.POST.get('scheduled_date')
        scheduled_time = request.POST.get('scheduled_time')
        priority = request.POST.get('priority', 'medium')
        
        # Basic validation
        if not title or not scheduled_date or not scheduled_time:
            return HttpResponse("Error: Missing required fields", status=400)
        
        # Update task fields
        task.title = title
        task.description = description
        task.scheduled_date = scheduled_date
        task.scheduled_time = scheduled_time
        task.priority = priority
        task.save()
        
        return HttpResponse(f"Task '{task.title}' updated successfully! <a href='/tasks/{task.id}/'>View Task</a>")
    
    # GET request - show form with current values
    html = f"""
    <h1>Edit Task</h1>
    <form method="post">
        <p>
            <label>Title:</label><br>
            <input type="text" name="title" value="{task.title}" required>
        </p>
        <p>
            <label>Description:</label><br>
            <textarea name="description">{task.description or ''}</textarea>
        </p>
        <p>
            <label>Date:</label><br>
            <input type="date" name="scheduled_date" value="{task.scheduled_date}" required>
        </p>
        <p>
            <label>Time:</label><br>
            <input type="time" name="scheduled_time" value="{task.scheduled_time}" required>
        </p>
        <p>
            <label>Priority:</label><br>
            <select name="priority">
                <option value="low" {"selected" if task.priority == "low" else ""}>Low</option>
                <option value="medium" {"selected" if task.priority == "medium" else ""}>Medium</option>
                <option value="high" {"selected" if task.priority == "high" else ""}>High</option>
                <option value="urgent" {"selected" if task.priority == "urgent" else ""}>Urgent</option>
            </select>
        </p>
        <button type="submit">Update Task</button>
    </form>
    <a href="/tasks/{task.id}/">← Back to task detail</a>
    """
    return HttpResponse(html)

def toggle_task(request, task_id):
    """
    Toggle the completed status of a task
    """
    task = get_object_or_404(Task, id=task_id)
    task.completed = not task.completed
    task.save()
    status = "completed" if task.completed else "marked as pending"
    return HttpResponse(f'Task "{task.title}" {status}. <a href="/tasks/">Back to list</a>')
