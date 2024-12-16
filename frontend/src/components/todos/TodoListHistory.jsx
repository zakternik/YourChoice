import axios from 'axios';
import Cookie from "js-cookie";
import React, { useEffect, useState } from 'react';
import env from "../../env.json";
import './todoList.css';

function TodoList() {
  const [tasks, setTasks] = useState([]);

  const [showModal, setShowModal] = useState(false);

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
    axios.get(`${env.api}/task/user/${user._id}/task_history`).then((response) => {
      setTasks(response.data.tasks);
    }).catch((error) => {
      console.log(error);
    });
  }, [showModal]);


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
        <h1>My Todo History</h1>
        <div className="todo-list">
          <div className="todo-header">
          </div>
          <ul>{renderTasks()}</ul>
        </div>
      </div>
    </div>
  );
}

export default TodoList;
