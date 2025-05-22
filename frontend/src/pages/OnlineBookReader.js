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
  const [fetchRetries, setFetchRetries] = useState(0);
  const MAX_RETRIES = 3;

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

  // Helper function to fetch content with retries and fallbacks
  const fetchContentWithRetry = async (url) => {
    try {
      const contentResponse = await axios.get(`${API_URL}/books/fetch-content`, {
        params: { url },
        headers: { Authorization: `Bearer ${token}` },
        timeout: 15000 // Increased timeout to 15 seconds
      });
      return { success: true, data: contentResponse.data };
    } catch (error) {
      console.error(`Error fetching content from ${url}:`, error);
      
      // If we still have retries left
      if (fetchRetries < MAX_RETRIES) {
        setFetchRetries(prev => prev + 1);
        toast.info(`Connection timed out. Retrying... (${fetchRetries + 1}/${MAX_RETRIES})`);
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 2000));
        return fetchContentWithRetry(url);
      }
      
      // Try alternative URLs for Project Gutenberg books
      if (url.includes('gutenberg.org')) {
        // Try mirror sites or alternative formats
        const alternativeUrls = [
          // Try mirrors
          url.replace('www.gutenberg.org', 'gutenberg.pglaf.org'),
          url.replace('www.gutenberg.org', 'gutenberg.readingroo.ms'),
          
          // Try alternative file formats
          url.replace(/(\d+)-0.txt$/, '$1.txt'),
          url.replace(/(\d+).txt$/, '$1-0.txt'),
          url.replace(/(\d+).txt$/, '$1-8.txt'),
          
          // Try cache servers
          `https://gutenberg.cache.org/${url.split('/').pop()}`
        ];
        
        for (const altUrl of alternativeUrls) {
          try {
            toast.info(`Trying alternative source...`);
            const altResponse = await axios.get(`${API_URL}/books/fetch-content`, {
              params: { url: altUrl },
              headers: { Authorization: `Bearer ${token}` },
              timeout: 15000
            });
            return { success: true, data: altResponse.data };
          } catch (altError) {
            console.error(`Alternative URL ${altUrl} also failed:`, altError);
          }
        }
      }
      
      return { success: false, error: error.message || "Network error occurred" };
    }
  };

  useEffect(() => {
    if (!token) {
      toast.info("Please login to read books.");
      navigate("/login");
      return;
    }

    const fetchBook = async () => {
      try {
        setLoading(true);

        if (bookData) {
          setBook(bookData);

          // Handle PDF books (uploaded PDF files)
          if (bookData.url && bookData.url.startsWith('/uploads/pdfs/')) {
            setPdfUrl(`http://localhost:1000${bookData.url}`);
            setLoading(false);
            return;
          }

          // Handle Gutendex formats (including text formats)
          if (bookData.formats) {
            const bestTextUrl = getBestTextFormat(bookData.formats);
            if (bestTextUrl) {
              const result = await fetchContentWithRetry(bestTextUrl);
              if (result.success) {
                setContent(result.data);
              } else {
                setError("Failed to load book content. The text format may not be available.");
                toast.error("Could not load text content. Try downloading the ebook instead.");

                if (bookData.formats["application/epub+zip"]) {
                  setEpubUrl(bookData.formats["application/epub+zip"]);
                }
              }
              setLoading(false);
              return;
            } else if (bookData.formats["application/epub+zip"]) {
              setEpubUrl(bookData.formats["application/epub+zip"]);
              toast.info("This book is available in EPUB format. Please download to read.");
              setLoading(false);
              return;
            }
          }

          // Explicitly handle direct .txt URLs
          if (bookData.url && bookData.url.endsWith(".txt")) {
            const result = await fetchContentWithRetry(bookData.url);
            if (result.success) {
              setContent(result.data);
            } else {
              setError("Failed to load text (.txt) content.");
              toast.error("Failed to load .txt book content.");
            }
            setLoading(false);
            return;
          }

          // Handle EPUB URL (direct)
          if (bookData.url && bookData.url.includes('.epub')) {
            setEpubUrl(bookData.url);
            toast.info("This book is available in EPUB format. Please download to read.");
            setLoading(false);
            return;
          }

          // Handle other direct URLs (try fetching content)
          if (bookData.url && bookData.url.startsWith('http')) {
            const result = await fetchContentWithRetry(bookData.url);
            if (result.success) {
              setContent(result.data);
            } else {
              setError("Failed to load book content.");
              toast.error("Failed to load book content.");
            }
            setLoading(false);
            return;
          }

          setLoading(false);
          return;
        }

        // If no bookData in state, fetch from backend by bookId
        const endpoint = `${API_URL}/books/get-book-by-id/${bookId}`;
        const res = await axios.get(endpoint, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const fetchedBookData = res.data.data || res.data;
        setBook(fetchedBookData);

        // PDF handling
        if (fetchedBookData.url && fetchedBookData.url.startsWith('/uploads/pdfs/')) {
          setPdfUrl(`http://localhost:1000${fetchedBookData.url}`);
          setLoading(false);
          return;
        }

        // EPUB URL
        if (fetchedBookData.url && fetchedBookData.url.includes('.epub')) {
          setEpubUrl(fetchedBookData.url);
          toast.info("This book is available in EPUB format. Please download to read.");
          setLoading(false);
          return;
        }

        // Explicit .txt URL
        if (fetchedBookData.url && fetchedBookData.url.endsWith('.txt')) {
          const result = await fetchContentWithRetry(fetchedBookData.url);
          if (result.success) {
            setContent(result.data);
          } else {
            setError("Failed to load text (.txt) content.");
            toast.error("Failed to load .txt book content.");
          }
          setLoading(false);
          return;
        }

        // Other URLs: fetch content
        if (fetchedBookData.url && fetchedBookData.url.startsWith('http')) {
          const result = await fetchContentWithRetry(fetchedBookData.url);
          if (result.success) {
            setContent(result.data);
          } else {
            setError("Failed to load book content.");
            toast.error("Failed to load book content: " + result.error);
          }
          setLoading(false);
          return;
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching book:", err);
        setError("Failed to load the book. Please try again.");
        toast.error("Failed to load the book. Please try again.");
        setLoading(false);
      }
    };

    fetchBook();
  }, [bookId, token, navigate, location.state, bookData, fetchRetries]);

  const handleDownloadEpub = () => {
    if (epubUrl) {
      window.open(epubUrl, '_blank');
      toast.success("EPUB download started");
    }
  };

  const handleRetry = () => {
    setFetchRetries(0);
    setLoading(true);
    setError(null);
  };

  if (loading) return <p className="loading-text">Loading book...</p>;
  
  if (error && !epubUrl) return (
    <div className="error-container">
      <p className="error-text">{error}</p>
      <button className="retry-button" onClick={handleRetry}>
        Retry Loading
      </button>
    </div>
  );
  
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