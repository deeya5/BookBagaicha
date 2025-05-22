import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Admin.css";
import logo from "../assets/logo.png";
import userIcon from "../assets/adminprofile.jpg";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
  const [pendingBooks, setPendingBooks] = useState([]);
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

  // Define permissions based on the role
  const getPermissions = (userRole) => {
    switch (userRole) {
      case "super_admin":
        return ["dashboard", "users", "authors", "books", "genres", "reviews", "admins", "booksToApprove"];
      case "admin_user":
        return ["dashboard", "users", "authors"];
      case "admin_book":
        return ["dashboard", "books", "genres", "reviews", "booksToApprove"];
      default:
        return ["dashboard"];
    }
  };

  const userPermissions = getPermissions(role);

  // Check if user has permission for a specific action
  const hasPermission = (permission) => {
    return userPermissions.includes(permission);
  };

  useEffect(() => {
    const token = localStorage.getItem("authToken"); 
    
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
  
        // Only fetch data that the user has permission to see
        const requests = [];
        
        if (hasPermission("users")) {
          requests.push(
            axios.get("http://localhost:1000/api/v1/get-total-users", {
              headers: { Authorization: `Bearer ${token}` },
            })
          );
        }

        if (hasPermission("books")) {
          requests.push(
            axios.get("http://localhost:1000/api/v1/get-all-books", {
              headers: { Authorization: `Bearer ${token}` },
            })
          );
        }

        if (hasPermission("genres")) {
          requests.push(
            axios.get("http://localhost:1000/api/v1/get-total-genres", {
              headers: { Authorization: `Bearer ${token}` },
            })
          );
        }

        // Activity log for all admin roles
        requests.push(
          axios.get("http://localhost:1000/api/v1/activity-log", {
            headers: { Authorization: `Bearer ${token}` },
          })
        );

        const results = await Promise.all(requests);
        let resultIndex = 0;

        if (hasPermission("users")) {
          setTotalUsers(results[resultIndex]?.data.totalUsers || 0);
          resultIndex++;
        }

        if (hasPermission("books")) {
          setBooks(results[resultIndex]?.data.data || []);
          setTotalBooks((results[resultIndex]?.data.data || []).length);
          resultIndex++;
        }

        if (hasPermission("genres")) {
          setTotalGenres(results[resultIndex]?.data.totalGenres || 0);
          resultIndex++;
        }

        // Activity log is always the last request
        setActivityLog(Array.isArray(results[results.length - 1]?.data) ? results[results.length - 1].data : []);
        
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data.");
      }
    };
  
    fetchDashboardData();
  }, [navigate, token, role]);

  const handleViewChange = (view, fetchFn) => {
    if (!hasPermission(view)) {
      setError(`Access Denied: You do not have permission to access ${view}.`);
      toast.warn(`You do not have permission to access ${view}.`);
      return;
    }
  
    setCurrentView(view);
    setError(""); // Clear any previous errors
    if (fetchFn) fetchFn();
  };

  const fetchUsersByRole = async (targetRole) => {
    // Fixed permission check - check the actual permission needed, not the target role
    const permission = targetRole === "user" ? "users" : "authors";
    
    if (!hasPermission(permission)) {
      toast.error(`You don't have permission to view ${targetRole}s`);
      return;
    }

    try {
      const res = await axios.get(`http://localhost:1000/api/v1/users/role/${targetRole}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      targetRole === "user" ? setUsers(res.data) : setAuthors(res.data);
    } catch (err) {
      console.error(`Error fetching ${targetRole}s:`, err);
      toast.error(`Failed to fetch ${targetRole}s`);
    }
  };

  const fetchAllAdmins = async () => {
    if (!hasPermission("admins")) {
      toast.error("You don't have permission to view admins");
      return;
    }

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
      toast.error("Failed to fetch admins");
    }
  };
  
  const fetchBooks = async () => {
    if (!hasPermission("books")) {
      toast.error("You don't have permission to view books");
      return;
    }

    try {
      const res = await axios.get("http://localhost:1000/api/v1/get-all-books", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBooks(res.data.data || []);
    } catch (err) {
      console.error("Error fetching books:", err);
      toast.error("Failed to fetch books");
    }
  };

  const fetchGenres = async () => {
    if (!hasPermission("genres")) {
      toast.error("You don't have permission to view genres");
      return;
    }

    try {
      const res = await axios.get("http://localhost:1000/api/v1/get-all-genres", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGenres(res.data.genres || []);
    } catch (err) {
      console.error("Error fetching genres:", err);
      toast.error("Failed to fetch genres");
    }
  };

  const fetchReviews = async () => {
    if (!hasPermission("reviews")) {
      toast.error("You don't have permission to view reviews");
      return;
    }

    try {
      const res = await axios.get("http://localhost:1000/api/v1/reviews/get-all-reviews", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReviews(res.data.reviews || []);
    } catch (err) {
      console.error("Error fetching reviews:", err);
      toast.error("Failed to fetch reviews");
    }
  };

  const fetchBooksToApprove = async () => {
    if (!hasPermission("booksToApprove")) {
      toast.error("You don't have permission to view books pending approval");
      return;
    }

    try {
      const res = await axios.get("http://localhost:1000/api/v1/uploaded-books?pending=true", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setPendingBooks(res.data.books || []);
    } catch (err) {
      console.error("Error fetching Book Bagaicha Original books pending approval:", err);
      toast.error("Failed to load original books pending approval");
    }
  };

  const deleteItem = async (type, id) => {
    // Check permissions before deleting
    const permissionMap = {
      "user": "users",
      "author": "authors", 
      "book": "books",
      "genre": "genres",
      "review": "reviews"
    };

    if (!hasPermission(permissionMap[type])) {
      toast.error(`You don't have permission to delete ${type}s`);
      return;
    }

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
      case "user": 
        if (hasPermission("users")) fetchUsersByRole("user"); 
        break;
      case "author": 
        if (hasPermission("authors")) fetchUsersByRole("author"); 
        break;
      case "book": 
        if (currentView === "booksToApprove" && hasPermission("booksToApprove")) {
          fetchBooksToApprove(); 
        } else if (hasPermission("books")) {
          fetchBooks();
        }
        break;
      case "genre": 
        if (hasPermission("genres")) fetchGenres(); 
        break;
      case "review": 
        if (hasPermission("reviews")) fetchReviews(); 
        break;
      default: break;
    }
  };

  const handleSubmit = async () => {
    // Check permissions before creating/updating
    const permissionMap = {
      "user": "users",
      "author": "authors",
      "book": "books", 
      "genre": "genres",
      "review": "reviews"
    };

    if (!hasPermission(permissionMap[formType])) {
      toast.error(`You don't have permission to ${formId ? 'update' : 'create'} ${formType}s`);
      return;
    }

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

  const approveBook = async (bookId) => {
    if (!hasPermission("booksToApprove")) {
      toast.error("You don't have permission to approve books");
      return;
    }

    try {
      await axios.put(`http://localhost:1000/api/v1/approve-book/${bookId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Book approved successfully!");
      fetchBooksToApprove();
      
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
    if (!hasPermission("booksToApprove")) {
      toast.error("You don't have permission to delete pending books");
      return;
    }

    try {
      const url = `http://localhost:1000/api/v1/books/${bookId}`;
      await axios.delete(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Book deleted successfully!");
      fetchBooksToApprove();
      
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
    // Check permissions before opening modal
    const permissionMap = {
      "user": "users",
      "author": "authors",
      "book": "books",
      "genre": "genres", 
      "review": "reviews"
    };

    if (!hasPermission(permissionMap[type])) {
      toast.error(`You don't have permission to manage ${type}s`);
      return;
    }

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
        genre: item.genre,
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
  
  const openApprovalModal = (book) => {
    if (!hasPermission("booksToApprove")) {
      toast.error("You don't have permission to manage book approvals");
      return;
    }

    setForm({
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
          <button onClick={() => handleViewChange("booksToApprove", fetchBooksToApprove)}>BooksBagaicha Originals</button>
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
            <h2>Book Bagaicha Originals </h2>
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
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">
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
                  <div className="book-desc">{form.desc}</div>
                  
                  <div className="modal-actions">
                    <button 
                      className="delete-button" 
                      onClick={() => {
                        deleteBookToApprove(formId);
                        closeManageModal();
                      }}
                    >
                      Delete
                    </button>
                    <button className="cancel-button" onClick={closeManageModal}>Cancel</button>
                  </div>
                </div>
              </>
            ) : (
              <>
                {Object.keys(form).map((key) => (
                  <div key={key} className="form-group">
                    <label className="form-label">{key}</label>
                    <input
                      className="form-input"
                      value={form[key] || ""}
                      onChange={(e) =>
                        setForm({ ...form, [key]: e.target.value })
                      }
                    />
                  </div>
                ))}
                <div className="modal-actions">
                  <button 
                    className="approve-button" 
                    onClick={handleSubmit}
                  >
                    {formId ? "Update" : "Create"}
                  </button>
                  {formId && (
                    <button 
                      className="delete-button" 
                      onClick={() => deleteItem(formType, formId)}
                    >
                      Delete
                    </button>
                  )}
                  <button className="cancel-button" onClick={closeManageModal}>Cancel</button>
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