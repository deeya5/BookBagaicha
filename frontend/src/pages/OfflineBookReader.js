import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import "../styles/bookReader.css";

const OfflineBookReader = () => {
  const location = useLocation();
  const [book, setBook] = useState(null);
  const [blobUrl, setBlobUrl] = useState(null);
  const [content, setContent] = useState("");

  useEffect(() => {
    const offlineBook = location.state?.offlineBook;

    if (offlineBook) {
      setBook(offlineBook);

      try {
        let blob;

        if (offlineBook.content instanceof Blob) {
          blob = offlineBook.content;
        } else if (offlineBook.content?.data && offlineBook.content?.type === "application/pdf") {
          const byteArray = new Uint8Array(offlineBook.content.data);
          blob = new Blob([byteArray], { type: "application/pdf" });
        }

        if (blob) {
          const url = URL.createObjectURL(blob);
          setBlobUrl(url);
        } else {
          setContent("No valid content available for this book.");
        }
      } catch (err) {
        console.error("Error reconstructing blob:", err);
        setContent("Failed to load book content.");
      }
    }
  }, [location.state]);

  useEffect(() => {
    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [blobUrl]);

  if (!book) return <p className="loading-text">Loading offline book...</p>;

  return (
    <div className="book-reader-container">
      <div className="book-reader-header">
        <h1>{book.title}</h1>
        <h3>by {book.author}</h3>
      </div>
      <div className="book-reader-content">
        {blobUrl ? (
          <embed src={blobUrl} type="application/pdf" width="100%" height="800px" />
        ) : (
          <pre>{content}</pre>
        )}
      </div>
    </div>
  );
};

export default OfflineBookReader;
