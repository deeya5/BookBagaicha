import React, { useState, useEffect } from "react";
import "../styles/Settings.css";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';


const Settings = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState(
    "https://cdn-icons-png.flaticon.com/512/3177/3177440.png"
  );
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);


  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      try {
        const res = await axios.get("http://localhost:1000/api/v1/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const { username, email, avatar } = res.data;
        setUsername(username);
        setEmail(email);
        if (avatar) setProfileImage(avatar);

      } catch (err) {
        console.error("Failed to fetch user:", err);
      }
    };

    fetchUserData();
  }, []);

  const handleEditClick = async () => {
    if (isEditing) {
      const token = localStorage.getItem("authToken");
      try {
        await axios.put(
          "http://localhost:1000/api/v1/profile",
          { username, email, avatar: profileImage },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        toast.success("Profile updated successfully.");
      } catch (err) {
        console.error("Failed to update profile:", err);
        toast.error("Failed to update profile.");
      }
    }
    setIsEditing(!isEditing);
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    window.location.href = "/login";
  };

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete your account?");
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("authToken");
      await axios.delete("http://localhost:1000/api/v1/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      localStorage.removeItem("authToken");
      window.location.href = "/signup";
    } catch (err) {
      console.error("Failed to delete account:", err);
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result); // Base64 string
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="settings-container">
          <ToastContainer />

      <div className="profile-header">
      <div className="avatar-circle">
  <img src={profileImage} alt="Profile" />
  {isEditing && (
    <label className="add-icon">
      +
      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        style={{ display: "none" }}
      />
    </label>
  )}
</div>


        <div className="user-info">
          <h2>{username}</h2>
          <p>{email}</p>
        </div>
      </div>

      <div className="form-section">
        <div className="form-group">
          <label>Username</label>
          <input
            type="text"
            value={username}
            // placeholder=""
            disabled={!isEditing}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Email ID</label>
          <input
            type="email"
            value={email}
            // placeholder=""
            disabled={!isEditing}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      </div>

      <div className="buttons">
        <button className="edit-btn" onClick={handleEditClick}>
          {isEditing ? "Save" : "Edit"}
        </button>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className="delete-section">
  <button className="delete-btn" onClick={() => setShowDeleteModal(true)}>
    Delete Account
  </button>
</div>

{showDeleteModal && (
  <div className="modal-overlay">
    <div className="modal">
      <h3>Confirm Deletion</h3>
      <p>Are you sure you want to delete your account?</p>
      <div className="modal-buttons">
        <button className="confirm-delete" onClick={handleDeleteAccount}>Yes, Delete</button>
        <button className="cancel-delete" onClick={() => setShowDeleteModal(false)}>Cancel</button>
      </div>
    </div>
  </div>
)}

    </div>
    
    

  );
};

export default Settings;
