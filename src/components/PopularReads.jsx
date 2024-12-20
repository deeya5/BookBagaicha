import React from 'react';
import './PopularReads.css';

const PopularReads = () => {
  return (
    <section className="popular-reads">
      <h3>Popular Reads</h3>
      <div className="books">
        <div className="book-card">
          <img src="/src/assets/book-image.png" alt="Book" />
        </div>
        <div className="book-card">
          <img src="/src/assets/book-image.png" alt="Book" />
        </div>
        <div className="book-card">
          <img src="/src/assets/book-image.png" alt="Book" />
        </div>
      </div>
    </section>
  );
};

export default PopularReads;
