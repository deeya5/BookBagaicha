import React, { useState } from "react";
import "../styles/Settings.css";

const Settings = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState(
    "https://cdn-icons-png.flaticon.com/512/3177/3177440.png"
  );

  const handleEditClick = () => {
    setIsEditing(!isEditing);
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    window.location.href = "/login"; // Redirect to login page
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="settings-container">
      <div className="profile-header">
        <div className="avatar-circle">
          <img src={profileImage} alt="Profile" />
          <label className="edit-avatar">
            Edit
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: "none" }}
            />
          </label>
        </div>
        <div className="user-info">
          <h2>Deeya Bastola</h2>
          <p>deeyabastola55@gmail.com</p>
        </div>
      </div>

      <div className="form-section">
        <div className="form-group">
          <label>Full Name</label>
          <input type="text" placeholder="Your First Name" disabled={!isEditing} />
        </div>

        <div className="form-group">
          <label>Language</label>
          <select disabled={!isEditing}>
            <option>English</option>
            <option>Nepali</option>
          </select>
        </div>

        <div className="form-group">
          <label>Email ID</label>
          <input type="email" placeholder="Your Email ID" disabled={!isEditing} />
        </div>
      </div>

      <div className="buttons">
        <button className="edit-btn" onClick={handleEditClick}>
          {isEditing ? "Save" : "Edit"}
        </button>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
};

export default Settings;
