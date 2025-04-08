import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import "../styles/genre.css";

const Genre = () => {
  const [booksByGenre, setBooksByGenre] = useState({});
  const [error, setError] = useState("");
  const scrollRefs = useRef({});

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

    const fetchBooks = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:1000/api/v1/get-books-from-gutendex", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const categorizedBooks = response.data.data.reduce((acc, book) => {
          const genre = extractGenre(book.desc || "");
          if (!acc[genre]) acc[genre] = [];
          acc[genre].push(book);
          return acc;
        }, {});

        setBooksByGenre(categorizedBooks);

        // Scroll to hash if exists
        const hash = window.location.hash?.substring(1); // e.g., 'romance'
        if (hash) {
          const genreSection = document.getElementById(hash);
          if (genreSection) {
            setTimeout(() => {
              genreSection.scrollIntoView({ behavior: "smooth" });
            }, 300); // Delay to ensure rendering
          }
        }
      } catch (error) {
        console.error("Error fetching books:", error);
        setError("Failed to load books. Please try again later.");
      }
    };

    fetchBooks();
  }, []);

  const handleScroll = (genre, direction) => {
    if (scrollRefs.current[genre]) {
      const scrollAmount = 300;
      scrollRefs.current[genre].scrollLeft += direction * scrollAmount;
    }
  };

  return (
    <div className="genre-container">
      <h1 className="page-title">Books by Genre</h1>
      {error && <p className="error-message">{error}</p>}

      {Object.keys(booksByGenre).length > 0 ? (
        Object.entries(booksByGenre).map(([genre, books]) => (
          <div key={genre} className="genre-section" id={genre.toLowerCase()}>
            <h2 className="genre-title">{genre}</h2>
            <div className="books-scroll-container">
              <button className="scroll-button scroll-left" onClick={() => handleScroll(genre, -1)}>&lt;</button>
              <div className="books-grid" ref={(el) => (scrollRefs.current[genre] = el)}>
                {books.map((book, index) => (
                  <div key={book.title || index} className="book-card">
                    <img
                      src={book.coverImage || "https://via.placeholder.com/150"}
                      alt={book.title}
                      className="book-cover"
                      onError={(e) => (e.target.src = "https://via.placeholder.com/150")}
                    />
                    <h3 className="book-title">{book.title}</h3>
                    <p className="book-author">by {book.author}</p>
                    <a href={book.url} target="_blank" rel="noopener noreferrer" className="read-button">
                      Read Book
                    </a>
                  </div>
                ))}
              </div>
              <button className="scroll-button scroll-right" onClick={() => handleScroll(genre, 1)}>&gt;</button>
            </div>
          </div>
        ))
      ) : (
        <p className="loading-text">Loading books...</p>
      )}
    </div>
  );
};

export default Genre;
