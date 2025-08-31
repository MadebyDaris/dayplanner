# Day Planner

A simple day planner application built with React and Django.
Just a mini project to learn how to use Django and React together.

## Getting Started

To run the React application, you need to have Node.js and npm installed. Open a new terminal, navigate to the root of the project, and run the following commands:

```bash
npm install
npm start
```

This will start the React development server, and your browser should open to `http://localhost:3000`.

**Important:** For the React app to work, you also need to have the Django development server running in a separate terminal.

## File Structure
Here are the key files I've created and modified:

*   **`src/App.js`:** This is the main component of the application. It manages the state of the tasks and handles fetching and creating tasks.
*   **`src/App.css`:** This file contains some basic styling for the application.
*   **`src/api.js`:** This file contains the functions that communicate with the Django API. This helps to keep the API logic separate from the components.

## How it Works
1.  **Fetching Tasks:**
    *   When the `App` component first loads, it uses the `useEffect` hook to call the `getTasks` function from `src/api.js`.
    *   The `getTasks` function makes a `fetch` request to `http://localhost:8000/api/tasks/`.
    *   The Django API responds with a list of tasks in JSON format.
    *   The `App` component then updates its state with the fetched tasks, and they are displayed on the page.

2.  **Creating Tasks:**
    *   When you type in the input field and click "Add Task", the `handleCreateTask` function is called.
    *   This function calls the `createTask` function from `src/api.js`, sending the new task's title, the current date, and time to the Django API.
    *   The `createTask` function makes a `POST` request to `http://localhost:8000/api/tasks/` with the new task data in the request body.
    *   The Django API creates the new task in the database and returns the created task as JSON.
    *   The `App` component then adds the new task to its state, and the new task is displayed on the page.

## Experiment and Have Control
This is a very basic setup to get you started. Here are some ideas for how you can experiment and take control:

*   **Add more fields:** Modify the `TaskForm` to include a description or a priority for the tasks.
*   **Update tasks:** Add a button to mark tasks as complete. You'll need to add a new function to `src/api.js` to handle `PUT` requests.
*   **Delete tasks:** Add a button to delete tasks. You'll need to add a new function to `src/api.js` to handle `DELETE` requests.
*   **Improve styling:** Experiment with different styles in `src/App.css` to make the application look better.

I hope this helps you get started with your React and Django application!

### Prerequisites
*   Node.js and npm
*   Python and pip

### Installation
1.  **Clone the repository:**

    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```

2.  **Backend Setup:**
    ```bash
    # Create and activate a virtual environment
    python -m venv planner-backend-django
    source planner-backend-django/Scripts/activate  # On Windows, use `planner-backend-django\Scripts\activate`

    # Install backend dependencies
    pip install -r requirements.txt

    # Run database migrations
    python planner-backend/manage.py migrate
    ```

3.  **Frontend Setup:**
    ```bash
    # Install frontend dependencies
    npm install
    ```

## Running the Application

1.  **Start the Django development server:**
    ```bash
    python planner-backend/manage.py runserver
    ```

    The backend API will be running at `http://localhost:8000`.

2.  **Start the React development server:**
    In a new terminal, run:

    ```bash
    npm start
    ```

    The frontend application will be running at `http://localhost:3000`.

## Project Structure
```
.
├── planner-backend/      # Django backend
├── planner-backend-django/ # Django virtual environment
├── public/               # Public assets for the React app
├── src/                  # React application source code
├── .gitignore
├── package.json
├── README.md
└── requirements.txt
```

## Technologies Used
*   **Backend:**
    *   Django
    *   Django REST Framework
*   **Frontend:**
    *   React
*   **Database:**
    *   SQLite (for development)