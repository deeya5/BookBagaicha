import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import "../styles/Home.css";
import romanceImage from "../assets/romance.jpg";
import fantasyImage from "../assets/fantasy.jpg";
import fictionImage from "../assets/romance.jpg";
import adventureImage from "../assets/fantasy.jpg";

const genreImages = {
  Fantasy: fantasyImage,
  Fiction: fictionImage,
  Romance: romanceImage,
  Adventure: adventureImage,
};

const Home = () => {
  const navigate = useNavigate();
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [genres, setGenres] = useState([]);
  const [error, setError] = useState("");
  const [isLoadingGenres, setIsLoadingGenres] = useState(true);

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
  
    const storedTopGenres = JSON.parse(localStorage.getItem("topGenres")) || [];
    const genreObjects = storedTopGenres.map((name) => ({ name }));
    setGenres(genreObjects);
    setIsLoadingGenres(false);
  
    fetchFeaturedBooks();
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

      {/* Genre Section */}
      <section className="genres">
        <h2>Browse The Genre</h2>
        <p>Dive into what you're into.</p>
        <div className="genre-grid">
          {isLoadingGenres ? (
            <div className="spinner"></div>
          ) : genres.length > 0 ? (
            genres.map((genre) => (
              <div
                key={genre.name}
                className="genre-card"
                onClick={() => navigate(`/genre#${genre.name.toLowerCase()}`)}
              >
                <img src={genreImages[genre.name] || romanceImage} alt={genre.name} />
                <h3>{genre.name}</h3>
              </div>
            ))
          ) : (
            <p>No genres available.</p>
          )}
        </div>
        <button className="show-more-button">Show More</button>
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
    </div>
  );
};

export default Home;
