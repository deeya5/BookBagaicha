import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/bookDetail.css";

const BookDetail = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const book = state?.book;

  // Check if the user is logged in
  const isLoggedIn = !!localStorage.getItem("token"); // Change this as per your auth logic

  if (!book) {
    return <p>Book details not found.</p>;
  }

  const handleReadClick = (e) => {
    if (!isLoggedIn) {
      e.preventDefault();
      navigate("/login");
    }
  };

  const handleAddToLibrary = () => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    // Add book to library logic goes here
    console.log("Book added to library!");
  };

  return (
    <div>
      <div className="book-detail-container">
        <img
          className="book-image"
          src={book.coverImage || "https://via.placeholder.com/150"}
          alt={book.title}
        />

        <div className="book-info">
          <h1 className="book-title">{book.title}</h1>
          <h3 className="book-author">by {book.author}</h3>
          <p>{book.description}</p>

          <div className="book-meta">
            <p><span>Genre:</span> {book.genre || "Unknown"}</p>
            <p><span>Uploaded on:</span> {book.uploadDate || "N/A"}</p>
            <p><span>Chapters:</span> {book.chapters || "N/A"}</p>
          </div>

          <div className="button-container">
            <a
              href={book.url}
              target="_blank"
              rel="noopener noreferrer"
              className="button read-button"
              onClick={handleReadClick}
            >
              Read
            </a>
            <button className="button add-to-library" onClick={handleAddToLibrary}>
              Add To Library
            </button>
          </div>
        </div>
      </div>

      {/* See More Button */}
      <button className="show-more" onClick={() => navigate("/explore")}>
        Explore More
      </button>
    </div>
  );
};

export default BookDetail;
