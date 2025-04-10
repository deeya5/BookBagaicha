import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/library.css";
import { useNavigate } from "react-router-dom"; // Importing useNavigate for navigation
import BookCard from "../components/BookCard";

const Library = () => {
  const [currentReads, setCurrentReads] = useState([]);
  const [libraryBooks, setLibraryBooks] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // Hook for navigation

  useEffect(() => {
    const fetchBooks = async () => {
      const token = localStorage.getItem("authToken"); // 🔥 Fix applied here
      console.log("Token:", token);

      if (!token) {
        setError("You need to log in first.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get("http://localhost:1000/api/v1/library", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("API Response:", response.data);

        const books = response.data;

        if (Array.isArray(books) && books.length) {
          setCurrentReads(books.filter((book) => book.currentlyReading));
          setLibraryBooks(books);
        } else {
          setError("No books found in your library.");
        }
      } catch (error) {
        console.error("Error fetching library books:", error);
        if (error.response) {
          if (error.response.status === 401) {
            setError("Unauthorized access. Please log in again.");
          } else if (error.response.status === 500) {
            setError("Internal server error. Please try again later.");
          } else {
            setError("Something went wrong. Please try again.");
          }
        } else {
          setError("Failed to load your library.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  // Delete a book from the library
  const handleDeleteBook = async (bookId) => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      setError("You need to log in first.");
      return;
    }

    try {
      const response = await axios.delete(
        `http://localhost:1000/api/v1/library/${bookId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setLibraryBooks(libraryBooks.filter((book) => book._id !== bookId));
      alert(response.data.message);
    } catch (error) {
      console.error("Error deleting book:", error);
      alert("Failed to delete book.");
    }
  };

  return (
    <div className="library-container">
      {error && <p className="error-message">{error}</p>}
      {loading ? (
        <p>Loading your books...</p>
      ) : (
        <>
          {/* Current Reads Section */}
          <div className="section">
            <div className="section-header">Current Reads</div>
            <div className="books-list">
              {currentReads.map((book) => (
                <div
                  key={book._id}
                  className="book-item"
                  onClick={() => navigate(`/book/${book._id}`, { state: { book } })}
                >
                  <img
                    className="book-cover"
                    src={book.coverImage || "https://via.placeholder.com/150"}
                    alt={book.title}
                  />
                  <div className="book-info">
                    <h3>{book.title}</h3>
                    <p>by {book.author}</p>
                  </div>
                  <button
                  className="delete-icon"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent triggering book card navigation
                    handleDeleteBook(book._id);
                  }}
                >
                  <i className="fas fa-trash-alt"></i> {/* Font Awesome trash icon */}
                </button>
                </div>
              ))}
            </div>
          </div>

          <hr className="divider" />

          {/* Added to Library Section */}
          <div className="section">
            <div className="section-header">Added to Library</div>
            <div className="books-list">
              {libraryBooks.map((book) => (
                <div
                  key={book._id}
                  className="book-item"
                  onClick={() => navigate(`/book/${book._id}`, { state: { book } })}
                >
                  <img
                    className="book-cover"
                    src={book.coverImage || "https://placekitten.com/150/150"}
                    alt={book.title}
                  />
                  <div className="book-info">
                    <h3>{book.title}</h3>
                    <p>by {book.author}</p>
                  </div>
                  <button
                  className="delete-icon"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent triggering book card navigation
                    handleDeleteBook(book._id);
                  }}
                >
                  <i className="fas fa-trash-alt"></i> {/* Font Awesome trash icon */}
                </button>

                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Library;
