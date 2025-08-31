from django.http import JsonResponse
from .models import Task
from django.shortcuts import get_object_or_404
import json

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
        data = json.loads(request.body)
        task = Task.objects.create(
            title=data['title'],
            scheduled_date=data['scheduled_date'],
            scheduled_time=data['scheduled_time'],
            user=request.user
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
