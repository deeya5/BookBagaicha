// OnlineBookReader.js - Modified to handle different content formats better

import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "../styles/bookReader.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL = "http://localhost:1000/api/v1";

const OnlineBookReader = () => {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("authToken");
  
  const { title, author, bookData } = location.state || {};
  
  const [book, setBook] = useState(null);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [epubUrl, setEpubUrl] = useState(null);
  
  // Helper function to find best content format
  const getBestTextFormat = (formats) => {
    // Order of preference for formats
    const textFormats = [
      "text/plain; charset=utf-8",
      "text/plain",
      "text/html; charset=utf-8",
      "text/html"
    ];
    
    // Try to find the first available text format
    for (const format of textFormats) {
      if (formats[format]) {
        return formats[format];
      }
    }
    
    return null;
  };
  
  useEffect(() => {
    if (!token) {
      toast.info("Please login to read books.");
      navigate("/login");
      return;
    }
    
    console.log("Book Reader Debug Info:");
    console.log("BookId from params:", bookId);
    console.log("Title from state:", title);
    console.log("Author from state:", author);
    console.log("Full location state:", location.state);
    
    const fetchBook = async () => {
      try {
        setLoading(true);
        
        // First, try to use the book data directly from state if available
        if (bookData) {
          console.log("Using book data from location state");
          setBook(bookData);
          
          // For PDF books, we'll set up direct URL to the PDF 
          if (bookData.url && bookData.url.startsWith('/uploads/pdfs/')) {
            const fullPdfUrl = `http://localhost:1000${bookData.url}`;
            console.log("Setting PDF URL:", fullPdfUrl);
            setPdfUrl(fullPdfUrl);
            setLoading(false);
            return;
          }
          
          // For Gutendex books, we need to handle their formats
          if (bookData.formats) {
            console.log("Book has formats object:", bookData.formats);
            
            // Find the best text format to use
            const bestTextUrl = getBestTextFormat(bookData.formats);
            
            if (bestTextUrl) {
              console.log("Using best text format URL:", bestTextUrl);
              
              try {
                // Use your fetchBookContent endpoint
                const contentResponse = await axios.get(`${API_URL}/books/fetch-content`, {
                  params: { url: bestTextUrl },
                  headers: { Authorization: `Bearer ${token}` }
                });
                
                console.log("Content fetched successfully");
                setContent(contentResponse.data);
              } catch (contentError) {
                console.error("Error fetching book content:", contentError);
                setError("Failed to load book content. The text format may not be available.");
                toast.error("Could not load text content. Try downloading the ebook instead.");
                
                // Check for EPUB format as fallback
                if (bookData.formats["application/epub+zip"]) {
                  setEpubUrl(bookData.formats["application/epub+zip"]);
                }
              }
            } 
            // If no text format available, check for EPUB
            else if (bookData.formats["application/epub+zip"]) {
              setEpubUrl(bookData.formats["application/epub+zip"]);
              toast.info("This book is available in EPUB format. Please download to read.");
            }
            
            setLoading(false);
            return;
          }
          
          // For direct URL books (already in database)
          if (bookData.url && bookData.url.startsWith('http')) {
            // Check if URL is an EPUB file
            if (bookData.url.includes('.epub')) {
              console.log("Book has EPUB URL:", bookData.url);
              setEpubUrl(bookData.url);
              toast.info("This book is available in EPUB format. Please download to read.");
              setLoading(false);
              return;
            }
            
            console.log("Fetching book content for URL:", bookData.url);
            
            try {
              // Use your fetchBookContent endpoint
              const contentResponse = await axios.get(`${API_URL}/books/fetch-content`, {
                params: { url: bookData.url },
                headers: { Authorization: `Bearer ${token}` }
              });
              
              console.log("Content fetched successfully");
              setContent(contentResponse.data);
            } catch (contentError) {
              console.error("Error fetching book content:", contentError);
              setError("Failed to load book content.");
              toast.error("Failed to load book content.");
            }
          }
          
          setLoading(false);
          return;
        }
        
        // If no book data in state, fetch from database
        const endpoint = `${API_URL}/books/get-book-by-id/${bookId}`;
        console.log("Fetching DB book from:", endpoint);
        
        const res = await axios.get(endpoint, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        console.log("Book API response:", res.data);
        const fetchedBookData = res.data.data || res.data;
        setBook(fetchedBookData);
        
        // Handle PDF books
        if (fetchedBookData.url && fetchedBookData.url.startsWith('/uploads/pdfs/')) {
          const fullPdfUrl = `http://localhost:1000${fetchedBookData.url}`;
          console.log("Setting PDF URL:", fullPdfUrl);
          setPdfUrl(fullPdfUrl);
        } 
        // Handle EPUB URLs
        else if (fetchedBookData.url && fetchedBookData.url.includes('.epub')) {
          setEpubUrl(fetchedBookData.url);
          toast.info("This book is available in EPUB format. Please download to read.");
        }
        // Handle other URLs
        else if (fetchedBookData.url && fetchedBookData.url.startsWith('http')) {
          console.log("Fetching content for URL:", fetchedBookData.url);
          
          try {
            // Use your fetchBookContent endpoint
            const contentResponse = await axios.get(`${API_URL}/books/fetch-content`, {
              params: { url: fetchedBookData.url },
              headers: { Authorization: `Bearer ${token}` }
            });
            
            setContent(contentResponse.data);
          } catch (contentError) {
            console.error("Error fetching book content:", contentError);
            setError("Failed to load book content.");
            toast.error("Failed to load book content.");
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching book:", err);
        console.error("Error details:", err.response?.data || err.message);
        setError("Failed to load the book. Please try again.");
        toast.error("Failed to load the book. Please try again.");
        setLoading(false);
      }
    };
    
    fetchBook();
  }, [bookId, token, navigate, title, author, location.state, bookData]);
  
  const handleDownloadEpub = () => {
    if (epubUrl) {
      window.open(epubUrl, '_blank');
      toast.success("EPUB download started");
    }
  };
  
  if (loading) return <p className="loading-text">Loading book...</p>;
  if (error && !epubUrl) return <p className="error-text">{error}</p>;
  if (!book) return <p className="loading-text">Book not found.</p>;
  
  return (
    <div className="book-reader-container">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="book-reader-header">
        <h1>{book?.title || "Untitled"}</h1>
        <h3>by {book?.author || "Unknown Author"}</h3>
        
        {epubUrl && (
          <div className="epub-download-section">
            <p>This book is available in EPUB format and cannot be displayed directly in the browser.</p>
            <button 
              className="download-button"
              onClick={handleDownloadEpub}
            >
              Download EPUB
            </button>
          </div>
        )}
      </div>
      
      <div className="book-reader-content">
        {pdfUrl ? (
          // For PDF files, we'll use an iframe to display them
          <div className="pdf-container">
            <iframe 
              src={pdfUrl} 
              title={book.title}
              width="100%" 
              height="800px" 
              style={{ border: "none" }}
            />
          </div>
        ) : content ? (
          // For text content (like Gutendex books)
          <pre style={{ whiteSpace: "pre-wrap", fontFamily: "inherit" }}>
            {content}
          </pre>
        ) : !epubUrl ? (
          <p className="loading-text">No readable content available for this book.</p>
        ) : null}
      </div>
    </div>
  );
};

export default OnlineBookReader;