import React from 'react';
import '../styles/BookCard.css';

const BookCard = ({ book }) => {
    return (
        <div className="book-card">
            <img src={book.coverImage} alt={book.title} />
            <h3>{book.title}</h3>
            <p>{book.author}</p>
            <button>Read More</button>
        </div>
    );
};

export default BookCard;
