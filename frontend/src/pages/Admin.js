import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Admin.css";
import logo from "../assets/logo.png";
import userIcon from "../assets/romance.jpg";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Add custom styles
const customStyles = {
  manage: {
    backgroundColor: "rgb(60, 124, 86)",
    color: "#fff",
    border: "none",
    padding: "6px 14px",
    borderRadius: "6px",
    fontSize: "14px",
    cursor: "pointer",
    transition: "background-color 0.2s ease-in-out",
  },
  manageHover: {
    backgroundColor: "rgb(31, 100, 69)",
  },
  errorMessage: {
    color: "#e63946",
    fontWeight: "bold",
    marginTop: "10px",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  modalContent: {
    background: "white",
    padding: "2rem",
    borderRadius: "10px",
    width: "90%",
    maxWidth: "500px",
    boxShadow: "0 0 10px rgba(0,0,0,0.3)",
  },
  modalTitle: {
    marginTop: 0,
    borderBottom: "1px solid #eee",
    paddingBottom: "10px",
    color: "#333",
  },
  formGroup: {
    marginBottom: "1rem",
  },
  formLabel: {
    display: "block",
    fontWeight: "bold",
    marginBottom: "0.5rem",
    color: "#555",
  },
  formInput: {
    width: "100%",
    padding: "0.5rem",
    border: "1px solid #ccc",
    borderRadius: "5px",
    fontSize: "14px",
  },
  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "1rem",
    marginTop: "1.5rem",
  },
  approveButton: {
    padding: "0.5rem 1rem",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    backgroundColor: "#4CAF50",
    color: "white",
    fontWeight: "bold",
  },
  deleteButton: {
    padding: "0.5rem 1rem",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    backgroundColor: "#f44336",
    color: "white",
    fontWeight: "bold",
  },
  cancelButton: {
    padding: "0.5rem 1rem",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    backgroundColor: "#777",
    color: "white",
  },
  bookDesc: {
    maxHeight: "120px",
    overflowY: "auto",
    padding: "10px",
    border: "1px solid #eee",
    borderRadius: "5px",
    fontSize: "14px",
    backgroundColor: "#f9f9f9",
    marginBottom: "15px",
  },
};

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
  const [pendingBooks, setPendingBooks] = useState([]); // New separate state for pending books
  const [genres, setGenres] = useState([]);
  const [activityLog, setActivityLog] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [admins, setAdmins] = useState([]);

  const [form, setForm] = useState({});
  const [formType, setFormType] = useState(null);
  const [formId, setFormId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const token = localStorage.getItem("authToken");
  const role = localStorage.getItem("userRole"); 
  const allowedRoles = ["admin_user", "admin_book", "super_admin"];
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("authToken"); 
    // console.log("Stored role:", role);
    // console.log("Token:", token);
    if (!allowedRoles.includes(role)) {
      setError("Access Denied: You do not have permission to view this page.");
      navigate("/Login");
      return;
    }
  
    const fetchDashboardData = async () => {
      try {
        const admin = localStorage.getItem("username");
        setAdminName(admin || "Admin");
        if (!token) return setError("Authentication token is missing.");
  
        const [usersRes, booksRes, genresRes, activityLogRes] = await Promise.all([
          axios.get("http://localhost:1000/api/v1/get-total-users", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:1000/api/v1/get-all-books", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:1000/api/v1/get-total-genres", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:1000/api/v1/activity-log", {
            headers: { Authorization: `Bearer ${token}` },
          }),
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
  }, [navigate, token, role, allowedRoles]);
  
  // Fixed rolePermissions - using 'role' instead of 'userRole'
  const rolePermissions = {
    "users": role === "super_admin" || role === "admin_user",
    "books": role === "super_admin" || role === "admin_book",
    "genres": role === "super_admin" || role === "admin_book",
    "authors": role === "super_admin" || role === "admin_book",
    "reviews": role === "super_admin" || role === "admin_book",
    "admins": role === "super_admin",
    "booksToApprove": role === "super_admin" || role === "admin_book"
  };

  const handleViewChange = (view, fetchFn) => {
    if (!rolePermissions[view]) {
      setError("Access Denied: You do not have permission to access this section.");
      toast.warn("You do not have permission to access this section.");
      return;
    }
  
    setCurrentView(view);
    if (fetchFn) fetchFn();
  };

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
      if (!id) {
        console.error("Cannot delete: No ID provided");
        return;
      }
      
      const url = `http://localhost:1000/api/v1/${type}s/${id}`;
      console.log("DELETE URL:", url);
      await axios.delete(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(`${type} deleted successfully!`);
      reload(type);
    } catch (err) {
      console.error(`Error deleting ${type}:`, err);
      toast.error(`Failed to delete ${type}.`);
    }
  };
  
  const reload = (type) => {
    switch (type) {
      case "user": fetchUsersByRole("user"); break;
      case "author": fetchUsersByRole("author"); break;
      case "book": 
        // Check the current view before deciding which fetch to call
        if (currentView === "booksToApprove") {
          fetchBooksToApprove(); 
        } else {
          fetchBooks();
        }
        break;
      case "genre": fetchGenres(); break;
      case "review": fetchReviews(); break;
      default: break;
    }
  };

  const handleSubmit = async () => {
    try {
      const url = formId
        ? `http://localhost:1000/api/v1/${formType}s/${formId}`
        : `http://localhost:1000/api/v1/${formType}s`;

      const method = formId ? "put" : "post";
  
      await axios[method](url, form, { headers: { Authorization: `Bearer ${token}` } });
      
      toast.success(`${formId ? "Updated" : "Created"} ${formType} successfully!`);
      
      setForm({});
      setFormId(null);
      setIsModalOpen(false);
      reload(formType);
    } catch (err) {
      console.error(`Error ${formId ? "updating" : "creating"} ${formType}:`, err);
      toast.error(`Failed to ${formId ? "update" : "create"} ${formType}.`);
    }
  };

  const fetchBooksToApprove = async () => {
    try {
      const res = await axios.get("http://localhost:1000/api/v1/uploaded-books?pending=true", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Set the pending books to a separate state
      setPendingBooks(res.data.books || []);
    } catch (err) {
      console.error("Error fetching Book Bagaicha Original books pending approval:", err);
      toast.error("Failed to load original books pending approval");
    }
  };

  const approveBook = async (bookId) => {
    try {
      await axios.put(`http://localhost:1000/api/v1/approve-book/${bookId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Book approved successfully!");
      fetchBooksToApprove(); // refresh the list
      
      // Log activity for approval
      try {
        await axios.post("http://localhost:1000/api/v1/activity-log", {
          action: "BOOK_APPROVED",
          details: `Book ID: ${bookId} approved for Book Bagaicha Originals`
        }, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (logErr) {
        console.error("Failed to log activity:", logErr);
      }
    } catch (err) {
      console.error("Error approving book:", err);
      toast.error("Failed to approve book.");
    }
  };

  const deleteBookToApprove = async (bookId) => {
    try {
      const url = `http://localhost:1000/api/v1/books/${bookId}`;
      await axios.delete(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Book deleted successfully!");
      fetchBooksToApprove(); // Only refresh the pending books list
      
      // Log activity for deletion
      try {
        await axios.post("http://localhost:1000/api/v1/activity-log", {
          action: "BOOK_DELETED",
          details: `Book ID: ${bookId} deleted from Book Bagaicha Originals pending approval`
        }, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (logErr) {
        console.error("Failed to log activity:", logErr);
      }
    } catch (err) {
      console.error("Error deleting book:", err);
      toast.error("Failed to delete book.");
    }
  };

  const openManageModal = (item, type) => {
    let filteredItem = item;
  
    if (type === "user" || type === "author") {
      filteredItem = {
        _id: item._id,
        username: item.username,
        email: item.email,
        role: item.role
      };
    }

    if (type === "book") {
      filteredItem = {
        _id: item._id,
        title: item.title,
        author: item.author,
        genre: item.genre, // ensure this is either genre ID or name for editing
        desc: item.desc,
        coverImage: item.coverImage,
        url: item.url
      };
    }
 
    setForm(filteredItem);
    setFormType(type);
    setFormId(filteredItem._id);
    setIsModalOpen(true);
  };
  
  // Open modal for pending book approval
  const openApprovalModal = (book) => {
    setForm({
      _id: book._id,
      title: book.title,
      author: book.author,
      genre: book.genre?.name || "N/A",
      desc: book.desc || "No description available",
      coverImage: book.coverImage,
      url: book.url,
      createdAt: book.createdAt ? new Date(book.createdAt).toLocaleDateString() : "N/A"
    });
    setFormType("pendingBook");
    setFormId(book._id);
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
          <button onClick={() => handleViewChange("users", () => fetchUsersByRole("user"))}>Readers</button>
          <button onClick={() => handleViewChange("authors", () => fetchUsersByRole("author"))}>Authors</button>
          <button onClick={() => handleViewChange("books", fetchBooks)}>Books</button>
          <button onClick={() => handleViewChange("genres", fetchGenres)}>Genres</button>
          <button onClick={() => handleViewChange("reviews", fetchReviews)}>Ratings & Reviews</button>
          <button onClick={() => handleViewChange("admins", fetchAllAdmins)}>Admins</button>
          <button onClick={() => handleViewChange("booksToApprove", fetchBooksToApprove)}>Books to Approve</button>
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
                  {[...activityLog]
                      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                      .map((log) => (

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
            <button className="add-button" onClick={() => openManageModal({}, "user")}>Add New</button>
            <table className="users-table">
              <thead>
                <tr><th>Name</th><th>Email</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td>
                      <button 
                        className="manage-button" 
                        style={customStyles.manage}
                        onMouseOver={(e) => Object.assign(e.target.style, customStyles.manageHover)}
                        onMouseOut={(e) => Object.assign(e.target.style, customStyles.manage)}
                        onClick={() => openManageModal(user, "user")}
                      >
                        Manage
                      </button>
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
            <button className="add-button" onClick={() => openManageModal({}, "author")}>Add New</button>
            <table className="authors-table">
              <thead>
                <tr><th>Name</th><th>Email</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {authors.map((author) => (
                  <tr key={author._id}>
                    <td>{author.username}</td>
                    <td>{author.email}</td>
                    <td>
                      <button 
                        className="manage-button" 
                        style={customStyles.manage}
                        onMouseOver={(e) => Object.assign(e.target.style, customStyles.manageHover)}
                        onMouseOut={(e) => Object.assign(e.target.style, customStyles.manage)}
                        onClick={() => openManageModal(author, "author")}
                      >
                        Manage
                      </button>
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
            <button className="add-button" onClick={() => openManageModal({}, "book")}>Add New</button>
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
                    <td>
                      <button 
                        className="manage-button" 
                        style={customStyles.manage}
                        onMouseOver={(e) => Object.assign(e.target.style, customStyles.manageHover)}
                        onMouseOut={(e) => Object.assign(e.target.style, customStyles.manage)}
                        onClick={() => openManageModal(book, "book")}
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}
  
        {currentView === "genres" && (
          <section className="genres-section">
            <h2>Genres</h2>
            <button className="add-button" onClick={() => openManageModal({}, "genre")}>Add New</button>
            <table className="genres-table">
              <thead>
                <tr><th>Name</th><th>Book Count</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {genres.map((genre) => (
                  <tr key={genre._id}>
                    <td>{genre.name}</td>
                    <td>{genre.bookCount ?? 0}</td>
                    <td>
                      <button 
                        className="manage-button" 
                        style={customStyles.manage}
                        onMouseOver={(e) => Object.assign(e.target.style, customStyles.manageHover)}
                        onMouseOut={(e) => Object.assign(e.target.style, customStyles.manage)}
                        onClick={() => openManageModal(genre, "genre")}
                      >
                        Manage
                      </button>
                    </td>
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
                      <td>
                        <button 
                          className="manage-button" 
                          style={customStyles.manage}
                          onMouseOver={(e) => Object.assign(e.target.style, customStyles.manageHover)}
                          onMouseOut={(e) => Object.assign(e.target.style, customStyles.manage)}
                          onClick={() => openManageModal(review, "review")}
                        >
                          Manage
                        </button>
                      </td>
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
            <button className="add-button" onClick={() => openManageModal({}, "user")}>Add New</button>
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
                        <button 
                          className="manage-button" 
                          style={customStyles.manage}
                          onMouseOver={(e) => Object.assign(e.target.style, customStyles.manageHover)}
                          onMouseOut={(e) => Object.assign(e.target.style, customStyles.manage)}
                          onClick={() => openManageModal(admin, "user")}
                        >
                          Manage
                        </button>
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

        {currentView === "booksToApprove" && (
          <section className="pending-books-section">
            <h2>Book Bagaicha Originals Pending Approval</h2>
            {pendingBooks.length === 0 ? (
              <p>No Book Bagaicha Original books pending approval.</p>
            ) : (
              <table className="books-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Author</th>
                    <th>Genre</th>
                    <th>Upload Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingBooks.map((book) => (
                    <tr key={book._id}>
                      <td>{book.title}</td>
                      <td>{book.author}</td>
                      <td>{book.genre?.name || "N/A"}</td>
                      <td>{book.createdAt ? new Date(book.createdAt).toLocaleDateString() : "N/A"}</td>
                      <td>
                        <button 
                          className="manage-button" 
                          style={customStyles.manage}
                          onMouseOver={(e) => Object.assign(e.target.style, customStyles.manageHover)}
                          onMouseOut={(e) => Object.assign(e.target.style, customStyles.manage)}
                          onClick={() => openApprovalModal(book)}
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        )}
      </main>

      {isModalOpen && (
        <div className="modal-overlay" style={customStyles.modalOverlay}>
          <div className="modal-content" style={customStyles.modalContent}>
            <h3 style={customStyles.modalTitle}>
              {formType === "pendingBook" 
                ? "Book Approval" 
                : formId 
                  ? `Edit ${formType}` 
                  : `Create ${formType}`}
            </h3>
            
            {formType === "pendingBook" ? (
              <>
                <div>
                  <h4>Book Details</h4>
                  <p><strong>Title:</strong> {form.title}</p>
                  <p><strong>Author:</strong> {form.author}</p>
                  <p><strong>Genre:</strong> {form.genre}</p>
                  <p><strong>Upload Date:</strong> {form.createdAt}</p>
                  <p><strong>Description:</strong></p>
                  <div style={customStyles.bookDesc}>{form.desc}</div>
                  
                  <div style={customStyles.modalActions}>
                    <button 
                      style={customStyles.approveButton} 
                      onClick={() => {
                        approveBook(formId);
                        closeManageModal();
                      }}
                    >
                      Approve
                    </button>
                    <button 
                      style={customStyles.deleteButton} 
                      onClick={() => {
                        deleteBookToApprove(formId);
                        closeManageModal();
                      }}
                    >
                      Delete
                    </button>
                    <button style={customStyles.cancelButton} onClick={closeManageModal}>Cancel</button>
                  </div>
                </div>
              </>
            ) : (
              <>
                {Object.keys(form).map((key) => (
                  <div key={key} className="form-group" style={customStyles.formGroup}>
                    <label style={customStyles.formLabel}>{key}</label>
                    <input
                      style={customStyles.formInput}
                      value={form[key] || ""}
                      onChange={(e) =>
                        setForm({ ...form, [key]: e.target.value })
                      }
                    />
                  </div>
                ))}
                <div className="modal-actions" style={customStyles.modalActions}>
                  <button 
                    style={customStyles.approveButton} 
                    onClick={handleSubmit}
                  >
                    {formId ? "Update" : "Create"}
                  </button>
                  {formId && (
                    <button 
                      style={customStyles.deleteButton} 
                      onClick={() => deleteItem(formType, formId)}
                    >
                      Delete
                    </button>
                  )}
                  <button style={customStyles.cancelButton} onClick={closeManageModal}>Cancel</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;