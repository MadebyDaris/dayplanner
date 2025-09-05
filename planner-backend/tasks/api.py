import logging
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.contrib.auth.models import User
from django.http import JsonResponse
from .models import Task
from django.shortcuts import get_object_or_404
import json

logger = logging.getLogger(__name__)

def serialize_task(task):
    """Helper function to serialize task data consistently"""
    project_info = task.project_info
    
    return {
        'id': task.id,
        'title': task.title,
        'description': task.description,
        'completed': task.completed,
        'scheduled_date': task.scheduled_date.strftime('%Y-%m-%d') if task.scheduled_date else None,
        'has_specific_time': task.has_specific_time,
        'scheduled_start_time': task.scheduled_start_time.strftime('%H:%M') if task.scheduled_start_time else None,
        'scheduled_end_time': task.scheduled_end_time.strftime('%H:%M') if task.scheduled_end_time else None,
        'duration_hours': task.duration_hours,
        'duration_minutes': task.duration_minutes,
        'importance': task.importance,
        'importance_display': task.get_importance_display(),
        'importance_color': task.importance_color,
        'project': task.project,
        'project_info': project_info,
        'formatted_start_time': task.formatted_start_time,
        'formatted_end_time': task.formatted_end_time,
        'formatted_duration': task.formatted_duration,
        'is_overdue': task.is_overdue,
        'created_at': task.created_at.isoformat(),
        'updated_at': task.updated_at.isoformat(),
    }

@csrf_exempt
@require_http_methods(["GET", "POST"])
def api_task_list(request):
    """API endpoint for tasks"""
    if request.method == 'GET':
        try:
            project_filter = request.GET.get('project')
            importance_filter = request.GET.get('importance')
            completed_filter = request.GET.get('completed')
            date_filter = request.GET.get('date')
            overdue_filter = request.GET.get('overdue')
            
            tasks = Task.objects.all().order_by('-importance', '-created_at')

            if project_filter:
                tasks = tasks.filter(project=project_filter)
            
            if importance_filter:
                tasks = tasks.filter(importance=importance_filter)
            
            if completed_filter is not None:
                is_completed = completed_filter.lower() in ['true', '1', 'yes']
                tasks = tasks.filter(completed=is_completed)
            
            if date_filter:
                tasks = tasks.filter(scheduled_date=date_filter)

            if overdue_filter and overdue_filter.lower() in ['true', '1', 'yes']:
                tasks = [task for task in tasks if task.is_overdue and not task.completed]
            else:
                tasks = list(tasks)
        
            data = [serialize_task(task) for task in tasks]
            logger.info(f"Retrieved {len(data)} tasks")
            return JsonResponse({'tasks': data})
            
        except Exception as e:
            logger.error(f"Error retrieving tasks: {str(e)}")
            return JsonResponse({'error': 'Failed to retrieve tasks'}, status=500)
    
    elif request.method == 'POST':
        try:
            data = json.loads(request.body)
            logger.info(f"Creating task with data: {data}")

            user, created = User.objects.get_or_create(
                username='demo_user',
                defaults={'email': 'demo@example.com'}
            )

            if not data.get('title', '').strip():
                return JsonResponse({'error': 'Title is required'}, status=400)
            
            task_data = {
                'title': data['title'].strip(),
                'description': data.get('description', '').strip(),
                'user': user,
                'importance': data.get('importance', 'medium'),
                'has_specific_time': data.get('has_specific_time', True),
                'project': data.get('project') if data.get('project') else None,
            }
            
            if data.get('scheduled_date'):
                task_data['scheduled_date'] = data['scheduled_date']
            
            # Handle time vs duration - Fixed the syntax error
            if data.get('has_specific_time'):
                if data.get('scheduled_start_time') and data.get('scheduled_end_time'):
                    task_data['scheduled_start_time'] = data['scheduled_start_time']
                    task_data['scheduled_end_time'] = data['scheduled_end_time']
            else:
                duration_hours = data.get('duration_hours', 0)
                duration_minutes = data.get('duration_minutes', 0)
                
                # Validate duration
                total_minutes = (duration_hours * 60) + duration_minutes
                if total_minutes <= 0:
                    return JsonResponse({'error': 'Duration must be greater than 0'}, status=400)
                
                task_data['duration_hours'] = duration_hours
                task_data['duration_minutes'] = duration_minutes
            
            task = Task.objects.create(**task_data)
            
            logger.info(f"Task created successfully: {task.id}")
            return JsonResponse(serialize_task(task), status=201)
            
        except KeyError as e:
            return JsonResponse({'error': f'Missing required field: {e}'}, status=400)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)
        except Exception as e:
            logger.error(f"Error creating task: {str(e)}")
            return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["GET", "PUT", "DELETE"])
def api_task_detail(request, task_id):
    """API endpoint for specific task"""
    try:
        task = get_object_or_404(Task, id=task_id)
        
        if request.method == 'GET':
            return JsonResponse(serialize_task(task))
        
        elif request.method == 'PUT':
            try:
                data = json.loads(request.body)
                logger.info(f"Updating task {task_id} with data: {data}")

                # Update fields if provided
                if 'title' in data:
                    title = data['title'].strip()
                    if not title:
                        return JsonResponse({'error': 'Title cannot be empty'}, status=400)
                    task.title = title
                if 'description' in data:
                    task.description = data['description'].strip()
                if 'completed' in data:
                    task.completed = data['completed']
                if 'scheduled_date' in data:
                    task.scheduled_date = data['scheduled_date'] if data['scheduled_date'] else None
                if 'importance' in data:
                    task.importance = data['importance']
                if 'project' in data:
                    task.project = data['project'] if data['project'] else None
                if 'has_specific_time' in data:
                    task.has_specific_time = data['has_specific_time']
                
                # Handle time vs duration updates
                if data.get('has_specific_time', task.has_specific_time):
                    if 'scheduled_start_time' in data:
                        task.scheduled_start_time = data['scheduled_start_time']
                    if 'scheduled_end_time' in data:
                        task.scheduled_end_time = data['scheduled_end_time']
                    # Clear duration fields
                    task.duration_hours = None
                    task.duration_minutes = None
                else:
                    if 'duration_hours' in data or 'duration_minutes' in data:
                        hours = data.get('duration_hours', task.duration_hours or 0)
                        minutes = data.get('duration_minutes', task.duration_minutes or 0)
                        
                        # Validate duration
                        total_minutes = (hours * 60) + minutes
                        if total_minutes <= 0:
                            return JsonResponse({'error': 'Duration must be greater than 0'}, status=400)
                        
                        task.duration_hours = hours
                        task.duration_minutes = minutes
                    # Clear time fields
                    task.scheduled_start_time = None
                    task.scheduled_end_time = None
                
                task.save()
                
                logger.info(f"Task {task_id} updated successfully")
                return JsonResponse(serialize_task(task))

            except json.JSONDecodeError:
                return JsonResponse({'error': 'Invalid JSON'}, status=400)
            except Exception as e:
                logger.error(f"Error updating task {task_id}: {str(e)}")
                return JsonResponse({'error': str(e)}, status=500)
        
        elif request.method == 'DELETE':
            task_title = task.title
            task.delete()
            return JsonResponse({'deleted': True, 'title': task_title})
            
    except Exception as e:
        logger.error(f"Error in task detail view: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)
    

@csrf_exempt
@require_http_methods(["GET"])
def api_task_stats(request):
    """API endpoint for task statistics"""
    try:
        tasks = Task.objects.all()
        
        # Basic stats
        total_tasks = tasks.count()
        completed_tasks = tasks.filter(completed=True).count()
        pending_tasks = tasks.filter(completed=False).count()
        
        # Overdue tasks (need to evaluate each task)
        overdue_tasks = sum(1 for task in tasks.filter(completed=False) if task.is_overdue)
        
        # Today's tasks
        from django.utils import timezone
        today = timezone.now().date()
        today_tasks = tasks.filter(scheduled_date=today).count()
        
        # Priority breakdown (pending only)
        pending_by_priority = {}
        for choice in Task.IMPORTANCE_CHOICES:
            priority = choice[0]
            count = tasks.filter(importance=priority, completed=False).count()
            pending_by_priority[priority] = count
        
        # Project breakdown
        project_stats = {}
        for task in tasks:
            project = task.project or 'unassigned'
            if project not in project_stats:
                project_stats[project] = {
                    'total': 0,
                    'completed': 0,
                    'pending': 0,
                    'project_info': task.project_info if task.project else None
                }
            
            project_stats[project]['total'] += 1
            if task.completed:
                project_stats[project]['completed'] += 1
            else:
                project_stats[project]['pending'] += 1
        
        stats = {
            'total': total_tasks,
            'completed': completed_tasks,
            'pending': pending_tasks,
            'overdue': overdue_tasks,
            'today': today_tasks,
            'by_priority': pending_by_priority,
            'by_project': project_stats,
            'completion_rate': round((completed_tasks / total_tasks * 100), 1) if total_tasks > 0 else 0,
        }
        
        return JsonResponse({'stats': stats})
        
    except Exception as e:
        logger.error(f"Error calculating stats: {str(e)}")
        return JsonResponse({'error': 'Failed to calculate statistics'}, status=500)

@csrf_exempt
@require_http_methods(["GET"])
def api_projects(request):
    """API endpoint for available projects"""
    try:
        # Mock data for now - in full implementation this would query Project model
        projects = [
            {'id': '', 'name': 'No Project', 'color': '#6b7280'},
            {'id': 'work', 'name': 'Work Tasks', 'color': '#3b82f6'},
            {'id': 'personal', 'name': 'Personal', 'color': '#10b981'},
            {'id': 'learning', 'name': 'Learning & Development', 'color': '#f59e0b'},
            {'id': 'health', 'name': 'Health & Fitness', 'color': '#ef4444'},
            {'id': 'finance', 'name': 'Finance & Planning', 'color': '#8b5cf6'},
            {'id': 'home', 'name': 'Home & Family', 'color': '#06b6d4'}
        ]
        
        return JsonResponse({'projects': projects})
        
    except Exception as e:
        logger.error(f"Error fetching projects: {str(e)}")
        return JsonResponse({'error': 'Failed to fetch projects'}, status=500)