import React, { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import "../styles/bookDetail.css";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { saveBook } from "../utils/offlineDB";

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
      const response = await axios.get(`http://localhost:1000/api/v1/books/${bookId}`);
      setBook(response.data.book);
    } catch (err) {
      console.error("Error fetching book details:", err);
      setError("Book not found.");
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
  

  // Fetch book details if not already present
  useEffect(() => {
    if (!book && bookId) {
      fetchBookDetails(bookId);
    } else if (book) {
      fetchFeaturedBooks(book._id);
      fetchReviews(book._id);
    }
  }, [book, bookId, fetchFeaturedBooks]);
  

// Fetch reviews and featured books once book is available
useEffect(() => {
  if (book?._id) {
    fetchFeaturedBooks(book._id);
    fetchReviews(book._id);
  }
}, [book?._id, fetchFeaturedBooks]);

const handleReadClick = async () => {
  if (!isLoggedIn) {
    navigate("/login");
    return;
  }

  const userId = user?._id;
  const bookIdToUse = book?._id;

  if (!userId || !bookIdToUse) {
    if (!userId) console.error("User ID missing.");
    if (!bookIdToUse) console.error("Book ID missing.");
    toast.error("User or book not found.");
    return;
  }

  try {
    await axios.post(
      "http://localhost:1000/api/v1/library/add",
      { bookId: bookIdToUse, currentlyReading: true }, // no userId in body if backend gets it from token
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log("user", user);
console.log("userId", user?._id);


    // console.log("Book added to library:", response.data);
    navigate(`/read/${bookIdToUse}`);
  } catch (err) {
    console.error("Error starting to read:", err);

    // If book already exists in the library, still allow navigation
    if (err.response?.data?.message === "Book already in library") {
      navigate(`/read/${bookIdToUse}`);
    } else {
      toast.error("Could not start reading the book.");
    }
  }
};

// console.log("📦 Payload being sent:", {
//   bookId,
// });

const handleSaveBook = async (book) => {
  try {
    console.log("book in handleSaveBook", book);
    if (!book.content) {
      throw new Error("No book content available.");
    }

    const offlineBook = {
      id: book._id,
      title: book.title,
      author: book.author,
      description: book.desc || '',
      content: book.content,
    };

    await saveBook(offlineBook);
    toast.success("Book saved for offline reading!");
  } catch (err) {
    console.error("Failed to save book:", err);
    toast.error("Failed to save book for offline reading.");
  }
};

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

  if (!book) return <p>Book details not found.</p>;


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
          className="book-image"
          src={book.coverImage || "https://via.placeholder.com/150"}
          alt={book.title}
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

            <button className="button save-offline" onClick={() => handleSaveBook(book)}>Save Offline</button>


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
                  className="book-image"
                  src={book.coverImage || "https://via.placeholder.com/150"}
                  alt={book.title}
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
