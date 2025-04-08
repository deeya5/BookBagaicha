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

  // State for Users, Authors, Books, and Genres
  const [users, setUsers] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [books, setBooks] = useState([]);
  const [genres, setGenres] = useState([]);

  // Fetch Dashboard Data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const admin = localStorage.getItem("username");
        setAdminName(admin);

        // Fetching total users, books, genres data
        const usersResponse = await axios.get("http://localhost:1000/api/v1/get-total-users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const booksResponse = await axios.get("http://localhost:1000/api/v1/get-all-books", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const genresResponse = await axios.get("http://localhost:1000/api/v1/get-total-genres", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setTotalUsers(usersResponse.data.totalUsers);
        setTotalBooks(booksResponse.data.totalBooks); // Set total books
        setTotalGenres(genresResponse.data.totalGenres);

        // Also fetch books data to display in the "Books" section
        setBooks(booksResponse.data.books); // Assuming booksResponse.data.books contains the array of books
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setError("Failed to load dashboard data.");
      }
    };

    fetchDashboardData();
  }, []);

  // Fetch Users by Role
  const fetchUsersByRole = async (role) => {
    try {
      const response = await axios.get(`http://localhost:1000/api/v1/users/role/${role}`);
      if (role === "user") {
        setUsers(response.data);
      } else if (role === "author") {
        setAuthors(response.data);
      }
    } catch (error) {
      console.error("Error fetching users by role:", error);
    }
  };

  // Fetch Books
  const fetchBooks = async () => {
    try {
      const response = await axios.get("http://localhost:1000/api/v1/get-books");
      setBooks(response.data); // Assuming response.data is an array of books
    } catch (error) {
      console.error("Error fetching books:", error);
    }
  };

  // Fetch Genres
  const fetchGenres = async () => {
    try {
      const response = await axios.get("http://localhost:1000/api/v1/get-genres");
      setGenres(response.data);
    } catch (error) {
      console.error("Error fetching genres:", error);
    }
  };

  // Delete Item
  const deleteItem = async (type, id) => {
    try {
      await axios.delete(`http://localhost:1000/api/v1/delete-${type}/${id}`);
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
                    <td>
                      <button onClick={() => deleteItem("user", user._id)}>Delete</button>
                    </td>
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
                    <td>
                      <button onClick={() => deleteItem("author", author._id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {currentView === "books" && (
          <section className="books-section">
            <h2>Books</h2>
            <p>Total Books: {totalBooks}</p> {/* Display total books count */}
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
                    <td>
                      <button onClick={() => deleteItem("genre", genre._id)}>Delete</button>
                    </td>
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
