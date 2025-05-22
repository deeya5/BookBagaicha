import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/Profile.css";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const [isAuthor, setIsAuthor] = useState(localStorage.getItem("isAuthor") === "true");
  const [books, setBooks] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMyBooks = async () => {
      const token = localStorage.getItem("authToken");
      if (isAuthor && token) {
        try {
          const response = await axios.get("http://localhost:1000/api/v1/my-books", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setBooks(response.data.books || []);
        } catch (err) {
          console.error("Error fetching books:", err);
        }
      }
    };

    fetchMyBooks();
  }, [isAuthor]);

  const handleBecomeAuthor = async () => {
    const token = localStorage.getItem("authToken");
    try {
      const response = await axios.patch("http://localhost:1000/api/v1/switch-role", {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.role === "author") {
        localStorage.setItem("isAuthor", "true");
        setIsAuthor(true);
        setShowPopup(false);
      }
    } catch (err) {
      console.error("Error switching to author:", err);
    }
  };

  return (
    <div className="profile-page">
      <h1>My Profile</h1>

      {isAuthor ? (
        <div className="my-books">
          <h2>My Uploaded Books</h2>
          {books.length > 0 ? (
            <ul className="book-list">
              {books.map((book) => (
                <li
                  key={book._id}
                  className="book-list-item"
                  onClick={() => navigate(`/book/${book._id}`, { state: { book } })}
                  style={{ cursor: "pointer", padding: "10px 0" }}
                >
                  <strong>{book.title}</strong> — <em>{book.author}</em>
                </li>
              ))}
            </ul>
          ) : (
            <p>You haven't uploaded any books yet.</p>
          )}
        </div>
      ) : (
        <div className="start-profile">
          <p>You are currently a reader.</p>
          <button onClick={() => setShowPopup(true)}>Start a Profile</button>
        </div>
      )}

      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-box">
            <p>Do you want to become an author and start uploading books?</p>
            <button onClick={handleBecomeAuthor}>Yes, Make Me an Author</button>
            <button onClick={() => setShowPopup(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
