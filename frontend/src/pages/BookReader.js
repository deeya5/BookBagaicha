import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "../styles/bookReader.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const BookReader = () => {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("authToken");

  const [book, setBook] = useState(null);
  const [content, setContent] = useState("");
  const [blobUrl, setBlobUrl] = useState(null);

  useEffect(() => {
    const offlineBook = location.state?.offlineBook;

    if (offlineBook) {
      setBook(offlineBook);

      try {
        let blob;

        if (offlineBook.content instanceof Blob) {
          // Already a valid Blob
          blob = offlineBook.content;
        } else if (offlineBook.content?.data && offlineBook.content?.type === "application/pdf") {
          // Rebuild the Blob correctly
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

      return;
    }

    if (!token) {
      toast.info("Please login to read books.");
      navigate("/login");
      return;
    }

    const fetchBook = async () => {
      try {
        const res = await axios.get(
          `http://localhost:1000/api/v1/books/get-book-by-id/${bookId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setBook(res.data.data);

        if (res.data.data.url) {
          const contentRes = await axios.get(
            `http://localhost:1000/api/v1/fetch-book-content`,
            {
              params: { url: res.data.data.url },
              headers: { Authorization: `Bearer ${token}` },
              responseType: "blob", // make sure this is set!
            }
          );

          const blob = new Blob([contentRes.data], { type: "application/pdf" });
          const url = URL.createObjectURL(blob);
          setBlobUrl(url);
        } else {
          setContent("No content available for this book.");
        }
      } catch (err) {
        console.error("Failed to fetch book:", err);
        toast.error("Failed to load book content.");
      }
    };

    fetchBook();
  }, [bookId, token, navigate, location.state]);

  useEffect(() => {
    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [blobUrl]);

  if (!book) return <p className="loading-text">Loading book...</p>;

  return (
    <div className="book-reader-container">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="book-reader-header">
        <h1>{book.title}</h1>
        <h3>by {book.author}</h3>
      </div>
      <div className="book-reader-content">
        {blobUrl ? (
          <embed
            src={blobUrl}
            type="application/pdf"
            width="100%"
            height="800px"
          />
        ) : (
          <pre>{content}</pre>
        )}
      </div>
    </div>
  );
};

export default BookReader;
