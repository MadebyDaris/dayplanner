from django.views.decorators.csrf import ensure_csrf_cookie
from django.contrib.auth.models import User
from django.http import JsonResponse
from .models import Task
from django.shortcuts import get_object_or_404
import json

from django.utils.decorators import method_decorator
from django.views.decorators.csrf import ensure_csrf_cookie
from django.contrib.auth.models import User
from django.http import JsonResponse
from .models import Task
from django.shortcuts import get_object_or_404
import json

@method_decorator(ensure_csrf_cookie, name='dispatch')
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
            description=data['description'],
            scheduled_date=data['scheduled_date'],
            scheduled_time=data['scheduled_time'],
            user=User.objects.first()
        )
        
        return JsonResponse({
            'id': task.id,
            'title': task.title,
            'created': True
        }, status=201)

@method_decorator(ensure_csrf_cookie, name='dispatch')
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
