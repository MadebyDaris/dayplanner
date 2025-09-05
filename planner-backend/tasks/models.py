from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User

class Team(models.Model):
    """Team model for organizing users"""
    name = models.CharField(max_length=100, help_text="Team name")
    description = models.TextField(blank=True, null=True, help_text="Team description")
    color = models.CharField(max_length=7, default='#3b82f6', help_text="Team color (hex)")
    is_active = models.BooleanField(default=True, help_text="Is this team active?")
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_teams')
    members = models.ManyToManyField(User, through='TeamMembership', related_name='teams')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']
        db_table = 'day_planner_teams'
        verbose_name = 'Team'
        verbose_name_plural = 'Teams'

    def __str__(self):
        return self.name

    @property
    def member_count(self):
        return self.teammembership_set.filter(is_active=True).count()

    @property
    def task_count(self):
        return Task.objects.filter(user__in=self.members.all()).count()

class TeamMembership(models.Model):
    """Many-to-many relationship between users and teams with additional fields"""
    ROLE_CHOICES = [
        ('owner', 'Owner'),
        ('admin', 'Administrator'),
        ('member', 'Member'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    team = models.ForeignKey(Team, on_delete=models.CASCADE)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='member')
    is_active = models.BooleanField(default=True)
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'team')
        db_table = 'day_planner_team_memberships'

    def __str__(self):
        return f"{self.user.username} - {self.team.name} ({self.role})"

class Project(models.Model):
    """Project model for task categorization"""
    name = models.CharField(max_length=100, help_text="Project name")
    slug = models.SlugField(max_length=100, unique=True, help_text="URL-friendly project identifier")
    description = models.TextField(blank=True, null=True, help_text="Project description")
    color = models.CharField(max_length=7, default='#3b82f6', help_text="Hex color code for project")
    is_active = models.BooleanField(default=True, help_text="Is this project active?")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='projects')
    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='projects', null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']
        db_table = 'day_planner_projects'
        verbose_name = 'Project'
        verbose_name_plural = 'Projects'
        unique_together = ['user', 'name']

    def __str__(self):
        return self.name

    @property
    def task_count(self):
        return self.tasks.count()

    @property
    def completed_task_count(self):
        return self.tasks.filter(completed=True).count()

    @property
    def pending_task_count(self):
        return self.tasks.filter(completed=False).count()

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
    
    scheduled_start_time = models.TimeField(
        blank=True,
        null=True,
        help_text="Specific start time for the task (only used if has_specific_time=True)"
    )
    
    scheduled_end_time = models.TimeField(
        blank=True,
        null=True,
        help_text="Specific end time for the task (only used if has_specific_time=True)"
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

    project = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        help_text="Project/category identifier (work, personal, etc.)"
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tasks')
    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='tasks', null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-importance', '-scheduled_date', '-scheduled_start_time']
        db_table = 'day_planner_tasks'
        verbose_name = 'Task'
        verbose_name_plural = 'Tasks'
        
        indexes = [
            models.Index(fields=['scheduled_date', 'scheduled_start_time', 'scheduled_end_time']),
            models.Index(fields=['user', 'completed']),
            models.Index(fields=['importance', 'completed']),
            models.Index(fields=['project', 'completed']),
            models.Index(fields=['has_specific_time']),
            models.Index(fields=['team']),
        ]

    def __str__(self):
        date_str = self.scheduled_date.strftime('%Y-%m-%d') if self.scheduled_date else 'No date'
        return f"{self.title} ({date_str})"
    
    @property
    def is_overdue(self):
        """Check if task is overdue"""
        if self.completed or not self.scheduled_date:
            return False
            
        today = timezone.now().date()
        
        if self.scheduled_date < today:
            return True
            
        # If it's today and has specific time, check if time has passed
        if (self.scheduled_date == today and self.has_specific_time and self.scheduled_end_time):
            current_time = timezone.now().time()
            return self.scheduled_end_time < current_time
            
        return False
    
    @property 
    def formatted_start_time(self):
        """Get nicely formatted time for specific start time tasks"""
        if self.has_specific_time and self.scheduled_start_time:
            return self.scheduled_start_time.strftime('%I:%M %p')
        return None
    
    @property 
    def formatted_end_time(self):
        """Get nicely formatted time for specific end time tasks"""
        if self.has_specific_time and self.scheduled_end_time:
            return self.scheduled_end_time.strftime('%I:%M %p')
        return None
    
    
    @property
    def formatted_duration(self):
        """Get formatted duration string for duration-based tasks"""
        if not self.has_specific_time:
            hours = self.duration_hours or 0
            minutes = self.duration_minutes or 0
            
            if hours == 0 and minutes == 0:
                return "Duration not specified"
            
            parts = []
            if hours > 0:
                part = f"{hours} hour" if hours == 1 else f"{hours} hours"
                parts.append(part)
            if minutes > 0:
                part = f"{minutes} min" if minutes < 60 else f"{minutes} minutes"
                parts.append(part)
            
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
    
    @property
    def project_info(self):
        """Get project information - returns dict with name, color, icon"""
        if not self.project:
            return None
            
        projects = {
            'work': {'name': 'Work Tasks', 'color': '#3b82f6'},
            'personal': {'name': 'Personal', 'color': '#10b981'},
            'learning': {'name': 'Learning & Development', 'color': '#f59e0b'},
            'health': {'name': 'Health & Fitness', 'color': '#ef4444'},
            'finance': {'name': 'Finance & Planning', 'color': '#8b5cf6'},
            'home': {'name': 'Home & Family', 'color': '#06b6d4'},
        }
        
        return projects.get(self.project, {
            'name': self.project.title(),
            'color': '#6b7280',
            'icon': '📁'
        })
    
    def mark_as_completed(self):
        self.completed = True
        self.save()
        
    def mark_as_pending(self):
        self.completed = False
        self.save()

    def get_duration_in_minutes(self):
        """Get total duration in minutes for duration-based tasks"""
        if not self.has_specific_time:
            return (self.duration_hours or 0) * 60 + (self.duration_minutes or 0)
        return None
    
    def clean(self):
        """Model validation"""
        from django.core.exceptions import ValidationError
        
        # Validate time/duration logic
        if self.has_specific_time:
            # Clear duration fields if using specific time
            self.duration_hours = None
            self.duration_minutes = None
        else:
            # Clear time field if using duration
            self.scheduled_start_time = None
            self.scheduled_end_time = None
            # Validate duration is positive
            total_minutes = (self.duration_hours or 0) * 60 + (self.duration_minutes or 0)
            if total_minutes <= 0:
                raise ValidationError("Duration must be greater than 0 minutes")
    
    def save(self, *args, **kwargs):
        """Override save to run validation"""
        self.full_clean()
        super().save(*args, **kwargs)


class TaskComment(models.Model):
    """Comments on tasks"""
    task = models.ForeignKey(
        Task, 
        on_delete=models.CASCADE,
        related_name='comments'
    )
    
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='task_comments', null=True)
    
    def __str__(self):
        return f"Comment on {self.task.title} by {self.user.username}"
    
    class Meta:
        db_table = 'day_planner_task_comments'
        verbose_name = 'Task Comment'
        verbose_name_plural = 'Task Comments'
        ordering = ['-created_at']