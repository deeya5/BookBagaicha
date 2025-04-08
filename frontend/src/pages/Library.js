import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/library.css";
import { FaTrash } from "react-icons/fa";

const Library = () => {
  const [currentReads, setCurrentReads] = useState([]);
  const [libraryBooks, setLibraryBooks] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await axios.get("https://localhost:3000/api/v1/get-recent-books");
        const books = response.data;
        setCurrentReads(books.filter(book => book.currentlyReading));
        setLibraryBooks(books);
      } catch (error) {
        console.error("Error fetching library books:", error);
        setError("Failed to load your library.");
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

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
                <div key={book.id} className="book-item">
                  <img src={book.coverImage} alt={book.title} className="book-cover" />
                  <div className="book-info">
                    <p className="book-title">{book.title}</p>
                    <FaTrash className="delete-icon" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <hr className="divider" />
          
          {/* Added to Library Section */}
          <div className="section">
            <div className="section-header">Added to library</div>
            <div className="books-list">
              {libraryBooks.map((book) => (
                <div key={book.id} className="book-item">
                  <img src={book.coverImage} alt={book.title} className="book-cover" />
                  <div className="book-info">
                    <p className="book-title">{book.title}</p>
                    <FaTrash className="delete-icon" />
                  </div>
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
