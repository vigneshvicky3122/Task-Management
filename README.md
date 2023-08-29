# Task Management Web Application

This is a simple task management web application built using React for the front-end and Node.js for the back-end. The application allows users to efficiently manage their tasks by providing features to create, read, update, and delete tasks. Additionally, users can mark tasks as completed for better organization.

## Front-end Requirements (React)

### Login Page

The application starts with a login page where users can authenticate themselves. Upon successful login, users will be redirected to the home page.

### Home Page

The home page presents users with a clear overview of their tasks. It displays a list of tasks in a user-friendly format, allowing users to quickly identify their pending tasks.

### Adding New Tasks

Users can easily add new tasks using a dedicated form. This form includes fields for the task's title and description. After filling in the details, users can submit the form to add the task to their task list.

### Task Display

Each task in the list is shown with its title, description, and a "Mark as Completed" button. This layout ensures that users can grasp the key information about each task at a glance.

### Task Completion

Users have the ability to mark tasks as completed. Once a task is marked as completed, it is visually distinguished from incomplete tasks. This differentiation makes it easier for users to identify the tasks they've already finished.

### Editing and Deleting Tasks

The application enables users to edit and delete tasks. This feature empowers users to modify task details or remove tasks that are no longer relevant. The edit option lets users update the title and description of a task, while the delete option removes the task from the list.

## Getting Started

1. Clone this repository to your local machine.
2. Navigate to the `frontend` directory and run `npm install` to install the required dependencies for the React front-end.
3. After the installation is complete, run `npm start` to launch the React development server.
4. Open your web browser and go to `http://localhost:3000` to access the application.

## Back-end (Node.js)

The back-end of this application is built using Node.js. It manages the tasks and provides the necessary APIs for the front-end to interact with the data. The back-end code can be found in the `backend` directory.

To set up the back-end:

1. Navigate to the `backend` directory and run `npm install` to install the required dependencies for the Node.js back-end.
2. Once the installation is finished, run `nodemon` to start the Node.js server.

Please note that the front-end and back-end need to be running simultaneously for the full functionality of the application.

## Technologies Used

- Front-end: React
- Back-end: Node.js
- Database: MongoDb

## Contributors

- VIGNESH A
