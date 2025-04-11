import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import "../styles/SearchResults.css";



const SearchResults = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const fetchBooks = async () => {
      const queryParams = new URLSearchParams(location.search);
      const query = queryParams.get("query");

      if (query) {
        try {
          const response = await axios.get(`http://localhost:1000/api/v1/search-books?title=${query}`);
          if (response.data.status === "Success") {
            setBooks(response.data.data);
          } else {
            setBooks([]);
          }
        } catch (error) {
          setError("Failed to fetch books.");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchBooks();
  }, [location.search]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <h2>Search Results</h2>
      {books.length === 0 ? (
        <p>No books found for your search.</p>
      ) : (
        <ul>
          {books.map((book) => (
            <li key={book._id}>
              <a href={`/book/${book._id}`}>{book.title}</a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchResults;
