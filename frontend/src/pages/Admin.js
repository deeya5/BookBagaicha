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
  const [reviews, setReviews] = useState([]);
  const [admins, setAdmins] = useState([]);


  const [form, setForm] = useState({});
  const [formType, setFormType] = useState(null);
  const [formId, setFormId] = useState(null);

  const token = localStorage.getItem("authToken");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const admin = localStorage.getItem("username");
        setAdminName(admin || "Admin");
        if (!token) return setError("Authentication token is missing.");

        const [usersRes, booksRes, genresRes, activityLogRes] = await Promise.all([
          axios.get("http://localhost:1000/api/v1/get-total-users", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get("http://localhost:1000/api/v1/get-all-books", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get("http://localhost:1000/api/v1/get-total-genres", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get("http://localhost:1000/api/v1/activity-log", { headers: { Authorization: `Bearer ${token}` } })
        ]);

        setTotalUsers(usersRes.data.totalUsers || 0);
        setBooks(booksRes.data.data || []);
        setTotalBooks((booksRes.data.data || []).length);
        setTotalGenres(genresRes.data.totalGenres || 0);
        setActivityLog(Array.isArray(activityLogRes.data) ? activityLogRes.data : []);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data.");
      }
    };

    fetchDashboardData();
  }, []);

  const fetchUsersByRole = async (role) => {
    try {
      const res = await axios.get(`http://localhost:1000/api/v1/users/role/${role}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      role === "user" ? setUsers(res.data) : setAuthors(res.data);
    } catch (err) {
      console.error(`Error fetching ${role}s:`, err);
    }
  };

  const fetchAllAdmins = async () => {
    try {
      const roles = ["admin_user", "admin_book", "super_admin"];
      const promises = roles.map(role =>
        axios.get(`http://localhost:1000/api/v1/users/role/${role}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
      );
  
      const results = await Promise.all(promises);
      const allAdmins = results.flatMap((res) => res.data);
      setAdmins(allAdmins);
    } catch (err) {
      console.error("Error fetching all admins:", err);
    }
  };
  

  const fetchBooks = async () => {
    try {
      const res = await axios.get("http://localhost:1000/api/v1/get-all-books", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBooks(res.data.data || []);
    } catch (err) {
      console.error("Error fetching books:", err);
    }
  };

  const fetchGenres = async () => {
    try {
      const res = await axios.get("http://localhost:1000/api/v1/get-all-genres", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGenres(res.data.genres || []);
    } catch (err) {
      console.error("Error fetching genres:", err);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await axios.get("http://localhost:1000/api/v1/reviews/get-all-reviews", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReviews(res.data.reviews || []);
    } catch (err) {
      console.error("Error fetching reviews:", err);
    }
  };

  const deleteItem = async (type, id) => {
    try {
      await axios.delete(`http://localhost:1000/api/v1/delete-${type}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      reload(type);
    } catch (err) {
      console.error(`Error deleting ${type}:`, err);
    }
  };

  const reload = (type) => {
    switch (type) {
      case "user": fetchUsersByRole("user"); break;
      case "author": fetchUsersByRole("author"); break;
      case "book": fetchBooks(); break;
      case "genre": fetchGenres(); break;
      case "review": fetchReviews(); break;
      default: break;
    }
  };

  const handleEdit = (item, type) => {
    setForm(item);
    setFormType(type);
    setFormId(item._id);
  };

  const handleSubmit = async () => {
    try {
      const url = formId ? `http://localhost:1000/api/v1/update-${formType}/${formId}` : `http://localhost:1000/api/v1/create-${formType}`;
      const method = formId ? "put" : "post";
      await axios[method](url, form, { headers: { Authorization: `Bearer ${token}` } });
      setForm({});
      setFormId(null);
      reload(formType);
    } catch (err) {
      console.error(`Error ${formId ? "updating" : "creating"} ${formType}:`, err);
    }
  };

  const [isModalOpen, setIsModalOpen] = useState(false);

  const openManageModal = (item, type) => {
    setForm(item);
    setFormType(type);
    setFormId(item._id);
    setIsModalOpen(true);
  };

  const closeManageModal = () => {
    setIsModalOpen(false);
    setForm({});
    setFormId(null);
    setFormType(null);
  };

  return (
    <div className="admin-container">
      <aside className="admin-sidebar">
        <div className="admin-profile">
          <img src={userIcon} alt="Admin" className="admin-avatar" />
          <h3>{adminName}</h3>
        </div>
        <nav className="admin-nav">
          <button onClick={() => setCurrentView("dashboard")}>Dashboard</button>
          <button onClick={() => { setCurrentView("users"); fetchUsersByRole("user"); }}>Readers</button>
          <button onClick={() => { setCurrentView("authors"); fetchUsersByRole("author"); }}>Authors</button>
          <button onClick={() => { setCurrentView("books"); fetchBooks(); }}>Books</button>
          <button onClick={() => { setCurrentView("genres"); fetchGenres(); }}>Genres</button>
          <button onClick={() => { setCurrentView("reviews"); fetchReviews(); }}>Ratings & Reviews</button>
          <button onClick={() => { setCurrentView("admins"); fetchAllAdmins(); }}>Admins</button>

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
              <div className="stat-card users"><h3>Users</h3><p>{totalUsers}</p></div>
              <div className="stat-card books"><h3>Books</h3><p>{totalBooks}</p></div>
              <div className="stat-card genres"><h3>Genres</h3><p>{totalGenres}</p></div>
            </div>
            <div className="activity-log">
              <h3>Recent Activity</h3>
              {activityLog.length === 0 ? (
                <p>No recent activity.</p>
              ) : (
                <table className="activity-log-table">
                  <thead>
                    <tr><th>Action</th><th>User</th><th>Details</th><th>Timestamp</th></tr>
                  </thead>
                  <tbody>
                    {activityLog.map((log) => (
                      <tr key={log._id}>
                        <td>{log.action}</td>
                        <td>{log.user?.username || "N/A"}</td>
                        <td>{log.details || "—"}</td>
                        <td>{new Date(log.timestamp).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>
        )}
  
        {currentView === "users" && (
          <section className="users-section">
            <h2>Readers</h2>
            <table className="users-table">
              <thead>
                <tr><th>Name</th><th>Email</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td><button className="manage-button" onClick={() => openManageModal(user, "user")}>Manage</button></td>
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
                <tr><th>Name</th><th>Email</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {authors.map((author) => (
                  <tr key={author._id}>
                    <td>{author.username}</td>
                    <td>{author.email}</td>
                    <td><button className="manage-button" onClick={() => openManageModal(author, "author")}>Manage</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}
  
        {currentView === "books" && (
          <section className="books-section">
            <h2>Books</h2>
            <p>Total Books: {books.length}</p>
            <table className="books-table">
              <thead>
                <tr><th>Title</th><th>Author</th><th>Genre</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {books.map((book) => (
                  <tr key={book._id}>
                    <td>{book.title}</td>
                    <td>{book.author}</td>
                    <td>{book.genre?.name || "N/A"}</td>
                    <td><button className="manage-button" onClick={() => openManageModal(book, "book")}>Manage</button></td>
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
                <tr><th>Name</th><th>Book Count</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {genres.map((genre) => (
                  <tr key={genre._id}>
                    <td>{genre.name}</td>
                    <td>{genre.bookCount ?? 0}</td>
                    <td><button className="manage-button" onClick={() => openManageModal(genre, "genre")}>Manage</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}
  
        {currentView === "reviews" && (
          <section className="reviews-section">
            <h2>Ratings & Reviews</h2>
            <table className="reviews-table">
              <thead>
                <tr><th>User</th><th>Book</th><th>Rating</th><th>Review</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {reviews.length > 0 ? (
                  reviews.map((review) => (
                    <tr key={review._id}>
                      <td>{review.user?.username || "N/A"}</td>
                      <td>{review.book?.title || "N/A"}</td>
                      <td>{review.rating}</td>
                      <td>{review.comment || "—"}</td>
                      <td><button className="manage-button" onClick={() => openManageModal(review, "review")}>Manage</button></td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5">No reviews found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>
        )}

        {currentView === "admins" && (
          <section className="admins-section">
            <h2>Admins</h2>
            <table className="admins-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {admins.length > 0 ? (
                  admins.map((admin) => (
                    <tr key={admin._id}>
                      <td>{admin.username}</td>
                      <td>{admin.email}</td>
                      <td>{admin.role}</td>
                      <td>
                        <button className="manage-button" onClick={() => openManageModal(admin, "user")}>Manage</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4">No admins found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>
        )}



      </main>

      {isModalOpen && (
  <div className="modal-overlay">
    <div className="modal-content">
      <h3>{formId ? `Edit ${formType}` : `Create ${formType}`}</h3>
      {Object.keys(form).map((key) => (
        <div key={key} className="form-group">
          <label>{key}</label>
          <input
            value={form[key]}
            onChange={(e) =>
              setForm({ ...form, [key]: e.target.value })
            }
          />
        </div>
      ))}
      <div className="modal-actions">
        <button onClick={handleSubmit}>{formId ? "Update" : "Create"}</button>
        <button onClick={() => deleteItem(formType, formId)}>Delete</button>
        <button onClick={closeManageModal}>Cancel</button>
      </div>
    </div>
  </div>
)}



    </div>


  );
  
};

export default Admin;
