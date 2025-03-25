import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/Header.css";
import logo from "../assets/logo.png";

const Header = () => {
  const [showSidebar, setShowSidebar] = useState(false);
  const [userName, setUserName] = useState(localStorage.getItem("username") || "");  

  useEffect(() => {
    // Listen for changes in localStorage
    const handleStorageChange = () => {
      setUserName(localStorage.getItem("username") || "");  
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const toggleSidebar = () => {
    setShowSidebar((prev) => !prev);
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("username");
    setUserName("");  
    toggleSidebar();
    window.dispatchEvent(new Event("storage")); // Ensure UI updates
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
            <li><Link to="/">Home</Link></li>
            <li><Link to="/explore">Explore</Link></li>
            <li><Link to="/genre">Genre</Link></li>
            <li><Link to="/write">Write</Link></li>
          </ul>
        </nav>
        <div className="header-actions">
          <input type="text" className="search-bar" placeholder="Search..." />
          <Link to="/library" className="book-icon">
            <i className="fas fa-book"></i>
          </Link>
          <button className="user-icon" onClick={toggleSidebar}>
            <i className="fas fa-user-circle"></i>
          </button>
        </div>
      </header>

      {/* Sidebar */}
      <div className={`sidebar ${showSidebar ? "show" : ""}`}>
        <button className="close-button" onClick={toggleSidebar}>&times;</button>

        <div className="profile-section">
          <h2>{userName || "Guest"}</h2>  
          {userName && (
            <div className="profile-links">
              <Link to="/profile" onClick={toggleSidebar}>My Profile</Link>
              <Link to="/my-books" onClick={toggleSidebar}>My Books</Link>
              <Link to="/settings" onClick={toggleSidebar}>Settings</Link>
            </div>
          )}
        </div>

        <div className="buttons-container">
          {!userName ? (
            <>
              <Link to="/login" className="menu-button" onClick={toggleSidebar}>Login</Link>
              <Link to="/signup" className="menu-button" onClick={toggleSidebar}>Signup</Link>
            </>
          ) : (
            <button className="menu-button" onClick={handleLogout}>Logout</button>
          )}
        </div>
      </div>
    </>
  );
};

export default Header;
