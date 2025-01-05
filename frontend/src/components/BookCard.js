import React from "react";
import "../styles/BookCard.css";

const BookCard = ({ book }) => {
  return (
    <div className="book-card">
      <img src={book.coverImage} alt={book.title} />
      <h3>{book.title}</h3>
      <p>By {book.author}</p>
    </div>
  );
};

export default BookCard;
