import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/bookDetail.css";
import axios from "axios";

const BookDetail = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const book = state?.book;

  const [genreName, setGenreName] = useState(null);
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("authToken");
  const isLoggedIn = !!token;

  useEffect(() => {
    const fetchFeaturedBooks = async () => {
      try {
        const response = await axios.get("http://localhost:1000/api/v1/get-recent-books", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const filtered = response.data.data.filter(
          (featured) => featured._id !== book?._id
        );

        setFeaturedBooks(filtered.slice(0, 3));
      } catch (error) {
        console.error("Error fetching featured books:", error);
        setError("Failed to load featured books.");
      }
    };

    if (book) {
      fetchFeaturedBooks();
    }
  }, [book, token]);

  if (!book) {
    return <p>Book details not found.</p>;
  }

  const handleReadClick = async (e) => {
    if (!isLoggedIn) {
      e.preventDefault();
      navigate("/login");
      return;
    }

    const bookId = book._id || book.id;

    if (!bookId) {
      alert("Invalid book ID.");
      return;
    }

    try {
      await axios.post(
        "http://localhost:1000/api/v1/library/add",
        {
          bookId,
          currentlyReading: true,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // Optional: navigate or show success
    } catch (err) {
      console.error("Error starting reading:", err);
      alert("Failed to start reading this book.");
    }
  };

  const handleAddToLibrary = async () => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    const bookId = book._id || book.id;

    if (!bookId) {
      alert("Invalid book ID.");
      return;
    }

    try {
      console.log("Sending to /library/add:", {
        bookId,
        currentlyReading: false,
      });

      const response = await axios.post(
        "http://localhost:1000/api/v1/library/add",
        {
          bookId,
          currentlyReading: false,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(response.data.message);
      navigate("/library");
    } catch (err) {
      console.error("Error adding book to library:", err);
      alert("Failed to add book to library");
    }
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
            <p><span>Genre:</span> {book.genre?.name || genreName || "Unknown"}</p>
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

      {/* Featured Books Section */}
      <section className="featured-books">
        {error && <p className="error-message">{error}</p>}
        <div className="book-row">
          {featuredBooks.length > 0 ? (
            featuredBooks.map((book, index) => (
              <div
                key={book._id || index}
                className="book-card"
                onClick={() => navigate(`/book/${book.id || book._id}`, { state: { book } })}
              >
                <img
                  className="book-image"
                  src={book.coverImage || "https://via.placeholder.com/150"}
                  alt={book.title}
                />
                <h3>{book.title}</h3>
                <p>by {book.author}</p>
              </div>
            ))
          ) : (
            <p>Loading featured books...</p>
          )}
        </div>
      </section>

      {/* Explore More Button */}
      <button className="show-more" onClick={() => navigate("/explore")}>
        Explore More
      </button>
    </div>
  );
};

export default BookDetail;
