import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/genre.css";

const genreImageMap = {
  Horror: require("../assets/fantasy.jpg"),
  Adventure: require("../assets/fantasy.jpg"),
  Romance: require("../assets/fantasy.jpg"),
  Drama: require("../assets/fantasy.jpg"),
  Fantasy: require("../assets/fantasy.jpg"),
  "Psychological Fiction": require("../assets/fantasy.jpg"),
  Comedy: require("../assets/fantasy.jpg"),
  Biography: require("../assets/fantasy.jpg"),
  Classic: require("../assets/fantasy.jpg"),
  Mystery: require("../assets/fantasy.jpg"),
  "Gothic Fiction": require("../assets/fantasy.jpg"),
  "Science Fiction": require("../assets/fantasy.jpg"),
  Miscellaneous: require("../assets/fantasy.jpg"),
};



const Genre = () => {
  const [genres, setGenres] = useState([]);
  const [error, setError] = useState("");
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
      }
    };

    fetchBooks();
  }, []);

  const handleGenreClick = (genre) => {
    const slug = genre.toLowerCase().replace(/\s/g, "-");
    navigate(`/genre/${slug}`);
  };

  return (
    <div className="genre-grid-container">
  <h2 className="genre-grid-title">Browse The Genre</h2>
  <p className="genre-subtitle">Dive into what you're into.</p>

  <div className="genre-grid">
    {genres.map((genre) => (
      <div key={genre} className="genre-image-button" onClick={() => handleGenreClick(genre)}>
        <img src={genreImageMap[genre]} alt={genre} className="genre-image" />
        <div className="genre-label">{genre}</div>
      </div>
    ))}
  </div>
</div>
  );
};

export default Genre;
