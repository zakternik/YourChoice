import axios from 'axios';
import sha256 from 'crypto-js/sha256';
import Cookie from 'js-cookie';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import env from "../../env.json";
import './profile.css';

function Profile() {
  const navigate = useNavigate();
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

  const [isModalOpen, setModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [toastMessages, setToastMessages] = useState([]);

  useEffect(() => {
    if (Cookie.get("signed_in_user") !== undefined) {
      const user = JSON.parse(Cookie.get('signed_in_user'));
      axios.get(`${env.api}/auth/user/${user._id}/get-profile`)
        .then((response) => {
          setUserData((prevData) => ({
            ...prevData,
            Email: response.data.Email || "",
            Username: response.data.Username || "",
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
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
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
    axios.put(`${env.api}/auth/user/${user._id}/update-data`, userData)
      .then(() => {
        showToast('Changes saved!');
      }).catch((error) => {
        console.log('Error:', error);
      });
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      const user = JSON.parse(Cookie.get('signed_in_user'));
      axios.delete(`${env.api}/auth/user/${user._id}`)
        .then(() => {
          Cookie.remove("signed_in_user");
          showToast('Account deleted.', 'error');
          navigate("/");
          window.location.reload();
        }).catch((error) => {
          console.log('Error:', error);
        });
    }
  };

  const handlePasswordChange = () => {
    if (newPassword !== confirmPassword) {
      showToast('New password and confirmation do not match.', 'error');
      return;
    }

    // Hash passwords before sending
    const hashedCurrentPassword = sha256(currentPassword).toString();
    const hashedNewPassword = sha256(newPassword).toString();

    const user = JSON.parse(Cookie.get('signed_in_user'));
    axios.put(`${env.api}/auth/user/${user._id}/change-password`, {
      currentPassword: hashedCurrentPassword,
      newPassword: hashedNewPassword,
    }).then(() => {
      showToast('Password changed successfully.');
      setModalOpen(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }).catch((error) => {
      console.log('Error:', error);
      showToast('Failed to change password. Please check your current password.', 'error');
    });
  };

  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToastMessages((prev) => [
      ...prev,
      { id, message, type },
    ]);

    setTimeout(() => {
      setToastMessages((prev) => prev.filter((toast) => toast.id !== id));
    }, 5000);
  };

  return (
    <div className="page-background">
      <div className="profile-container">
        <h1>My Profile</h1>

        {/* Sekcija za spremembo osebnih podatkov */}
        <div className="section data-section">
          <h2>Update Personal Information</h2>
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
        </div>

        {/* Sekcija za spremembo gesla */}
        <div className="section password-section">
          <h2>Change Password</h2>
          <p>
              Changing your password regularly will help keep your account secure. 
              Make sure to choose a strong password that you haven't used before.
          </p>
          <button
            type="button"
            className="change-password-button"
            onClick={() => setModalOpen(true)}
          >
            Change Password
          </button>
        </div>

        {/* Sekcija za izbris računa */}
        <div className="section delete-section">
          <h2>Delete Account</h2>
          <p>
            After deleting your account, you will lose all related information
            including tasks, events, projects, notes, etc. You will not be able to
            recover it later, so think twice before doing this.
          </p>
          <button type="button" className="delete-button" onClick={handleDeleteAccount}>
            Delete My Account
          </button>
        </div>
      </div>

      {/* Toast obvestila */}
      <div className="toast-container">
        {toastMessages.map((toast) => (
          <div
            key={toast.id}
            className={`toast ${toast.type === 'error' ? 'toast-error' : ''} show`}
          >
            {toast.message}
          </div>
        ))}
      </div>

      {/* Modal za spremembo gesla */}
      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>Change Password</h2>
            <div className="form-group">
              <label>Current Password:</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
              />
            </div>
            <div className="form-group">
              <label>New Password:</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
              />
            </div>
            <div className="form-group">
              <label>Confirm New Password:</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
              />
            </div>
            <div className="modal-buttons">
              <button onClick={handlePasswordChange}>Save</button>
              <button onClick={() => setModalOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
