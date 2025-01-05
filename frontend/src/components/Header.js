import React from "react";
import { Link } from "react-router-dom";
import "../styles/Header.css";
import logo from "../assets/logo.png";

const Header = () => {
  return (
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
            <Link to="/write">Write</Link>
          </li>
        </ul>
      </nav>
      <div className="header-actions">
        <input
          type="text"
          className="search-bar"
          placeholder="Search..."
        />
        <Link to="/library" className="book-icon">
          <i className="fas fa-book"></i> {/* Book icon */}
        </Link>
        
        <Link to="/login" className="user-icon">
          <i className="fa fa-user-circle"></i>
        </Link>
      </div>
    </header>
  );
};

export default Header;
