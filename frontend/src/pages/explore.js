import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation
import axios from "axios";
import "../styles/explore.css";

const Explore = () => {
  const [books, setBooks] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate(); // Hook for navigation

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "http://localhost:1000/api/v1/get-books-from-gutendex",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const categorizedBooks = response.data.data.reduce((acc, book) => {
          const genre = book.genre || "Miscellaneous";
          if (!acc[genre]) acc[genre] = [];
          acc[genre].push(book);
          return acc;
        }, {});

        setBooks(categorizedBooks);
      } catch (error) {
        console.error("Error fetching books:", error);
        setError("Failed to load books. Please try again later.");
      }
    };

    fetchBooks();
  }, []);

  return (
    <div className="explore-container">
      <h1>Explore Books</h1>
      {error && <p className="error-message">{error}</p>}

      {Object.keys(books).length > 0 ? (
        Object.entries(books).map(([genre, genreBooks]) => (
          <div key={genre} className="genre-section">
            <h2>{genre}</h2>
            <div className="books-grid">
              {genreBooks.map((book, index) => (
                <div
                  key={book.title || index}
                  className="book-card"
                  onClick={() => navigate(`/book/${book.id}`, { state: { book } })} // Navigate to book details
                >
                  <img
                    src={book.coverImage || "https://via.placeholder.com/150"}
                    alt={book.title}
                    className="book-cover"
                    onError={(e) => (e.target.src = "https://via.placeholder.com/150")}
                  />
                  <h3>{book.title}</h3>
                  <p>by {book.author}</p>
                </div>
              ))}
            </div>
          </div>
        ))
      ) : (
        <p>Loading books...</p>
      )}
    </div>
  );
};

export default Explore;
