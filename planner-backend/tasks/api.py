from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.contrib.auth.models import User
from django.http import JsonResponse
from .models import Task
from django.shortcuts import get_object_or_404
import json

@csrf_exempt
@require_http_methods(["GET", "POST"])
def api_task_list(request):
    """API endpoint for tasks"""
    if request.method == 'GET':
        tasks = Task.objects.all().order_by('-importance', '-created_at')
        data = []
        for task in tasks:
            task_data = {
                'id': task.id,
                'title': task.title,
                'description': task.description,
                'completed': task.completed,
                'scheduled_date': task.scheduled_date.strftime('%Y-%m-%d') if task.scheduled_date else None,
                'has_specific_time': task.has_specific_time,
                'scheduled_time': task.scheduled_time.strftime('%H:%M') if task.scheduled_time else None,
                'duration_hours': task.duration_hours,
                'duration_minutes': task.duration_minutes,
                'importance': task.importance,
                'importance_display': task.get_importance_display(),
                'importance_color': task.importance_color,
                'formatted_time': task.formatted_time,
                'formatted_duration': task.formatted_duration,
                'is_overdue': task.is_overdue,
                'created_at': task.created_at.isoformat(),
            }
            data.append(task_data)
        
        return JsonResponse({'tasks': data})
    
    elif request.method == 'POST':
        try:
            data = json.loads(request.body)
            
            user, created = User.objects.get_or_create(
                username='demo_user',
                defaults={'email': 'demo@example.com'}
            )
            
            task_data = {
                'title': data['title'],
                'description': data.get('description', ''),
                'user': user,
                'importance': data.get('importance', 'medium'),
                'has_specific_time': data.get('has_specific_time', True),
            }

            # Handle optional date
            if data.get('scheduled_date'):
                task_data['scheduled_date'] = data['scheduled_date']
            
            # Handle time vs duration
            if data.get('has_specific_time', True):
                if data.get('scheduled_time'):
                    task_data['scheduled_time'] = data['scheduled_time']
            else:
                task_data['duration_hours'] = data.get('duration_hours', 0)
                task_data['duration_minutes'] = data.get('duration_minutes', 0)
            
            task = Task.objects.create(**task_data)
            
            return JsonResponse({
                'id': task.id,
                'title': task.title,
                'description': task.description,
                'completed': task.completed,
                'scheduled_date': task.scheduled_date.strftime('%Y-%m-%d') if task.scheduled_date else None,
                'has_specific_time': task.has_specific_time,
                'scheduled_time': task.scheduled_time.strftime('%H:%M') if task.scheduled_time else None,
                'duration_hours': task.duration_hours,
                'duration_minutes': task.duration_minutes,
                'importance': task.importance,
                'importance_display': task.get_importance_display(),
                'importance_color': task.importance_color,
                'formatted_time': task.formatted_time,
                'formatted_duration': task.formatted_duration,
                'is_overdue': task.is_overdue,
                'created_at': task.created_at.isoformat(),
                'created': True
            }, status=201)
            
        except KeyError as e:
            return JsonResponse({'error': f'Missing required field: {e}'}, status=400)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["GET", "PUT", "DELETE"])
def api_task_detail(request, task_id):
    """API endpoint for specific task"""
    try:
        task = get_object_or_404(Task, id=task_id)
        
        if request.method == 'GET':
            return JsonResponse({
                'id': task.id,
                'title': task.title,
                'description': task.description,
                'completed': task.completed,
                'scheduled_date': task.scheduled_date.strftime('%Y-%m-%d') if task.scheduled_date else None,
                'has_specific_time': task.has_specific_time,
                'scheduled_time': task.scheduled_time.strftime('%H:%M') if task.scheduled_time else None,
                'duration_hours': task.duration_hours,
                'duration_minutes': task.duration_minutes,
                'importance': task.importance,
                'importance_display': task.get_importance_display(),
                'importance_color': task.importance_color,
                'formatted_time': task.formatted_time,
                'formatted_duration': task.formatted_duration,
                'is_overdue': task.is_overdue,
                'created_at': task.created_at.isoformat(),
            })
        
        elif request.method == 'PUT':
            try:
                data = json.loads(request.body)
                
                # Update fields if provided
                if 'title' in data:
                    task.title = data['title']
                if 'description' in data:
                    task.description = data['description']
                if 'completed' in data:
                    task.completed = data['completed']
                if 'scheduled_date' in data:
                    task.scheduled_date = data['scheduled_date'] if data['scheduled_date'] else None
                if 'importance' in data:
                    task.importance = data['importance']
                if 'has_specific_time' in data:
                    task.has_specific_time = data['has_specific_time']
                
                # Handle time vs duration updates
                if data.get('has_specific_time', task.has_specific_time):
                    if 'scheduled_time' in data:
                        task.scheduled_time = data['scheduled_time']
                    # Clear duration fields
                    task.duration_hours = None
                    task.duration_minutes = None
                else:
                    if 'duration_hours' in data:
                        task.duration_hours = data['duration_hours']
                    if 'duration_minutes' in data:
                        task.duration_minutes = data['duration_minutes']
                    # Clear time field
                    task.scheduled_time = None
                
                task.save()
                
                return JsonResponse({
                    'id': task.id,
                    'title': task.title,
                    'description': task.description,
                    'completed': task.completed,
                    'scheduled_date': task.scheduled_date.strftime('%Y-%m-%d') if task.scheduled_date else None,
                    'has_specific_time': task.has_specific_time,
                    'scheduled_time': task.scheduled_time.strftime('%H:%M') if task.scheduled_time else None,
                    'duration_hours': task.duration_hours,
                    'duration_minutes': task.duration_minutes,
                    'importance': task.importance,
                    'importance_display': task.get_importance_display(),
                    'importance_color': task.importance_color,
                    'formatted_time': task.formatted_time,
                    'formatted_duration': task.formatted_duration,
                    'is_overdue': task.is_overdue,
                    'updated': True
                })
                
            except json.JSONDecodeError:
                return JsonResponse({'error': 'Invalid JSON'}, status=400)
            except Exception as e:
                return JsonResponse({'error': str(e)}, status=500)
        
        elif request.method == 'DELETE':
            task_title = task.title
            task.delete()
            return JsonResponse({'deleted': True, 'title': task_title})
            
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)