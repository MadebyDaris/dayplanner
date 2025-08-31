from django.db import models
from django.contrib.auth.models import User

class Task(models.Model):
    """
    Represents a single task in the planner.
    """
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ]

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    scheduled_date = models.DateField()
    scheduled_time = models.TimeField()
    completed = models.BooleanField(default=False)
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    created_at = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return self.title

from django.utils import timezone
from django.contrib.auth.models import User

class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='categories')

    class Meta:
        db_table = 'day_planner_categories'
        verbose_name = 'Category'
        verbose_name_plural = 'Categories'

    def __str__(self):
        return self.name
    
class Task(models.Model):
    title = models.CharField(max_length=200, help_text="What needs to be done?")
    description = models.TextField(
        blank=True,
        null=True,
        help_text="Detailed description of the task"
    )
    scheduled_date = models.DateField(
        help_text="What date is this task for?"
    )
    
    scheduled_time = models.TimeField(
        help_text="What time is this task scheduled?"
    )
    
    completed = models.BooleanField(
        default=False,
        help_text="Is this task done?"
    )

    PRIORITY_CHOICES = [
        ('low', 'Low Priority'),
        ('medium', 'Medium Priority'),
        ('high', 'High Priority'),
        ('urgent', 'Urgent'),
    ]

    priority = models.CharField(
        max_length=10,
        choices=PRIORITY_CHOICES,
        default='medium'
    )

    category = models.ForeignKey(
        Category, 
        on_delete=models.SET_NULL,  # Don't delete task if category deleted
        null=True, 
        blank=True
    )
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tasks')

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-scheduled_date', '-scheduled_time', 'priority']
        db_table = 'day_planner_tasks'
        verbose_name = 'Task'
        verbose_name_plural = 'Tasks'
        
        indexes = [
            models.Index(fields=['scheduled_date', 'scheduled_time']),
            models.Index(fields=['user', 'completed']),
        ]

    def __str__(self):
        return f"{self.title} ({self.scheduled_date})"
    

    @property
    def is_overdue(self):
        if not self.completed and self.scheduled_date < timezone.now().date():
            return True
        return False
    
    @property 
    def formatted_time(self):
        """Get nicely formatted time"""
        return self.scheduled_time.strftime('%I:%M %p')  # 2:30 PM
    
    def mark_as_completed(self):
        self.completed = True
        self.save()
    def mark_as_pending(self):
        self.completed = False
        self.save()



class TaskComment(models.Model):
    """Comments on tasks - shows One-to-Many relationship"""
    task = models.ForeignKey(
        Task, 
        on_delete=models.CASCADE,
        related_name='comments'  # task.comments.all()
    )
    
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Comment on {self.task.title}"
    
    class Meta:
        db_table = 'day_planner_task_comments'
        verbose_name = 'Task Comment'
        verbose_name_plural = 'Task Comments'
        ordering = ['-created_at']