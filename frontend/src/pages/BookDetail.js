import React, { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import "../styles/bookDetail.css";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// Commenting out offline DB import as it's not required now
// import { saveBookToIndexedDB } from "../utils/offlineDB";

const BookDetail = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { id: bookIdParam } = useParams();

  const [book, setBook] = useState(state?.book || null);
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [error, setError] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [editReviewId, setEditReviewId] = useState(null);
  const [editComment, setEditComment] = useState("");
  const [editRating, setEditRating] = useState(0);


  const token = localStorage.getItem("authToken");
  const isLoggedIn = !!token;
  const user = JSON.parse(localStorage.getItem('user'));
  const bookId = state?.book?._id || bookIdParam;



  const fetchBookDetails = async (bookId) => {
    try {
      const response = await axios.get(
        `http://localhost:1000/api/v1/books/${bookId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBook(response.data.book);
    } catch (err) {
      console.error("Error fetching book details:", err);
      setError("Book not found or unauthorized access.");
      
      // If unauthorized, redirect to login
      if (err.response?.status === 401) {
        toast.error("Please log in to view this book");
        navigate("/login");
      }
    }
  };

  const fetchReviews = async (bookId) => {
    if (!bookId) return;
    try {
      const res = await axios.get(`http://localhost:1000/api/v1/reviews/${bookId}`);
      console.log("Full review response:", res.data);
      setReviews(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (err) {
      console.error("Error fetching reviews:", err);
      setReviews([]); // prevent undefined
    }
  };  
  
  

  const fetchFeaturedBooks = useCallback(async (currentBookId) => {
    try {
      const response = await axios.get("http://localhost:1000/api/v1/get-recent-books", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const filtered = response.data.data.filter((b) => b._id !== currentBookId);
      setFeaturedBooks(filtered.slice(0, 3));
    } catch (error) {
      console.error("Error fetching featured books:", error);
      setError("Failed to load featured books.");
    }
  }, [token]);
  

  useEffect(() => {
    if (!book && bookId) {
      fetchBookDetails(bookId);
    } else if (book?._id) {
      fetchFeaturedBooks(book._id);
      fetchReviews(book._id);
    }
    
    // Check token validity
    if (!token && bookId) {
      console.log("No auth token found, but continuing to fetch public book data");
    }
  }, [book, bookId, fetchFeaturedBooks, token]);
  
const handleReadClick = async () => {
  // Check if user is logged in
  if (!isLoggedIn) {
    navigate("/login");
    return;
  }

  const userId = user?._id;
  const bookIdToUse = book?._id || book?.id; // Handle both DB and Gutendex books

  // Debug info
  console.log("Handle Read Click - Debug Info:");
  console.log("User ID:", userId);
  console.log("Book ID to use:", bookIdToUse);
  console.log("Full book object:", book);

  if (!userId || !bookIdToUse) {
    toast.error("User or book information not found.");
    return;
  }

  try {
    // First add to library with consistent URL
    const libraryEndpoint = "http://localhost:1000/api/v1/library/add";
    console.log("Adding to library at:", libraryEndpoint);
    console.log("Library payload:", { bookId: bookIdToUse, currentlyReading: true });
    
    const libraryResponse = await axios.post(
      libraryEndpoint,
      { 
        bookId: bookIdToUse, 
        currentlyReading: true 
      },
      { 
        headers: { Authorization: `Bearer ${token}` } 
      }
    );
    
    console.log("Library add response:", libraryResponse?.data);
    toast.success("Book added to your library");
    
  } catch (err) {
    // Only show error if it's not "already in library"
    console.error("Library add error details:", err.response?.data || err.message);
    
    if (!err.response?.data?.message?.includes("Book already in library")) {
      console.error("Library add error:", err);
      toast.error("Could not save book to your library.");
      // Continue to reader anyway
    } else {
      console.log("Book already in library, continuing to reader");
    }
  }

  // Prepare navigation state with all possible book info
  const navigationState = {
    title: book.title,
    author: book?.authors?.[0]?.name || book?.author || "Unknown",
    // Pass the entire book object for safety
    bookData: book, 
  };
  
  console.log("Navigating to reader with state:", navigationState);
  console.log("Reader URL:", `/read/online/${bookIdToUse}`);

  // Navigate to reader with all necessary state data
  navigate(`/read/online/${bookIdToUse}`, {
    state: navigationState
  });
};

/* Commenting out the offline book saving functionality as it's not required now
const handleSaveBook = async () => {
  if (!book?.url) {
    toast.error("Book download URL not available.");
    return;
  }

  const isPdf = book.url.endsWith(".pdf"); // uploaded user book
  const isTxt = book.url.endsWith(".txt"); // Gutendex book

  if (!isPdf && !isTxt) {
    alert("This book format is not supported for offline save.");
    return;
  }

  const proxyUrl = `/api/external/proxy-book?url=${encodeURIComponent(book.url)}`;

  try {
    const response = await fetch(proxyUrl);
    if (!response.ok) throw new Error("Failed to download book content.");

    let content;

    // If it's a text file, fetch as text
    if (isTxt) {
      content = await response.text();
    } else if (isPdf) {
      // If it's a PDF file, fetch as ArrayBuffer
      content = await response.arrayBuffer();
    }

    const bookData = {
      id: book._id || book.id,
      title: book.title,
      author: book.author,
      genre: book.genre,
      coverImage: book.coverImage,
      url: book.url,
      format: isPdf ? "pdf" : "txt",
      content, // Save the content for offline reading
    };

    // Save the book in IndexedDB
    await saveBookToIndexedDB(bookData);
    toast.success("Book saved for offline reading!");
    console.log("📥 Saved book data:", bookData);
  } catch (err) {
    console.error("Error saving book offline:", err);
    toast.error("Failed to save book for offline use.");
  }
};
*/

// Log book URL properly if it exists
console.log('Book URL:', book?.url || 'No URL available');

  const handleAddToLibrary = async () => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    const bookId = book?._id;
    if (!bookId) return toast.error("Invalid book ID.");

    try {
      const response = await axios.post(
        "http://localhost:1000/api/v1/library/add",
        { bookId, currentlyReading: false },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(response.data.message || "Book added to library!");
    } catch (err) {
      console.error("Error adding book to library:", err);
      toast.error("Failed to add book to library");
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!rating && !comment) return toast.info("Please provide at least a rating or a comment.");

    try {
      await axios.post(
        `http://localhost:1000/api/v1/reviews/${book._id}`,
        { rating, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setRating(0);
      setComment("");
      toast.success("Review submitted!");
      fetchReviews(book._id);
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Failed to submit review.");
    }
  };

  const handleEditReview = (reviewId) => {
  const reviewToEdit = reviews.find((r) => r._id === reviewId);
  console.log("Matched review:", reviewToEdit);
  if (!reviewToEdit) {
    console.error("No review found with ID:", reviewId);
    return;
  }
  setEditReviewId(reviewId);
  setEditComment(reviewToEdit.comment);
  setEditRating(reviewToEdit.rating);
};


  const handleUpdateReview = async (e) => {
    e.preventDefault();
    if (!editRating && !editComment) return toast.info("Please provide at least a rating or a comment.");

    try {
      await axios.put(
        `http://localhost:1000/api/v1/reviews/${editReviewId}`,
        { rating: editRating, comment: editComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Review updated!");
      setEditReviewId(null);
      setEditComment("");
      setEditRating(0);
      fetchReviews(book._id);
    } catch (error) {
      console.error("Error updating review:", error);
      toast.error("Failed to update review.");
    }
  };

  const renderStars = (ratingValue, isEditable, onChangeRating) => {
    return (
      <div style={{ display: "flex", gap: "10px", fontSize: "28px", cursor: isEditable ? "pointer" : "default" }}>
        {[...Array(5)].map((_, i) => {
          const starValue = i + 1;
          return (
            <span
              key={i}
              onClick={isEditable ? () => onChangeRating(starValue) : null}
              onMouseEnter={isEditable ? () => onChangeRating(starValue) : null}
              style={{
                color: starValue <= ratingValue ? "#ffc107" : "#e4e5e9",
                transition: "color 0.2s",
              }}
            >
              ★
            </span>
          );
        })}
      </div>
    );
  };

  if (!book) {
    return (
      <div className="loading-container">
        <p>{error || "Loading book details..."}</p>
        {error && (
          <button 
            onClick={() => navigate("/explore")} 
            className="button"
          >
            Browse Other Books
          </button>
        )}
      </div>
    );
  }


  const averageRating =
  Array.isArray(reviews) && reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : "No ratings yet";



  return (
    <div>
      <ToastContainer position="top-right" autoClose={3000} />

      {/* === Book Info Section === */}
      <div className="book-detail-container">
      <img
        src={book.coverImage && book.coverImage.startsWith("http") 
          ? book.coverImage 
          : book.coverImage 
            ? `http://localhost:1000${book.coverImage}` 
            : "/default-book-cover.jpg"
        }
        alt={book.title}
        className="book-cover"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = "/default-book-cover.jpg";
        }}
      />



        <div className="book-info">
          <h1 className="book-title">{book.title}</h1>
          <h3 className="book-author">by {book.author}</h3>
          <p>{book.description}</p>

          <div className="book-meta">
          <p><span>Genre:</span> {book.genre?.name || "Unknown"}</p>
            <p><span>Uploaded on:</span> {book.uploadDate || "N/A"}</p>
            <p><span>Chapters:</span> {book.chapters || "N/A"}</p>
            <p><span>Average Rating:</span> {averageRating} </p>
          </div>

          <div className="button-container">
          <button className="button read-button" onClick={handleReadClick}>
            Read
          </button>

            <button className="button add-to-library" onClick={handleAddToLibrary}>
              Add To Library
            </button>

            {/* Commenting out the Save Offline button as offline reading is not required now */}
            {/* <button className="button save-offline" onClick={handleSaveBook}>Save Offline</button> */}
          </div>
        </div>
      </div>


      {/* === Review Form === */}
      {isLoggedIn && (
        <div className="review-section">
          <h2>Leave a Review</h2>
          <form onSubmit={handleReviewSubmit}>
            <label>
              Rating:
              <div className="stars">{renderStars(rating, true, setRating)}</div>
            </label>
            <textarea
              placeholder="Write your review here..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            ></textarea>
            <button type="submit">Submit Review</button>
          </form>
        </div>
      )}

      {/* === Reviews List === */}
      <div className="review-list">
        <h2>Reviews</h2>
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <div key={review._id} className="review-card">
              <p>
                <strong>{review.user?.username || "Anonymous"}</strong> rated it {renderStars(review.rating, false)}
              </p>
              <p>{review.comment}</p>
              {review.user?._id === (JSON.parse(localStorage.getItem("user"))?._id) && (
                <div>
                  <button className="edit-button" onClick={() => handleEditReview(review._id)}> Edit</button>
                </div>
              )}
            </div>
          ))
        ) : (
          <p>No reviews yet.</p>
        )}
      </div>

      {/* === Edit Review Modal === */}
      {editReviewId && (
        <div className="edit-review-modal">
          <h3>Edit Review</h3>
          <form onSubmit={handleUpdateReview}>
            <div className="stars">{renderStars(editRating, true, setEditRating)}</div>
            <textarea
              value={editComment}
              onChange={(e) => setEditComment(e.target.value)}
            ></textarea>
            <button type="submit">Update Review</button>
            <button onClick={() => setEditReviewId(null)}>Cancel</button>
          </form>
        </div>
      )}

      {/* === Featured Books === */}
      <section className="featured-books">
        {error && <p className="error-message">{error}</p>}
        <div className="book-row">
          {featuredBooks.length > 0 ? (
            featuredBooks.map((book, index) => (
              <div
                key={book._id || index}
                className="book-card"
                onClick={() => navigate(`/book/${book._id}`, { state: { book } })}
              >
                <img
                src={book.coverImage.startsWith("http") ? book.coverImage : `http://localhost:1000${book.coverImage}`}
                alt={book.title}
                className="book-cover"
              />
                <h3>{book.title}</h3>
                <p>by {book.author}</p>
              </div>
            ))
          ) : (
            <p>Loading featured books...</p>
          )}
        </div>
      </section>

      <button className="show-more" onClick={() => navigate("/explore")}>
        Explore More
      </button>
    </div>
  );
};

export default BookDetail;