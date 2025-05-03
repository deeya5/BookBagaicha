import { getAllBooks } from "../utils/offlineDB";
import { useEffect, useState } from "react";

const MyBooks = () => {
  const [offlineBooks, setOfflineBooks] = useState([]);

  useEffect(() => {
    const loadBooks = async () => {
      const books = await getAllBooks();
      setOfflineBooks(books);
    };
    loadBooks();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">My Books</h1>
      {offlineBooks.length === 0 ? (
        <p className="text-gray-600">No books saved for offline reading.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {offlineBooks.map((book) => (
            <div key={book.id} className="bg-white p-4 rounded-xl shadow">
              <h2 className="text-xl font-semibold mb-2">{book.title}</h2>
              <p className="text-gray-700 mb-2">{book.author}</p>
              <p className="text-sm text-gray-500 line-clamp-3">{book.description}</p>
              <button
                className="mt-3 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                onClick={() => alert(book.content.slice(0, 1000))} // preview
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
