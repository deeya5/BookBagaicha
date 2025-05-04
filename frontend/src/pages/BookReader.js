import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/bookReader.css"; 
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const BookReader = () => {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("authToken");

  const [book, setBook] = useState(null);
  const [content, setContent] = useState("");

  useEffect(() => {
    if (!token) {
      toast.info("Please login to read books.");
      navigate("/login");
      return;
    }
  
    const fetchBook = async () => {
      try {
        const res = await axios.get(
          `http://localhost:1000/api/v1/books/get-book-by-id/:${bookId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setBook(res.data.data); 
  
        // Fetch book content
        if (res.data.data.url) {
          const contentRes = await axios.get(
            `http://localhost:1000/api/v1/fetch-book-content`,
            {
              params: { url: res.data.data.url },
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          setContent(contentRes.data);
        } else {
          setContent("No content available for this book.");
        }
      } catch (err) {
        console.error("Failed to fetch book:", err);
        toast.error("Failed to load book content.");
      }
    };
  
    fetchBook();
  }, [bookId, token, navigate]);
  
  console.log("bookId from URL:", bookId);


  if (!book) return <p className="loading-text">Loading book...</p>;

  return (
    <div className="book-reader-container">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="book-reader-header">
        <h1>{book.title}</h1>
        <h3>by {book.author}</h3>
      </div>
      <div className="book-reader-content">
        <pre>{content}</pre>
      </div>
    </div>
  );
};

export default BookReader;
