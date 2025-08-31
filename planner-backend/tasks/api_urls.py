from django.urls import path
from . import api

urlpatterns = [
    path('tasks/', api.api_task_list, name='api-task-list'),
    path('tasks/<int:task_id>/', api.api_task_detail, name='api-task-detail'),
]
