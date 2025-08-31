from django.urls import path
from . import views

app_name = 'tasks'

urlpatterns = [
    path('', views.task_list, name='task-list'),
    path('create/', views.create_task, name='task-create'),
    path('<int:task_id>/', views.task_detail, name='task-detail'),
    path('<int:task_id>/edit/', views.edit_task, name='task-edit'), 
    path('<int:task_id>/delete/', views.task_delete, name='task-delete'),
    path('<int:task_id>/toggle/', views.toggle_task, name='task-toggle'),
]
