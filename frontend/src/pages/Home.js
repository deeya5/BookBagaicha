import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Home.css";
import BookCard from "../components/BookCard";
import romanceImage from "../assets/romance.jpg";
import fantasyImage from "../assets/fantasy.jpg";
import fictionImage from "../assets/romance.jpg";
import book1Image from "../assets/book.jpg";
import book2Image from "../assets/book.jpg";
import book3Image from "../assets/book.jpg";

const Home = () => {
  const navigate = useNavigate();
  const genres = [
    { name: "Fantasy", image: fantasyImage },
    { name: "Fiction", image: fictionImage },
    { name: "Romance", image: romanceImage },
  ];

  const [featuredBooks, setFeaturedBooks] = useState([]);

  useEffect(() => {
    const fetchFeaturedBooks = () => {
      const data = [
        { id: 1, title: "Book 1", author: "Author 1", coverImage: book1Image },
        { id: 2, title: "Book 2", author: "Author 2", coverImage: book2Image },
        { id: 3, title: "Book 3", author: "Author 3", coverImage: book3Image },
      ];
      setFeaturedBooks(data);
    };

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
          {genres.map((genre, index) => (
            <div key={index} className="genre-card">
              <img src={genre.image} alt={genre.name} />
              <h3>{genre.name}</h3>
            </div>
          ))}
        </div>
        <button className="show-more-button">Show More</button>
      </section>

      {/* Featured Books Section */}
      <section className="featured-books">
        <h2>Featured Books</h2>
        <div className="book-row">
          {featuredBooks.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
