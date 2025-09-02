

from django.db import models


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
        blank=True,
        null=True,
        help_text="What date is this task for? (Optional)"
    )
    
    # Updated time handling
    has_specific_time = models.BooleanField(
        default=True,
        help_text="Does this task have a specific time?"
    )
    
    scheduled_time = models.TimeField(
        blank=True,
        null=True,
        help_text="Specific time for the task"
    )
    
    # Duration for tasks without specific time
    duration_hours = models.IntegerField(
        blank=True,
        null=True,
        help_text="Duration in hours (for tasks without specific time)"
    )
    
    duration_minutes = models.IntegerField(
        blank=True,
        null=True,
        help_text="Duration in minutes (for tasks without specific time)"
    )
    
    
    completed = models.BooleanField(
        default=False,
        help_text="Is this task done?"
    )

    IMPORTANCE_CHOICES = [
        ('low', 'Low - Nice to have'),
        ('medium', 'Medium - Should do'),
        ('high', 'High - Must do'),
        ('critical', 'Critical - Urgent & Important'),
    ]

    importance = models.CharField(
        max_length=10,
        choices=IMPORTANCE_CHOICES,
        default='medium',
        help_text="How important is this task?"
    )

    category = models.ForeignKey(
        Category, 
        on_delete=models.SET_NULL,
        null=True, 
        blank=True
    )
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tasks')

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-importance', '-scheduled_date', '-scheduled_time']
        db_table = 'day_planner_tasks'
        verbose_name = 'Task'
        verbose_name_plural = 'Tasks'
        
        indexes = [
            models.Index(fields=['scheduled_date', 'scheduled_time']),
            models.Index(fields=['user', 'completed']),
            models.Index(fields=['importance', 'completed']),
        ]

    def __str__(self):
        date_str = self.scheduled_date.strftime('%Y-%m-%d') if self.scheduled_date else 'No date'
        return f"{self.title} ({date_str})"
    
    @property
    def is_overdue(self):
        if not self.completed and self.scheduled_date and self.scheduled_date < timezone.now().date():
            return True
        return False
    
    @property 
    def formatted_time(self):
        """Get nicely formatted time"""
        if self.has_specific_time and self.scheduled_time:
            return self.scheduled_time.strftime('%I:%M %p')
        return None
    
    @property
    def formatted_duration(self):
        """Get formatted duration string"""
        if not self.has_specific_time:
            hours = self.duration_hours or 0
            minutes = self.duration_minutes or 0
            
            if hours == 0 and minutes == 0:
                return "Duration not specified"
            
            parts = []
            if hours > 0:
                parts.append(f"{hours}h")
            if minutes > 0:
                parts.append(f"{minutes}m")
            
            return " ".join(parts)
        return None
    
    @property
    def importance_color(self):
        """Get color for importance level"""
        colors = {
            'low': '#10b981',      # green
            'medium': '#f59e0b',   # yellow/amber
            'high': '#f97316',     # orange
            'critical': '#ef4444', # red
        }
        return colors.get(self.importance, '#6b7280')
    
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