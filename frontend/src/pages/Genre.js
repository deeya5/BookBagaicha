import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/genre.css";

const genreImageMap = {
  Horror: require("../assets/genrecover.jpg"),
  Adventure: require("../assets/genrecover.jpg"),
  Romance: require("../assets/genrecover.jpg"),
  Drama: require("../assets/genrecover.jpg"),
  Fantasy: require("../assets/genrecover.jpg"),
  "Psychological Fiction": require("../assets/genrecover.jpg"),
  Comedy: require("../assets/genrecover.jpg"),
  Biography: require("../assets/genrecover.jpg"),
  Classic: require("../assets/genrecover.jpg"),
  Mystery: require("../assets/genrecover.jpg"),
  "Gothic Fiction": require("../assets/genrecover.jpg"),
  "Science Fiction": require("../assets/genrecover.jpg"),
  Miscellaneous: require("../assets/genrecover.jpg"),
};

// Genre-specific icons mapping
const genreIconMap = {
  Horror: "fa-ghost",
  Adventure: "fa-compass",
  Romance: "fa-heart",
  Drama: "fa-theater-masks",
  Fantasy: "fa-hat-wizard",
  "Psychological Fiction": "fa-brain",
  Comedy: "fa-laugh",
  Biography: "fa-user-tie",
  Classic: "fa-bookmark",
  Mystery: "fa-search",
  "Gothic Fiction": "fa-church",
  "Science Fiction": "fa-rocket",
  Miscellaneous: "fa-book-open",
};

const Genre = () => {
  const [genres, setGenres] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:1000/api/v1/get-books-from-gutendex", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const genreSet = new Set();

        response.data.data.forEach((book) => {
          const genre = extractGenre(book.desc || "");
          genreSet.add(genre);
        });

        setGenres(Array.from(genreSet));
      } catch (error) {
        console.error("Error fetching books:", error);
        setError("Failed to load genres. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  const handleGenreClick = (genre) => {
    const slug = genre.toLowerCase().replace(/\s/g, "-");
    navigate(`/genre/${slug}`);
  };

  return (
    <div className="genre-page">
      <div className="genre-header">
        <h1 className="genre-title">Explore Genres</h1>
        <p className="genre-description">
          Discover new worlds and adventures through our curated collection of genres.
        </p>
        <div className="genre-divider">
          <span className="divider-icon"><i className="fas fa-book"></i></span>
        </div>
      </div>

      {loading ? (
        <div className="genre-loading">
          <div className="loading-spinner"></div>
          <p>Loading genres...</p>
        </div>
      ) : error ? (
        <div className="genre-error">
          <i className="fas fa-exclamation-circle"></i>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="retry-button">
            Try Again
          </button>
        </div>
      ) : (
        <div className="genre-grid-container">
          <div className="genre-grid">
            {genres.map((genre) => (
              <div 
                key={genre} 
                className="genre-card" 
                onClick={() => handleGenreClick(genre)}
                data-genre={genre.toLowerCase().replace(/\s/g, "-")}
              >
                <div className="genre-card-image">
                  <img src={genreImageMap[genre]} alt={genre} />
                  <div className="genre-icon">
                    <i className={`fas ${genreIconMap[genre] || "fa-book"}`}></i>
                  </div>
                </div>
                <div className="genre-card-content">
                  <h3 className="genre-name">{genre}</h3>
                  <div className="genre-card-overlay">
                    <span className="explore-text">Explore <i className="fas fa-arrow-right"></i></span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="genre-footer">
        <p>Can't find what you're looking for? <a href="/explore">Explore all books</a></p>
      </div>
    </div>
  );
};

export default Genre;