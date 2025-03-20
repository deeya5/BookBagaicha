import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/Header.css";
import logo from "../assets/logo.png"; // Import the logo

const Header = () => {
  const [showSidebar, setShowSidebar] = useState(false); // State to toggle sidebar

  const toggleSidebar = () => {
    setShowSidebar((prev) => !prev);
  };

  return (
    <>
      <header className="header">
        <div className="logo">
          <Link to="/">
            <img src={logo} alt="Book Bagaicha Logo" />
          </Link>
        </div>
        <nav className="nav-links">
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/explore">Explore</Link>
            </li>
            <li>
              <Link to="/genre">Genre</Link>
            </li>
            <li>
              <Link to="/write">Write</Link>
            </li>
          </ul>
        </nav>
        <div className="header-actions">
          <input type="text" className="search-bar" placeholder="Search..." />
          <Link to="/library" className="book-icon">
            <i className="fas fa-book"></i> {/* Book icon */}
          </Link>
          <button className="user-icon" onClick={toggleSidebar}>
            <i className="fas fa-user-circle"></i>
          </button>
        </div>
      </header>

      {/* Sidebar Menu */} 
<div className={`sidebar ${showSidebar ? "show" : ""}`}>
  <button className="close-button" onClick={toggleSidebar}>
    &times;
  </button>

  {/* Profile Section */}
  <div className="profile-section">
    <h2>Profile</h2>
    <div className="profile-links">
      <Link to="/profile" onClick={toggleSidebar}>My Profile</Link>
      <Link to="/my-books" onClick={toggleSidebar}>My Books</Link>
      <Link to="/settings" onClick={toggleSidebar}>Settings</Link>
    </div>
  </div>

  {/* Buttons at the Bottom */}
  <div className="buttons-container">
    <Link to="/login" className="menu-button" onClick={toggleSidebar}>
      Login
    </Link>
    <Link to="/signup" className="menu-button" onClick={toggleSidebar}>
      Signup
    </Link>
    <Link to="/logout" className="menu-button" onClick={toggleSidebar}>
      Logout
    </Link>
  </div>
</div>

    </>
  );
};

export default Header;