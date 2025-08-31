const API_URL = 'http://localhost:8000/api';

export const getTasks = async () => {
  const response = await fetch(`${API_URL}/tasks/`);
  const data = await response.json();
  console.log(data);
  return data.tasks;
};

export const createTask = async (task) => {
  const response = await fetch(`${API_URL}/tasks/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(task),
  });
  const data = await response.json();
  return data;
};
