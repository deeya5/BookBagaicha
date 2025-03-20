import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/library.css"; // Add styling for library page

const Library = () => {
  const [books, setBooks] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLibraryBooks = async () => {
      try {
        const response = await axios.get("https://localhost:3000/api/v1/get-recent-books");
        setBooks(response.data);
      } catch (error) {
        console.error("Error fetching library books:", error);
        setError("Failed to load your library.");
      } finally {
        setLoading(false);
      }
    };

    fetchLibraryBooks();
  }, []);

  return (
    <div className="library-container">
      <h1>Your Library</h1>
      {error && <p className="error-message">{error}</p>}
      {loading ? (
        <p>Loading your books...</p>
      ) : books.length > 0 ? (
        <div className="books-grid">
          {books.map((book) => (
            <div key={book.id} className="book-card">
              <img src={book.coverImage} alt={book.title} className="book-cover" />
              <h3>{book.title}</h3>
              <p>by {book.author}</p>
              <button className="read-button">Read Now</button>
            </div>
          ))}
        </div>
      ) : (
        <p>Your library is empty. Start adding books!</p>
      )}
    </div>
  );
};

export default Library;
