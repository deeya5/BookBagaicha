import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import "../styles/Home.css";


const Home = () => {
  const navigate = useNavigate();
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [error, setError] = useState("");
  const [originalBooks, setOriginalBooks] = useState([]);

  const fetchOriginalBooks = async () => {
          try {
            const res = await axiosInstance.get("http://localhost:1000/api/v1/uploaded-books");
            setOriginalBooks(res.data.books);
          } catch (err) {
            console.error("Error fetching original books", err);
          }
        };


  useEffect(() => {
    const fetchFeaturedBooks = async () => {
      try {
        const response = await axiosInstance.get("/get-recent-books");
        setFeaturedBooks(response.data.data);
      } catch (error) {
        console.error("Error fetching featured books:", error);
        setError("Failed to load featured books.");
      }
    };
  
  
    fetchFeaturedBooks();
    fetchOriginalBooks();
  }, []);
  

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Discover the New Releases</h1>
          <p>
            BookBagaicha presents new releases for you to explore and enjoy.
            Dive into the books of your choice.
          </p>
          <button className="explore-button" onClick={() => navigate("/explore")}>
            Explore
          </button>
        </div>
      </section>

      <section className="original-books">
  <h2>Book Bagaicha Originals</h2>
  <div className="book-row">
    {originalBooks.length > 0 ? (
      originalBooks.map((book) => (
        <div
          key={book._id}
          className="book-card"
          onClick={() => navigate(`/book/${book._id}`, { state: { book } })}
        >
          <img
            src={
              book.coverImage.startsWith("http")
                ? book.coverImage
                : `http://localhost:1000${book.coverImage}`
            }
            alt={book.title}
            className="book-cover"
          />
          <h3>{book.title}</h3>
          <p>by {book.author}</p>
        </div>
      ))
    ) : (
      <p>No original books uploaded yet.</p>
    )}
  </div>
</section>


      {/* Featured Books Section */}
      <section className="featured-books">
        <h2>Featured Books</h2>
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
        src={book.coverImage.startsWith("http") ? book.coverImage : `http://localhost:1000${book.coverImage}`}
        alt={book.title}
        className="book-cover"
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
    </div>
  );
};

export default Home;
