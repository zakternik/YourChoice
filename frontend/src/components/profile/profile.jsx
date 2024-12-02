import axios from 'axios';
import Cookie from 'js-cookie';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import env from "../../env.json";
import './profile.css';

function Profile() {
  const navigate = useNavigate();
  // Mock user data
  const [userData, setUserData] = useState({
    FirstName: '',
    LastName: '',
    Username: '',
    Email: '',
    Country: '',
    PhoneNumber: '',
    Location: '',
    Birthday: {
      Day: '',
      Month: '',
    },
  });

  // Load mock data when the component mounts
  useEffect(() => {
    console.log(Cookie.get("signed_in_user"));
    if (Cookie.get("signed_in_user") !== undefined) {
      const user = JSON.parse(Cookie.get('signed_in_user'));

      axios.get(`${env.api}/auth/user/${user._id}/get-profile`).then((response) => {
        console.log("USER:", response.data);
        // Map backend fields with capital letters to lowercase fields in userData state
        setUserData((prevData) => ({
          ...prevData,
          Email: response.data.Email || "",       // Map "Email" to "email"
          Username: response.data.Username || "", // Map "Username" to "Username"
          FirstName: response.data.FirstName || "",
          LastName: response.data.LastName || "",
          Country: response.data.Country || "",
          PhoneNumber: response.data.PhoneNumber || "",
          Location: response.data.Location || "",
          Birthday: {
            Day: response.data.Birthday?.Day || "",
            Month: response.data.Birthday?.Month || "",
          },
        }));
      }).catch((error) => {
        console.log('Error:', error);
      });
    }
    /*    const mockData = {
          FirstName: 'Name',
          LastName: 'Surname',
          Username: 'Username',
          email: 'name123@example.com',
          Country: 'Slovenija',
          PhoneNumber: '+1 123 123 123 ',
          Location: 'Maribor',
          birthday: {
            day: '1',
            month: 'January',
          },
        };
        setUserData(mockData);*/
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(e.target)
    if (name === 'Day' || name === 'Month') {
      setUserData((prevData) => ({
        ...prevData,
        Birthday: {
          ...prevData.Birthday,
          [name]: value,
        },
      }));
    } else {
      setUserData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const handleSaveChanges = () => {
    const user = JSON.parse(Cookie.get('signed_in_user'));
    axios.put(`${env.api}/auth/user/${user._id}/update-data`, userData).then(() => {
      alert('Changes saved!');
    }).catch((error) => {
      console.log('Error:', error);
    });
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      const user = JSON.parse(Cookie.get('signed_in_user'));
      axios.delete(`${env.api}/auth/user/${user._id}`).then(() => {
        Cookie.remove("signed_in_user");
        alert('Account deleted.');
        navigate("/");
        window.Location.reload();
      }).catch((error) => {
        console.log('Error:', error);
      });
    }
  };

  return (
    <div className="page-background">
      <div className="profile-container">
        <h1>My Profile</h1>
        <form className="profile-form">
          <div className="form-group">
            <label>First Name:</label>
            <input
              type="text"
              name="FirstName"
              value={userData.FirstName}
              onChange={handleChange}
              placeholder="First Name"
            />
          </div>
          <div className="form-group">
            <label>Last Name:</label>
            <input
              type="text"
              name="LastName"
              value={userData.LastName}
              onChange={handleChange}
              placeholder="Last Name"
            />
          </div>
          <div className="form-group">
            <label>Username:</label>
            <input
              type="text"
              name="Username"
              value={userData.Username}
              onChange={handleChange}
              placeholder="Username"
            />
          </div>
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              name="Email"
              value={userData.Email}
              onChange={handleChange}
              placeholder="Email"
            />
          </div>
          <div className="form-group">
            <label>Country:</label>
            <input
              type="text"
              name="Country"
              value={userData.Country}
              onChange={handleChange}
              placeholder="Country"
            />
          </div>
          <div className="form-group">
            <label>Phone Number:</label>
            <input
              type="text"
              name="PhoneNumber"
              value={userData.PhoneNumber}
              onChange={handleChange}
              placeholder="+00 000 000 000"
            />
          </div>
          <div className="form-group">
            <label>Location:</label>
            <input
              type="text"
              name="Location"
              value={userData.Location}
              onChange={handleChange}
              placeholder="Enter your Location"
            />
          </div>
          <div className="form-group birthday-group">
            <label>Birthday:</label>
            <input
              type="text"
              name="Day"
              value={userData.Birthday.Day}
              onChange={handleChange}
              placeholder="Day"
            />
            <input
              type="text"
              name="Month"
              value={userData.Birthday.Month}
              onChange={handleChange}
              placeholder="Month"
            />
          </div>
          <button type="button" className="save-button" onClick={handleSaveChanges}>
            Save Changes
          </button>
        </form>
        <div className="delete-account-section">
          <h2>Delete Account</h2>
          <p>
            After deleting your account, you will lose all related information including tasks, events,
            projects, notes, etc. You will not be able to recover it later, so think twice before doing
            this.
          </p>
          <button type="button" className="delete-button" onClick={handleDeleteAccount}>
            Delete My Account
          </button>
        </div>
      </div>
    </div>
  );
}

export default Profile;
