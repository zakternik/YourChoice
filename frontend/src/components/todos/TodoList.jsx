import axios from 'axios';
import Cookie from "js-cookie";
import React, { useEffect, useState } from 'react';
import env from "../../env.json";
import './todoList.css';

function TodoList() {
  const [tasks, setTasks] = useState([]);
  const [repeatingTasks, setRepeatingTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newTask, setNewTask] = useState({
    name: '',
    urgent: false,
    color: '#3498db',
    startDateTime: '',
    endDateTime: '',
    repeat: 'none',
    repeatEndDate: '',  // Added repeatEndDate for handling repetition end date
  });

  const repeatOptions = ["none", "daily", "weekly", "monthly"];

  const filters = [
    '#1abc9c', '#2ecc71', '#3498db', '#9b59b6', '#f1c40f',
    '#e67e22', '#e74c3c', '#34495e', '#95a5a6', '#7f8c8d',
  ];

  useEffect(() => {
    const user = JSON.parse(Cookie.get("signed_in_user"));
    axios.get(`${env.api}/task/user/${user._id}/tasks`).then((response) => {
      const allTasks = response.data.tasks;
      setTasks(allTasks.filter(task => !task.repeat || task.repeat === 'none'));
      setRepeatingTasks(allTasks.filter(task => task.repeat && task.repeat !== 'none'));
    }).catch((error) => {
      console.log(error);
    });
  }, [showModal]);

  const handleAddTask = () => setShowModal(true);

  const handleCloseModal = () => {
    setShowModal(false);
    setNewTask({
      name: '',
      urgent: false,
      color: '#3498db',
      startDateTime: '',
      endDateTime: '',
      repeat: 'none',
      repeatEndDate: '',  // Reset repeatEndDate
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewTask((prevTask) => ({
      ...prevTask,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newTask.name.trim() === '') return;

    const startDateTime = new Date(newTask.startDateTime);
    const endDateTime = new Date(newTask.endDateTime);

    if (endDateTime < startDateTime) {
      alert('End date and time cannot be before start date and time.');
      return;
    }

    // Handle repeatEndDate correctly
    const repeatEndDate = newTask.repeatEndDate ? new Date(newTask.repeatEndDate).toISOString() : '';

    const user = JSON.parse(Cookie.get("signed_in_user"));
    axios.post(`${env.api}/task/user/${user._id}/tasks`, { ...newTask, repeatEndDate }, {
      headers: { 'Content-Type': 'application/json' }
    }).then(() => {
      handleCloseModal();
    }).catch((error) => {
      console.log(error);
    });
  };

  const deleteTask = (taskId) => {
    const user = JSON.parse(Cookie.get("signed_in_user"));
    axios.delete(`${env.api}/task/user/${user._id}/tasks/${taskId}`).then(() => {
      setTasks(prevTasks => prevTasks.filter(task => task._id !== taskId));
      setRepeatingTasks(prevTasks => prevTasks.filter(task => task._id !== taskId));
    }).catch((error) => {
      console.error('Error deleting task:', error);
    });
  };

  const renderTasks = (taskList) => taskList.map((task, index) => (
    <li key={index} className="task-item">
      <div className="task-content">
        <div className="color-circle" style={{ backgroundColor: task.color }}></div>
        <span className={`task-name ${task.urgent ? 'urgent' : ''}`}>{task.name}</span>
        <span className="task-date">
          {new Date(task.startDateTime).toLocaleString('en-GB')} - {new Date(task.endDateTime).toLocaleString('en-GB')}
        </span>
        <span className="delete-task-button" onClick={() => deleteTask(task._id)}>🗑️</span>
        {task.repeat && task.repeat !== 'none' && <span className="task-repeat">({task.repeat})</span>}
      </div>
    </li>
  ));

  return (
    <div className="page-background">
      <div className="todo-container">
        <h1>My Todos</h1>
        <div className="todo-list">
          <div className="todo-header">
            <button className="add-task-button" onClick={handleAddTask}>+</button>
          </div>
          <h2>Regular Tasks</h2>
          <ul>{renderTasks(tasks)}</ul>
          <h2>Repeating Tasks</h2>
          <ul>{renderTasks(repeatingTasks)}</ul>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Add New Task</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="taskName">Task Name:</label>
                <input type="text" id="taskName" name="name" value={newTask.name} onChange={handleInputChange} required />
              </div>

              <div className="form-group">
                <label>Select Color:</label>
                <div className="color-options">
                  {filters.map((color, index) => (
                    <div key={index} className={`color-circle ${newTask.color === color ? 'selected' : ''}`} style={{ backgroundColor: color }} onClick={() => setNewTask(prevTask => ({ ...prevTask, color }))} />
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="startDateTime">Start Date and Time:</label>
                <input type="datetime-local" id="startDateTime" name="startDateTime" value={newTask.startDateTime} onChange={handleInputChange} required />
              </div>

              <div className="form-group">
                <label htmlFor="endDateTime">End Date and Time:</label>
                <input type="datetime-local" id="endDateTime" name="endDateTime" value={newTask.endDateTime} onChange={handleInputChange} required min={newTask.startDateTime} />
              </div>

              <div className="form-group">
                <label htmlFor="repeat">Repeat:</label>
                <select id="repeat" name="repeat" value={newTask.repeat} onChange={handleInputChange}>
                  {repeatOptions.map(option => <option key={option} value={option}>{option}</option>)}
                </select>
              </div>

              {newTask.repeat !== 'none' && (
                <div className="form-group">
                  <label htmlFor="repeatEndDate">Repeat End Date (optional):</label>
                  <input type="date" id="repeatEndDate" name="repeatEndDate" value={newTask.repeatEndDate} onChange={handleInputChange} />
                </div>
              )}

              <div className="form-group checkbox-group">
                <label>
                  <input type="checkbox" name="urgent" checked={newTask.urgent} onChange={handleInputChange} />
                  Mark as urgent
                </label>
              </div>

              <div className="modal-buttons">
                <button type="submit" className="submit-button">Add Task</button>
                <button type="button" className="cancel-button" onClick={handleCloseModal}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default TodoList;
