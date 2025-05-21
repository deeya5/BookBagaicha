import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Header.css";
import logo from "../assets/logo.png";

const Header = () => {
  const [showSidebar, setShowSidebar] = useState(false);
  const [userName, setUserName] = useState(localStorage.getItem("username") || "");
  const [avatar, setAvatar] = useState(localStorage.getItem("avatar") || "");
  const [isAuthor, setIsAuthor] = useState(localStorage.getItem("isAuthor") === "true");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [noResults, setNoResults] = useState(false);
  const navigate = useNavigate();
  const searchRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchResults([]);
        setNoResults(false);
      }
    };
  
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      const authToken = localStorage.getItem("authToken");
      if (authToken) {
        try {
          const response = await axios.get("http://localhost:1000/api/v1/profile", {
            headers: { Authorization: `Bearer ${authToken}` },
          });
          const userData = response.data;
          setUserName(userData.username);
          setAvatar(userData.avatar);
          localStorage.setItem("username", userData.username);
          localStorage.setItem("avatar", userData.avatar);
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };

    fetchUserData();

    const handleStorageChange = () => {
      setUserName(localStorage.getItem("username") || "");
      setAvatar(localStorage.getItem("avatar") || "");
      setIsAuthor(localStorage.getItem("isAuthor") === "true");
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
    localStorage.removeItem("avatar");
    localStorage.removeItem("isAuthor");
    setUserName("");
    setAvatar("");
    setIsAuthor(false);
    toggleSidebar();
    window.dispatchEvent(new Event("storage"));
    navigate("/login");
  };

  const toggleAuthorMode = async () => {
    const token = localStorage.getItem("authToken");
    try {
      const response = await axios.patch("http://localhost:1000/api/v1/switch-role", {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const newRole = response.data.role;
      const isNowAuthor = newRole === "author";
      setIsAuthor(isNowAuthor);
      localStorage.setItem("isAuthor", isNowAuthor.toString());
    } catch (err) {
      console.error("Error switching role:", err);
    }
  };

  const handleSearchChange = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim() === "") {
      setSearchResults([]);
      setNoResults(false);
      return;
    }

    try {
      const response = await axios.get(`http://localhost:1000/api/v1/search-books?title=${query}`);
      if (response.data.status === "Success" && response.data.data.length > 0) {
        setSearchResults(response.data.data);
        setNoResults(false);
      } else {
        setSearchResults([]);
        setNoResults(true);
      }
    } catch (error) {
      console.error("Error searching books:", error);
    }
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === "Enter") {
      navigate(`/search-results?query=${searchQuery}`);
    }
  };

  return (
    <>
      <header className="header">
        <div className="header-container">
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
              {isAuthor && <li><Link to="/write">Write</Link></li>}
            </ul>
          </nav>
          
          <div className="header-actions">
            <div className="search-container" ref={searchRef}>
              <input
                type="text"
                className="search-bar"
                placeholder="Search books..."
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyDown={handleSearchKeyPress}
              />
              <i className="fas fa-search search-icon"></i>
              
              {searchQuery && (
                <div className={`search-results ${searchResults.length > 0 || noResults ? 'visible' : ''}`}>
                  {searchResults.length > 0 ? (
                    <ul>
                      {searchResults.map((book) => (
                        <li key={book._id}>
                          <Link 
                            to={`/book/${book._id}`} 
                            state={{ book }} 
                            onClick={() => setSearchQuery("")}
                          >
                            {book.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : noResults ? (
                    <div className="no-results">No results found</div>
                  ) : null}
                </div>
              )}
            </div>

            <button className="user-icon" onClick={toggleSidebar}>
              {avatar ? (
                <img className="avatar-small" src={avatar} alt="Profile" />
              ) : (
                <i className="fas fa-user-circle"></i>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <div className={`sidebar ${showSidebar ? "show" : ""}`}>
        <button className="close-button" onClick={toggleSidebar}>&times;</button>

        <div className="profile-section">
          {userName ? (
            <>
              <img className="profile-avatar" src={avatar || "https://cdn-icons-png.flaticon.com/128/3177/3177440.png"} alt="Profile" />
              <h2>{userName}</h2>
            </>
          ) : (
            <h2>Guest</h2>
          )}
          {userName && (
            <div className="profile-links">
              <Link to="/profile" onClick={toggleSidebar}>
                <i className="fas fa-user"></i> My Profile
              </Link>
              <Link to="/library" onClick={toggleSidebar}>
                <i className="fas fa-book"></i> My Library
              </Link>
              <Link to="/settings" onClick={toggleSidebar}>
                <i className="fas fa-cog"></i> Settings
              </Link>
            </div>
          )}
        </div>

        <div className="buttons-container">
          {!userName ? (
            <>
              <Link to="/login" className="menu-button" onClick={toggleSidebar}>Login</Link>
              <Link to="/signup" className="menu-button signup-button" onClick={toggleSidebar}>Signup</Link>
            </>
          ) : (
            <>
              {!isAuthor && (
                <button className="menu-button author-mode-button" onClick={toggleAuthorMode}>
                  <i className="fas fa-pen-fancy"></i> Switch to Author
                </button>
              )}
              <button className="menu-button logout-button" onClick={handleLogout}>
                <i className="fas fa-sign-out-alt"></i> Logout
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Header;