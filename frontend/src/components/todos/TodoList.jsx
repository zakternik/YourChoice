import axios from 'axios';
import Cookie from "js-cookie";
import React, { useEffect, useState } from 'react';
import env from "../../env.json";
import './todoList.css';

function TodoList() {
  const [tasks, setTasks] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [newTask, setNewTask] = useState({
    name: '',
    urgent: false,
    color: '#3498db', // Default color
    startDateTime: '', // Start date and time as a string
    endDateTime: '',   // End date and time as a string
  });

  // Updated color scheme
  const filters = [
    '#1abc9c',
    '#2ecc71',
    '#3498db',
    '#9b59b6',
    '#f1c40f',
    '#e67e22',
    '#e74c3c',
    '#34495e',
    '#95a5a6',
    '#7f8c8d',
  ];

  useEffect(() => {
    const user = JSON.parse(Cookie.get("signed_in_user"));
    axios.get(`${env.api}/task/user/${user._id}/tasks`).then((response) => {
      setTasks(response.data.tasks);
    }).catch((error) => {
      console.log(error);
    });
  }, [showModal]);

  // Handle opening the modal
  const handleAddTask = () => {
    setShowModal(true);
  };

  // Handle closing the modal
  const handleCloseModal = () => {
    setShowModal(false);
    setNewTask({
      name: '',
      urgent: false,
      color: '#3498db',
      startDateTime: '',
      endDateTime: '',
    });
  };

  // Handle input changes in the modal
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewTask((prevTask) => ({
      ...prevTask,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Handle submitting the new task
  const handleSubmit = (e) => {
    e.preventDefault();
    if (newTask.name.trim() === '') return;

    const startDateTime = new Date(newTask.startDateTime);
    const endDateTime = new Date(newTask.endDateTime);

    if (endDateTime < startDateTime) {
      alert('End date and time cannot be before start date and time.');
      return;
    }

    const user = JSON.parse(Cookie.get("signed_in_user"));
    axios.post(`${env.api}/task/user/${user._id}/tasks`, newTask, {
      headers: {
        'Content-Type': 'application/json'
      }
    }).then((response) => {
      handleCloseModal();
    }).catch((error) => {
      console.log(error);
    });
  };

  // Render tasks
  const renderTasks = () => {
    return tasks.map((task, index) => (
      <li key={index} className="task-item">
        <div className="task-content">
          <div
            className="color-circle"
            style={{ backgroundColor: task.color }}
          ></div>
          <span className={`task-name ${task.urgent ? 'urgent' : ''}`}>
            {task.name}
          </span>
          <span className="task-date">
            {/* Display start date and end date with time */}
            {new Date(task.startDateTime).toLocaleString('en-GB')} -{' '}
            {new Date(task.endDateTime).toLocaleString('en-GB')}
          </span>
        </div>
      </li>
    ));
  };

  return (
    <div className="page-background">
      <div className="todo-container">
        <h1>My Todos</h1>
        <div className="todo-list">
          <div className="todo-header">
            <button className="add-task-button" onClick={handleAddTask}>
              +
            </button>
          </div>
          <ul>{renderTasks()}</ul>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Add New Task</h2>
            <form onSubmit={handleSubmit}>
              {/* Task Name */}
              <div className="form-group">
                <label htmlFor="taskName">Task Name:</label>
                <input
                  type="text"
                  id="taskName"
                  name="name"
                  value={newTask.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Color Selection */}
              <div className="form-group">
                <label>Select Color:</label>
                <div className="color-options">
                  {filters.map((color, index) => (
                    <div
                      key={index}
                      className={`color-circle ${newTask.color === color ? 'selected' : ''
                        }`}
                      style={{ backgroundColor: color }}
                      onClick={() =>
                        setNewTask((prevTask) => ({ ...prevTask, color }))
                      }
                    />
                  ))}
                </div>
              </div>

              {/* Start Date and Time */}
              <div className="form-group">
                <label htmlFor="startDateTime">Start Date and Time:</label>
                <input
                  type="datetime-local"
                  id="startDateTime"
                  name="startDateTime"
                  value={newTask.startDateTime}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* End Date and Time */}
              <div className="form-group">
                <label htmlFor="endDateTime">End Date and Time:</label>
                <input
                  type="datetime-local"
                  id="endDateTime"
                  name="endDateTime"
                  value={newTask.endDateTime}
                  onChange={handleInputChange}
                  required
                  min={newTask.startDateTime} // Ensure end datetime is after start datetime
                />
              </div>

              {/* Urgent Checkbox */}
              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="urgent"
                    checked={newTask.urgent}
                    onChange={handleInputChange}
                  />
                  Mark as urgent
                </label>
              </div>

              {/* Buttons */}
              <div className="modal-buttons">
                <button type="submit" className="submit-button">
                  Add Task
                </button>
                <button
                  type="button"
                  className="cancel-button"
                  onClick={handleCloseModal}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default TodoList;
