import React, { useEffect, useState } from 'react';
import axios from 'axios';
import BookCard from '../components/BookCard';
import '../styles/Home.css';

const Home = () => {
    const [books, setBooks] = useState([]);

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const response = await axios.get('/api/books');
                setBooks(response.data);
            } catch (error) {
                console.error('Error fetching books:', error);
            }
        };

        fetchBooks();
    }, []);

    return (
        <div className="home">
            <section className="hero">
                <h1>Welcome to Book Bagaicha</h1>
                <p>Your favorite digital library at your fingertips.</p>
            </section>
            <section className="featured-books">
                <h2>Featured Books</h2>
                <div className="book-grid">
                    {books.map(book => (
                        <BookCard key={book._id} book={book} />
                    ))}
                </div>
            </section>
        </div>
    );
};

export default Home;
