import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/library.css";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Library = () => {
  const [currentReads, setCurrentReads] = useState([]);
  const [libraryBooks, setLibraryBooks] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBooks = async () => {
      const token = localStorage.getItem("authToken");

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

        const books = response.data;

        if (Array.isArray(books) && books.length) {
          const currentReads = books.filter((book) => book.currentlyReading);
          setCurrentReads(currentReads);
          setLibraryBooks(books.filter((book) => !book.currentlyReading));
        }
      } catch (error) {
        console.error("Error fetching library books:", error);
        if (error.response?.status === 401) {
          setError("Unauthorized access. Please log in again.");
        } else if (error.response?.status === 500) {
          setError("Internal server error. Please try again later.");
        } else {
          setError("Something went wrong. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  const handleDeleteBook = async (libraryEntryId) => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      toast.error("You need to log in first.");
      return;
    }

    try {
      const response = await axios.delete(
        `http://localhost:1000/api/v1/library/${libraryEntryId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setLibraryBooks((prev) => prev.filter((book) => book._id !== libraryEntryId));
      setCurrentReads((prev) => prev.filter((book) => book._id !== libraryEntryId));
      toast.success(response.data.message);
    } catch (error) {
      console.error("Error deleting book:", error);
      toast.error("Failed to delete book.");
    }
  };

  const renderBookCard = (bookEntry) => {
    const book = bookEntry.book;

    if (!book) return null; // Prevent rendering if book is null

    return (
      <div
        key={bookEntry._id}
        className="book-item"
        onClick={() => navigate(`/book/${book._id}`, { state: { book } })}
      >
        <img
          src={
            book.coverImage?.startsWith("http")
              ? book.coverImage
              : `http://localhost:1000${book.coverImage}`
          }
          alt={book.title}
          className="book-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "/default-book.jpg"; // fallback if image is missing
          }}
        />
        <div className="book-info">
          <h3>{book.title}</h3>
          <p>by {book.author}</p>
        </div>
        <button
          className="delete-icon"
          onClick={(e) => {
            e.stopPropagation();
            console.log("Deleting entry ID:", bookEntry._id);
            handleDeleteBook(bookEntry._id);
          }}
        >
          <i className="fas fa-trash-alt"></i>
        </button>
      </div>
    );
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
            <div className="books-list">{currentReads.map(renderBookCard)}</div>
          </div>

          <hr className="divider" />

          {/* Added to Library Section */}
          <div className="section">
            <div className="section-header">Added to Library</div>
            <div className="books-list">{libraryBooks.map(renderBookCard)}</div>
          </div>
        </>
      )}

      {/* Toast container to display toasts */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </div>
  );
};

export default Library;
