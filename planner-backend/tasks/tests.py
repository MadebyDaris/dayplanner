from django.test import TestCase
from django.contrib.auth.models import User
from .models import Task
import datetime

class TaskModelTest(TestCase):

    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='password')

    def test_create_task(self):
        """Test creating a task."""
        task = Task.objects.create(
            title='Test Task',
            description='This is a test task.',
            scheduled_date=datetime.date.today(),
            scheduled_time=datetime.time(12, 0),
            user=self.user
        )
        self.assertEqual(task.title, 'Test Task')
        self.assertEqual(task.user.username, 'testuser')
