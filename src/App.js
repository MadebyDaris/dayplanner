import { useState, useEffect } from 'react';
import './App.css';
import { getTasks, createTask } from './api';

function DayPlanner() {

  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newDate, setNewDate] = useState('');
  const [filter, setFilter] = useState('all') // all, completed, pending

  useEffect(() => {
    const fetchTasks = async () => {
      const tasks = await getTasks();
      setTasks(tasks);
    };
    fetchTasks();
  }, []);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    const newTask = {
      title: newTaskTitle,
      scheduled_date: new Date().toISOString().slice(0, 10),
      scheduled_time: new Date().toISOString().slice(11, 16),
    };
    const createdTask = await createTask(newTask);
    setTasks([...tasks, createdTask]);
    setNewTaskTitle('');
  };

  return (
    <div className="App">
      <h1>Day Planner</h1>
      <form onSubmit={handleCreateTask}>
        <input
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="Add a new task"
        />
        <button type="submit">Add Task</button>
      </form>
      <ul>
        {tasks.map((task) => (
          <li key={task.id}>{task.title}</li>
        ))}
      </ul>
    </div>
  );
}

export default DayPlanner;