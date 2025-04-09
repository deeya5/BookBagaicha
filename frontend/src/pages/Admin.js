import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/Admin.css";
import logo from "../assets/logo.png";
import userIcon from "../assets/romance.jpg";

const Admin = () => {
  const [adminName, setAdminName] = useState("");
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalBooks, setTotalBooks] = useState(0);
  const [totalGenres, setTotalGenres] = useState(0);
  const [error, setError] = useState("");
  const [currentView, setCurrentView] = useState("dashboard");

  const [users, setUsers] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [books, setBooks] = useState([]);
  const [genres, setGenres] = useState([]);
  const [activityLog, setActivityLog] = useState([]);

  // Fetch Dashboard Data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("authToken"); // Fetch token from localStorage
        const admin = localStorage.getItem("username"); // Fetch admin name from localStorage
        setAdminName(admin);

        if (!token) {
          console.error("Authentication token is missing.");
          setError("Authentication token is missing.");
          return;
        }

        // Fetch dashboard data (users, books, genres)
        const usersResponse = await axios.get("http://localhost:1000/api/v1/get-total-users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const booksResponse = await axios.get("http://localhost:1000/api/v1/get-all-books", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const genresResponse = await axios.get("http://localhost:1000/api/v1/get-total-genres", {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Fetch activity log if token is present
        const activityLogResponse = await axios.get("http://localhost:1000/api/v1/activity-log", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setTotalUsers(usersResponse.data.totalUsers);
        setTotalBooks(booksResponse.data.totalBooks);
        setTotalGenres(genresResponse.data.totalGenres);
        setBooks(booksResponse.data.books);

        // Check if activityLogResponse contains valid data
        if (activityLogResponse && activityLogResponse.data && Array.isArray(activityLogResponse.data)) {
          setActivityLog(activityLogResponse.data);
        } else {
          console.error("Activity log data is empty or not found.");
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setError("Failed to load dashboard data.");
      }
    };

    fetchDashboardData();
  }, []); // Dependency array is empty to ensure it runs only once when the component mounts

  const fetchUsersByRole = async (role) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(`http://localhost:1000/api/v1/users/role/${role}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (role === "user") setUsers(response.data);
      else if (role === "author") setAuthors(response.data);
    } catch (error) {
      console.error("Error fetching users by role:", error);
    }
  };

  const fetchBooks = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get("http://localhost:1000/api/v1/get-books", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBooks(response.data);
    } catch (error) {
      console.error("Error fetching books:", error);
    }
  };

  const fetchGenres = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get("http://localhost:1000/api/v1/get-genres", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGenres(response.data);
    } catch (error) {
      console.error("Error fetching genres:", error);
    }
  };

  const deleteItem = async (type, id) => {
    try {
      const token = localStorage.getItem("authToken");
      await axios.delete(`http://localhost:1000/api/v1/delete-${type}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (type === "user") fetchUsersByRole("user");
      if (type === "author") fetchUsersByRole("author");
      if (type === "book") fetchBooks();
      if (type === "genre") fetchGenres();
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
    }
  };

  return (
    <div className="admin-container">
      <aside className="admin-sidebar">
        <div className="admin-profile">
          <img src={userIcon} alt="Admin" className="admin-avatar" />
          <h3>{adminName}</h3>
          <p className="online-status">Online</p>
        </div>
        <nav className="admin-nav">
          <button onClick={() => setCurrentView("dashboard")}>Dashboard</button>
          <button onClick={() => { setCurrentView("users"); fetchUsersByRole("user"); }}>Readers</button>
          <button onClick={() => { setCurrentView("authors"); fetchUsersByRole("author"); }}>Authors</button>
          <button onClick={() => { setCurrentView("books"); fetchBooks(); }}>Books</button>
          <button onClick={() => { setCurrentView("genres"); fetchGenres(); }}>Genres</button>
        </nav>
      </aside>

      <main className="admin-content">
        <header className="admin-header">
          <img src={logo} alt="Book Bagaicha Logo" className="admin-logo" />
          <div className="admin-info">
            <span>{adminName}</span>
          </div>
        </header>

        {currentView === "dashboard" && (
          <section className="dashboard">
            <h2>Dashboard</h2>
            {error && <p className="error-message">{error}</p>}
            <div className="dashboard-stats">
              <div className="stat-card users">
                <h3>Users</h3>
                <p>{totalUsers}</p>
              </div>
              <div className="stat-card books">
                <h3>Books</h3>
                <p>{totalBooks}</p>
              </div>
              <div className="stat-card genres">
                <h3>Genres</h3>
                <p>{totalGenres}</p>
              </div>
            </div>

            <div className="activity-log">
              <h3>Recent Activity</h3>
              <ul>
                {activityLog.length === 0 ? (
                  <li>No recent activity.</li>
                ) : (
                  activityLog.map((log) => (
                    <li key={log._id}>
                      <span>{log.action}</span>
                      <small>{new Date(log.timestamp).toLocaleString()}</small>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </section>
        )}

        {currentView === "users" && (
          <section className="users-section">
            <h2>Readers</h2>
            <table className="users-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td><button onClick={() => deleteItem("user", user._id)}>Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {currentView === "authors" && (
          <section className="authors-section">
            <h2>Authors</h2>
            <table className="authors-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {authors.map((author) => (
                  <tr key={author._id}>
                    <td>{author.username || "N/A"}</td>
                    <td>{author.email}</td>
                    <td><button onClick={() => deleteItem("author", author._id)}>Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {currentView === "books" && (
          <section className="books-section">
            <h2>Books</h2>
            <p>Total Books: {totalBooks}</p>
            <table className="books-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Genre</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {books.map((book) => (
                  <tr key={book._id}>
                    <td>{book.title}</td>
                    <td>{book.author}</td>
                    <td>{book.genre}</td>
                    <td><button onClick={() => deleteItem("book", book._id)}>Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {currentView === "genres" && (
          <section className="genres-section">
            <h2>Genres</h2>
            <table className="genres-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {genres.map((genre) => (
                  <tr key={genre._id}>
                    <td>{genre.name || "N/A"}</td>
                    <td><button onClick={() => deleteItem("genre", genre._id)}>Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}
      </main>
    </div>
  );
};

export default Admin;
