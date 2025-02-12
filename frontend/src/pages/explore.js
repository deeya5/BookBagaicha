import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/explore.css";

const Explore = () => {
  const [books, setBooks] = useState({}); // State to store books categorized by genre
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:5000/api/books");
        const categorizedBooks = response.data.reduce((acc, book) => {
          const { genre } = book;
          if (!acc[genre]) {
            acc[genre] = [];
          }
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
              {genreBooks.map((book) => (
                <div key={book.id} className="book-card">
                  <img src={book.coverImage} alt={book.title} className="book-cover" />
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
