import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/explore.css";

const Explore = () => {
  const [allBooks, setAllBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [filterOpen] = useState(true);
  const booksPerPage = 8;
  const navigate = useNavigate();

  // Filter states
  const [filters, setFilters] = useState({
    genres: {},
    uploadTime: {
      recent: false,  // Last 30 days
      month: false,   // Last 3 months
      year: false,    // Last year
    },
    languages: {},
    specialFilters: {
      mostRated: false,     // Most rated books
      bookBagaichaWriters: false,  // BookBagaicha writers
      userUploaded: false,  // Added filter for user-uploaded books
      gutendexBooks: false, // Added filter for Gutendex API books
    }
  });

  useEffect(() => {
    const fetchBooks = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("authToken"); 

        
        // Change to use getAllBooks endpoint that fetches from all sources
        const response = await axios.get(
          "http://localhost:1000/api/v1/get-all-books",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // Extract books and ensure all have necessary properties
        const books = response.data.data.map(book => ({
          ...book,
          uploadDate: book.createdAt || book.uploadDate || new Date().toISOString(),
          ratings: book.ratings || Math.floor(Math.random() * 500),
          isBookBagaichaWriter: book.isBookBagaichaWriter || false,
          // Ensure all books have source designation
          isFromGutendex: book.isFromGutendex || false,
          // Ensure we're using genre name, not ID
          genre: book.genre?.name || book.genre || "Miscellaneous"
        }));
        
        // Extract available genres and languages for filters
        const availableGenres = {};
        const availableLanguages = {};
        
        books.forEach(book => {
          const genre = book.genre || "Miscellaneous";
          availableGenres[genre] = true;
          
          const language = book.language || "English";
          availableLanguages[language] = true;
        });

        // Initialize filters
        setFilters(prev => ({
          ...prev,
          genres: Object.keys(availableGenres).reduce((acc, genre) => {
            acc[genre] = false;
            return acc;
          }, {}),
          languages: Object.keys(availableLanguages).reduce((acc, language) => {
            acc[language] = false;
            return acc;
          }, {})
        }));

        setAllBooks(books);
        setFilteredBooks(books);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching books:", error);
        setError("Failed to load books. Please try again later.");
        setIsLoading(false);
      }
    };

    fetchBooks();
  }, []);

  // Apply filters whenever they change
  useEffect(() => {
    applyFilters();
  }, [filters, allBooks]);


  const applyFilters = () => {
    // Check if any filters are active
    const hasActiveGenreFilters = Object.values(filters.genres).some(value => value);
    const hasActiveLanguageFilters = Object.values(filters.languages).some(value => value);
    const hasActiveTimeFilters = Object.values(filters.uploadTime).some(value => value);
    const hasActiveSpecialFilters = Object.values(filters.specialFilters).some(value => value);
    
    // If no filters active, show all books
    if (!hasActiveGenreFilters && !hasActiveLanguageFilters && !hasActiveTimeFilters && !hasActiveSpecialFilters) {
      setFilteredBooks(allBooks);
      setCurrentPage(1);
      return;
    }
    
    // Apply filters
    const filtered = allBooks.filter(book => {
      // Genre filter
      if (hasActiveGenreFilters) {
        const bookGenre = book.genre || "Miscellaneous";
        if (!filters.genres[bookGenre]) return false;
      }
      
      // Language filter
      if (hasActiveLanguageFilters) {
        const bookLanguage = book.language || "English";
        if (!filters.languages[bookLanguage]) return false;
      }
      
      // Special filters
      if (hasActiveSpecialFilters) {
        // Book source filters (Gutendex or user-uploaded)
        if (filters.specialFilters.userUploaded && book.isFromGutendex) {
          return false;
        }
        
        if (filters.specialFilters.gutendexBooks && !book.isFromGutendex) {
          return false;
        }
        
        // Most rated filter
        if (filters.specialFilters.mostRated && book.ratings < 100) {
          return false;
        }
        
        // BookBagaicha writers filter
        if (filters.specialFilters.bookBagaichaWriters && !book.isBookBagaichaWriter) {
          return false;
        }
      }
      
      // Upload time filter
      if (hasActiveTimeFilters) {
        const uploadDate = new Date(book.uploadDate);
        const now = new Date();
        
        if (filters.uploadTime.recent && (now - uploadDate) <= 30 * 24 * 60 * 60 * 1000) {
          return true;
        }
        
        if (filters.uploadTime.month && (now - uploadDate) <= 90 * 24 * 60 * 60 * 1000) {
          return true;
        }
        
        if (filters.uploadTime.year && (now - uploadDate) <= 365 * 24 * 60 * 60 * 1000) {
          return true;
        }
        
        if (hasActiveTimeFilters) return false;
      }
      
      return true;
    });
    
    setFilteredBooks(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleFilterChange = (filterType, filterKey) => {
    setFilters(prev => {
      const newFilters = {...prev};
      
      if (filterType === 'uploadTime') {
        // For upload time, we want exclusive selection
        Object.keys(newFilters.uploadTime).forEach(key => {
          newFilters.uploadTime[key] = key === filterKey ? !newFilters.uploadTime[key] : false;
        });
      } else if (filterType === 'specialFilters') {
        // Toggle special filters independently
        newFilters.specialFilters[filterKey] = !newFilters.specialFilters[filterKey];
      } else {
        // For other filters, toggle the specific one
        newFilters[filterType][filterKey] = !newFilters[filterType][filterKey];
      }
      
      return newFilters;
    });
  };

  // Get current books for pagination
  const getCurrentBooks = () => {
    const indexOfLastBook = currentPage * booksPerPage;
    const indexOfFirstBook = indexOfLastBook - booksPerPage;
    return filteredBooks.slice(indexOfFirstBook, indexOfLastBook);
  };

  // Calculate total pages
  const totalPages = Math.ceil(filteredBooks.length / booksPerPage);

  // Navigation
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo(0, 0); // Scroll to top on page change
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo(0, 0); // Scroll to top on page change
    }
  };

  const clearAllFilters = () => {
    setFilters({
      genres: Object.keys(filters.genres).reduce((acc, genre) => {
        acc[genre] = false;
        return acc;
      }, {}),
      uploadTime: {
        recent: false,
        month: false,
        year: false,
      },
      languages: Object.keys(filters.languages).reduce((acc, language) => {
        acc[language] = false;
        return acc;
      }, {}),
      specialFilters: {
        mostRated: false,
        bookBagaichaWriters: false,
        userUploaded: false,
        gutendexBooks: false,
      }
    });
  };

  const currentBooks = getCurrentBooks();
  // Split books into two rows of 4
  const topRowBooks = currentBooks.slice(0, 4);
  const bottomRowBooks = currentBooks.slice(4, 8);

  return (
    <div className="explore-page">
      {/* Sidebar (Always Open) */}
      <div className="filter open">
        <div className="filter-header">
          <h2>Filters</h2>
          <button className="clear-filters" onClick={clearAllFilters}>Clear All</button>
        </div>
        
        {/* Special Filters - Added source filters */}
        <div className="filter-section">
          <h3>Special Filters</h3>
          <label className="filter-checkbox">
            <input 
              type="checkbox"
              checked={filters.specialFilters.userUploaded}
              onChange={() => handleFilterChange('specialFilters', 'userUploaded')}
            />
            <span className="checkmark"></span>
            User Uploaded Books
          </label>
          <label className="filter-checkbox">
            <input 
              type="checkbox"
              checked={filters.specialFilters.gutendexBooks}
              onChange={() => handleFilterChange('specialFilters', 'gutendexBooks')}
            />
            <span className="checkmark"></span>
            Gutendex Library Books
          </label>
          <label className="filter-checkbox">
            <input 
              type="checkbox"
              checked={filters.specialFilters.mostRated}
              onChange={() => handleFilterChange('specialFilters', 'mostRated')}
            />
            <span className="checkmark"></span>
            Most Rated
          </label>
          <label className="filter-checkbox">
            <input 
              type="checkbox"
              checked={filters.specialFilters.bookBagaichaWriters}
              onChange={() => handleFilterChange('specialFilters', 'bookBagaichaWriters')}
            />
            <span className="checkmark"></span>
            BookBagaicha Writers
          </label>
        </div>
        
        {/* Genre Filters */}
        <div className="filter-section">
          <h3>Genres</h3>
          {Object.keys(filters.genres).map(genre => (
            <label key={genre} className="filter-checkbox">
              <input 
                type="checkbox"
                checked={filters.genres[genre]}
                onChange={() => handleFilterChange('genres', genre)}
              />
              <span className="checkmark"></span>
              {genre}
            </label>
          ))}
        </div>
        
        {/* Upload Time Filters */}
        <div className="filter-section">
          <h3>Upload Time</h3>
          <label className="filter-checkbox">
            <input 
              type="checkbox"
              checked={filters.uploadTime.recent}
              onChange={() => handleFilterChange('uploadTime', 'recent')}
            />
            <span className="checkmark"></span>
            Last 30 days
          </label>
          <label className="filter-checkbox">
            <input 
              type="checkbox"
              checked={filters.uploadTime.month}
              onChange={() => handleFilterChange('uploadTime', 'month')}
            />
            <span className="checkmark"></span>
            Last 3 months
          </label>
          <label className="filter-checkbox">
            <input 
              type="checkbox"
              checked={filters.uploadTime.year}
              onChange={() => handleFilterChange('uploadTime', 'year')}
            />
            <span className="checkmark"></span>
            Last year
          </label>
        </div>
        
        {/* Language Filters */}
        <div className="filter-section">
          <h3>Languages</h3>
          {Object.keys(filters.languages).map(language => (
            <label key={language} className="filter-checkbox">
              <input 
                type="checkbox"
                checked={filters.languages[language]}
                onChange={() => handleFilterChange('languages', language)}
              />
              <span className="checkmark"></span>
              {language}
            </label>
          ))}
        </div>
      </div>
      
      {/* Main Content */}
      <div className={`explore-filter ${filterOpen ? 'open' : 'closed'}`}>
        <h1 className="explore-title">Explore Books</h1>
        
        {error && <p className="error-message">{error}</p>}
        
        {isLoading ? (
          <div className="loading-container">
            <div className="loader"></div>
            <p>Loading books...</p>
          </div>
        ) : (
          <>
            {filteredBooks.length === 0 ? (
              <div className="no-results">
                <p>No books found matching your filters.</p>
                <button className="clear-filters" onClick={clearAllFilters}>Clear Filters</button>
              </div>
            ) : (
              <div className="books-container">
                {/* Top Row */}
                <div className="books-row">
                  {topRowBooks.map((book, index) => (
                    <div
                      key={book._id || `book-${index}`}
                      className="book-card"
                      onClick={() => navigate(`/book/${book._id}`, { state: { book } })}
                    >
                      <div className="book-cover-container">
                        <img
                          src={
                            book.coverImage?.startsWith("http")
                              ? book.coverImage
                              : `http://localhost:1000${book.coverImage}`
                          }
                          alt={book.title}
                          className="book-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/default-book.jpg"; // fallback if image is missing
                          }}
                        />

                      </div>
                      <div className="book-info">
                        <h3 className="book-title">{book.title}</h3>
                        <p className="book-author">by {book.author}</p>
                        {book.genre && <span className="book-genre">{book.genre}</span>}
                        {book.isBookBagaichaWriter && <span className="book-badge">BookBagaicha Writer</span>}
                        {/* Add source indicator */}
                        {book.isFromGutendex ? 
                          <span className="book-source">Gutendex Library</span> : 
                          <span className="book-source">User Uploaded</span>
                        }
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Bottom Row */}
                <div className="books-row">
                  {bottomRowBooks.map((book, index) => (
                    <div
                      key={book._id || `book-b-${index}`}
                      className="book-card"
                      onClick={() => navigate(`/book/${book._id}`, { state: { book } })}
                    >
                      <div className="book-cover-container">
                        <img
                          src={
                            book.coverImage?.startsWith("http")
                              ? book.coverImage
                              : `http://localhost:1000${book.coverImage}`
                          }
                          alt={book.title}
                          className="book-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/default-book.jpg"; // fallback if image is missing
                          }}
                        />
                      </div>
                      <div className="book-info">
                        <h3 className="book-title">{book.title}</h3>
                        <p className="book-author">by {book.author}</p>
                        {book.genre && <span className="book-genre">{book.genre}</span>}
                        {book.isBookBagaichaWriter && <span className="book-badge">BookBagaicha Writer</span>}
                        {/* Add source indicator */}
                        {book.isFromGutendex ? 
                          <span className="book-source">Gutendex Library</span> : 
                          <span className="book-source">User Uploaded</span>
                        }
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Pagination Controls */}
            {filteredBooks.length > 0 && (
              <div className="pagination-controls">
                <button 
                  className="pagination-button" 
                  onClick={prevPage} 
                  disabled={currentPage === 1}
                >
                  &laquo; Previous
                </button>
                
                <span className="page-indicator">
                  Page {currentPage} of {totalPages}
                </span>
                
                <button 
                  className="pagination-button" 
                  onClick={nextPage} 
                  disabled={currentPage === totalPages || totalPages === 0}
                >
                  Next &raquo;
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Explore;