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
      console.log("📚 Loaded books from IndexedDB:", books);
      setOfflineBooks(books);
    };
    loadBooks();
  }, []);

  const handleReadBook = (book) => {
    let blob;

    console.log("📦 Book format:", book.format);
    console.log("📦 typeof content:", typeof book.content);
    console.log("📦 instanceof ArrayBuffer:", book.content instanceof ArrayBuffer);

    if (book.format === "pdf") {
      let byteArray;

      if (book.content instanceof ArrayBuffer) {
        byteArray = new Uint8Array(book.content);
      } else if (book.content?.buffer) {
        byteArray = new Uint8Array(book.content.buffer);
      } else {
        // Fallback: convert object with numeric keys to Uint8Array
        try {
          byteArray = new Uint8Array(Object.values(book.content));
        } catch (e) {
          console.error("❌ Failed to reconstruct Uint8Array from book content:", e);
          alert("Failed to load book. Invalid content.");
          return;
        }
      }

      blob = new Blob([byteArray], { type: "application/pdf" });
    } else {
      // .txt file content stored as string
      blob = new Blob([book.content], { type: "text/plain" });
    }

    console.log("📄 Blob created:", blob);
    navigate(`/read/offline/${book._id}`, {
      state: {
        offlineBook: {
          title: book.title,
          author: book.author,
          content: blob,
        },
      },
    });
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
              <p className="book-desc">{book.desc || "No description available."}</p>
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
