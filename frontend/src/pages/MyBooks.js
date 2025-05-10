import { getAllBooks } from "../utils/offlineDB";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/MyBooks.css";

const MyBooks = () => {
  const [offlineBooks, setOfflineBooks] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadBooks = async () => {
      const books = await getAllBooks();
      setOfflineBooks(books);
    };
    loadBooks();
  }, []);

const handleReadBook = (book) => {
  // Create a Blob only if the book has raw content
  const blob = new Blob([book.content], { type: "application/pdf" });

  navigate(`/bookreader/${book._id}`, {
    state: {
      offlineBook: {
        title: book.title,
        author: book.author,
        content: blob,
      },
    },
  });
  
  console.log("Blob type while saving:", blob.type);

};


  return (
    <div className="my-books-container">
      <h1 className="title">My Books</h1>
      {offlineBooks.length === 0 ? (
        <p className="no-books">No books saved for offline reading.</p>
      ) : (
        <div className="book-grid">
          {offlineBooks.map((book) => (
            <div key={book._id} className="book-card">
              <h2 className="book-title">{book.title}</h2>
              <p className="book-author">{book.author}</p>
              <p className="book-desc">{book.desc}</p>
              <button
                className="read-button"
                onClick={() => handleReadBook(book)}
              >
                Read Offline
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBooks;
