import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import "../styles/GenreBook.css";

const GenreBooks = () => {
  const { genreId } = useParams(); // genreId from route (e.g., 'romance')
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const genreMapping = {
      horror: "Horror",
      adventure: "Adventure",
      romance: "Romance",
      drama: "Drama",
      fantasy: "Fantasy",
      psychological: "Psychological Fiction",
      comedy: "Comedy",
      biography: "Biography",
      classic: "Classic",
      mystery: "Mystery",
      gothic: "Gothic Fiction",
      science: "Science Fiction",
    };

    const extractGenre = (desc) => {
      for (let keyword in genreMapping) {
        if (desc.toLowerCase().includes(keyword)) {
          return genreMapping[keyword];
        }
      }
      return "Miscellaneous";
    };

    const readableGenreName = genreId
      .replace(/-/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());

    const fetchAndFilterBooks = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:1000/api/v1/get-books-from-gutendex", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const filtered = response.data.data.filter((book) => {
          const genre = extractGenre(book.desc || "");
          return genre.toLowerCase() === readableGenreName.toLowerCase();
        });

        setFilteredBooks(filtered);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching books:", err);
        setError("Failed to load books. Please try again later.");
        setLoading(false);
      }
    };

    fetchAndFilterBooks();
  }, [genreId]);

  return (
    <div className="genre-books-container">
      <h1 className="page-title">{genreId.replace(/-/g, " ").toUpperCase()} Books</h1>
      {error && <p className="error-message">{error}</p>}

      {loading ? (
        <div className="spinner-container">
          <div className="loading-spinner"></div>
        </div>
      ) : filteredBooks.length > 0 ? (
        <div className="books-grid">
          {filteredBooks.map((book, index) => (
            <div key={book.title || index} className="book-card">
              <img
                src={book.coverImage || "https://via.placeholder.com/150"}
                alt={book.title}
                className="book-cover"
                onError={(e) => (e.target.src = "https://via.placeholder.com/150")}
              />
              <h3 className="book-title">{book.title}</h3>
              <p className="book-author">by {book.author}</p>
              <a
                href={book.url}
                target="_blank"
                rel="noopener noreferrer"
                className="read-button"
              >
                Read Book
              </a>
            </div>
          ))}
        </div>
      ) : (
        <p className="loading-text">No books found for this genre.</p>
      )}
    </div>
  );
};

export default GenreBooks;
