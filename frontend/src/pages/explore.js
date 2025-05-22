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
  const booksPerPage = 8;
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    uploadTime: {
      recent: false,
      month: false,
      year: false,
    },
    languages: {},
    specialFilters: {
      mostRated: false,
      bookBagaichaWriters: false,
      gutendexBooks: false,
    }
  });

  useEffect(() => {
    const fetchBooks = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("authToken");
        const response = await axios.get(
          "http://localhost:1000/api/v1/public-books",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const books = response.data.data.map(book => ({
          ...book,
          uploadDate: book.createdAt || book.uploadDate || new Date().toISOString(),
          // Keep original ratings data - don't generate fake ratings
          ratings: book.ratings || null,
          averageRating: book.averageRating || null,
          isBookBagaichaWriter: book.isBookBagaichaWriter || false,
          isFromGutendx: book.isFromGutendx || false, // Fixed typo: Gutendx not Gutendex
        }));

        const availableLanguages = {};
        books.forEach(book => {
          const language = book.language || "English";
          availableLanguages[language] = true;
        });

        setFilters(prev => ({
          ...prev,
          languages: Object.keys(availableLanguages).reduce((acc, lang) => {
            acc[lang] = false;
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

  useEffect(() => {
    const handleFilters = async () => {
      await applyFilters();
    };
    handleFilters();
  }, [filters, allBooks]);

  const fetchBookBagaichaWriters = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get("http://localhost:1000/api/v1/uploaded-books", {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Sort by createdAt (latest first)
      const sortedBooks = response.data.books.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return sortedBooks;
    } catch (error) {
      console.error("Error fetching BookBagaicha writers books:", error);
      return [];
    }
  };

  const fetchGutendxBooks = async () => {
    try {
      const token = localStorage.getItem("authToken");
      
      // Add timeout and better error handling
      const response = await axios.get("http://localhost:1000/api/v1/gutendx-books", {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000, // 10 second timeout
      });

      // Handle different possible response structures
      let books = [];
      if (response.data && response.data.data) {
        books = response.data.data;
      } else if (response.data && Array.isArray(response.data)) {
        books = response.data;
      } else {
        console.warn("Unexpected response structure for Gutendx books:", response.data);
        return [];
      }

      // Filter for Gutendx books and ensure proper data structure
      return books
        .filter(book => book.isFromGutendx || book.source === 'gutendx')
        .map(book => ({
          ...book,
          isFromGutendx: true,
          averageRating: book.averageRating || null,
          ratings: book.ratings || null,
        }));
    } catch (error) {
      console.error("Error fetching Gutendx books:", error);
      
      // Provide more specific error information
      if (error.response) {
        console.error("Response error:", error.response.status, error.response.data);
        setError(`Failed to load Gutendx books: ${error.response.status} error`);
      } else if (error.request) {
        console.error("Request error:", error.request);
        setError("Failed to connect to Gutendx books service");
      } else {
        console.error("Unknown error:", error.message);
        setError("An unexpected error occurred while loading Gutendx books");
      }
      
      return [];
    }
  };

  const applyFilters = async () => {
    const hasActiveLanguageFilters = Object.values(filters.languages).some(v => v);
    const hasActiveTimeFilters = Object.values(filters.uploadTime).some(v => v);
    const hasActiveSpecialFilters = Object.values(filters.specialFilters).some(v => v);

    if (!hasActiveLanguageFilters && !hasActiveTimeFilters && !hasActiveSpecialFilters) {
      setFilteredBooks(allBooks);
      setCurrentPage(1);
      return;
    }

    let booksToFilter = [...allBooks];

    // Handle special filters that require specific data sources
    if (hasActiveSpecialFilters) {
      if (filters.specialFilters.bookBagaichaWriters) {
        const bagaichaBooks = await fetchBookBagaichaWriters();
        booksToFilter = bagaichaBooks;
      } else if (filters.specialFilters.gutendexBooks) {
        const gutendxBooks = await fetchGutendxBooks();
        booksToFilter = gutendxBooks;
      } else if (filters.specialFilters.mostRated) {
        // Filter books that have been rated (have actual ratings, not null/undefined)
        booksToFilter = [...allBooks].filter(book => {
          const hasRatings = (book.averageRating !== null && book.averageRating !== undefined) || 
                            (book.ratings !== null && book.ratings !== undefined);
          return hasRatings;
        });
        console.log(`Filtered ${booksToFilter.length} books with ratings out of ${allBooks.length} total books`);
      }
    }

    const filtered = booksToFilter.filter(book => {
      // Language filter
      if (hasActiveLanguageFilters) {
        const lang = book.language || "English";
        if (!filters.languages[lang]) return false;
      }

      // Upload Time filter
      if (hasActiveTimeFilters) {
        const uploadDate = new Date(book.uploadDate || book.createdAt);
        const now = new Date();
        const daysDiff = (now - uploadDate) / (24 * 60 * 60 * 1000);

        let matchesTimeFilter = false;
        if (filters.uploadTime.recent && daysDiff <= 30) matchesTimeFilter = true;
        if (filters.uploadTime.month && daysDiff <= 90) matchesTimeFilter = true;
        if (filters.uploadTime.year && daysDiff <= 365) matchesTimeFilter = true;

        if (!matchesTimeFilter) return false;
      }

      return true;
    });

    setFilteredBooks(filtered);
    setCurrentPage(1);
  };

  const handleFilterChange = (type, key) => {
    console.log("Filter changed:", type, key);
    setFilters(prev => {
      console.log("Previous filters:", prev);
      const updated = { ...prev };
      
      if (type === "uploadTime") {
        // For upload time, only one can be selected at a time
        Object.keys(updated.uploadTime).forEach(k => {
          updated.uploadTime[k] = k === key ? !prev.uploadTime[k] : false;
        });
      } else if (type === "specialFilters") {
        // Toggle the specific special filter - allow multiple selections
        updated.specialFilters = {
          ...updated.specialFilters,
          [key]: !prev.specialFilters[key]
        };
      } else if (type === "languages") {
        // Toggle the specific language
        updated.languages = {
          ...updated.languages,
          [key]: !prev.languages[key]
        };
      }
      
      console.log("Updated filters:", updated);
      return updated;
    });
  };

  const clearAllFilters = () => {
    setFilters({
      uploadTime: {
        recent: false,
        month: false,
        year: false,
      },
      languages: Object.keys(filters.languages).reduce((acc, lang) => {
        acc[lang] = false;
        return acc;
      }, {}),
      specialFilters: {
        mostRated: false,
        bookBagaichaWriters: false,
        gutendexBooks: false,
      }
    });
  };

  const getCurrentBooks = () => {
    const indexOfLast = currentPage * booksPerPage;
    const indexOfFirst = indexOfLast - booksPerPage;
    return filteredBooks.slice(indexOfFirst, indexOfLast);
  };

  const nextPage = () => {
    if (currentPage < Math.ceil(filteredBooks.length / booksPerPage)) {
      setCurrentPage(prev => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
      window.scrollTo(0, 0);
    }
  };

  const currentBooks = getCurrentBooks();
  const topRowBooks = currentBooks.slice(0, 4);
  const bottomRowBooks = currentBooks.slice(4, 8);

  return (
    <div className="explore-page">
      <div className="filter open">
        <div className="filter-header">
          <h2>Filters</h2>
          <button className="clear-filters" onClick={clearAllFilters}>Clear All</button>
        </div>

        {/* Special Filters */}
        <div className="filter-section">
          <h3>Special Filters</h3>
          {/* <label className="filter-checkbox">
            <input
              type="checkbox"
              checked={filters.specialFilters.gutendexBooks}
              onChange={() => handleFilterChange("specialFilters", "gutendexBooks")}
            />
            <span className={`checkmark ${filters.specialFilters.gutendexBooks ? 'checked' : ''}`}></span>
            Gutendx Library Books
          </label> */}
          <label className="filter-checkbox">
            <input
              type="checkbox"
              checked={filters.specialFilters.mostRated}
              onChange={() => handleFilterChange("specialFilters", "mostRated")}
            />
            <span className={`checkmark ${filters.specialFilters.mostRated ? 'checked' : ''}`}></span>
            Rated Books
          </label>
          <label className="filter-checkbox">
            <input
              type="checkbox"
              checked={filters.specialFilters.bookBagaichaWriters}
              onChange={() => handleFilterChange("specialFilters", "bookBagaichaWriters")}
            />
            <span className={`checkmark ${filters.specialFilters.bookBagaichaWriters ? 'checked' : ''}`}></span>
            By BookBagaicha Writers
          </label>
        </div>

        {/* Upload Time */}
        <div className="filter-section">
          <h3>Upload Time</h3>
          <label className="filter-checkbox">
            <input
              type="checkbox"
              checked={filters.uploadTime.recent}
              onChange={() => handleFilterChange("uploadTime", "recent")}
            />
            <span className={`checkmark ${filters.uploadTime.recent ? 'checked' : ''}`}></span>
            Last 30 days
          </label>
          <label className="filter-checkbox">
            <input
              type="checkbox"
              checked={filters.uploadTime.month}
              onChange={() => handleFilterChange("uploadTime", "month")}
            />
            <span className={`checkmark ${filters.uploadTime.month ? 'checked' : ''}`}></span>
            Last 3 months
          </label>
          <label className="filter-checkbox">
            <input
              type="checkbox"
              checked={filters.uploadTime.year}
              onChange={() => handleFilterChange("uploadTime", "year")}
            />
            <span className={`checkmark ${filters.uploadTime.year ? 'checked' : ''}`}></span>
            Last year
          </label>
        </div>

        {/* Language Filters */}
        <div className="filter-section">
          <h3>Languages</h3>
          {Object.keys(filters.languages).map(lang => (
            <label key={lang} className="filter-checkbox">
              <input
                type="checkbox"
                checked={filters.languages[lang]}
                onChange={() => handleFilterChange("languages", lang)}
              />
              <span className={`checkmark ${filters.languages[lang] ? 'checked' : ''}`}></span>
              {lang}
            </label>
          ))}
        </div>
      </div>

      <div className="explore-filter open">
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
                <div className="books-row">
                  {topRowBooks.map((book, index) => (
                    <div
                      key={book._id || `book-${index}`}
                      className="book-card"
                      onClick={() => navigate(`/book/${book._id}`, { state: { book } })}
                    >
                      <img
                        src={
                          book.coverImage && book.coverImage.startsWith("http")
                            ? book.coverImage
                            : `http://localhost:1000${book.coverImage || '/default-cover.jpg'}`
                        }
                        alt={book.title}
                        className="book-cover"
                        onError={(e) => {
                          e.target.src = '/default-cover.jpg'; // Fallback image
                        }}
                      />
                      <div className="book-title">{book.title}</div>
                      <div className="book-author">{book.author}</div>
                    </div>
                  ))}
                </div>
                <div className="books-row">
                  {bottomRowBooks.map((book, index) => (
                    <div
                      key={book._id || `book-${index}`}
                      className="book-card"
                      onClick={() => navigate(`/book/${book._id}`, { state: { book } })}
                    >
                      <img
                        src={
                          book.coverImage && book.coverImage.startsWith("http")
                            ? book.coverImage
                            : `http://localhost:1000${book.coverImage || '/default-cover.jpg'}`
                        }
                        alt={book.title}
                        className="book-cover"
                        onError={(e) => {
                          e.target.src = '/default-cover.jpg'; // Fallback image
                        }}
                      />
                      <div className="book-title">{book.title}</div>
                      <div className="book-author">{book.author}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Pagination */}
        {filteredBooks.length > booksPerPage && (
          <div className="pagination">
            <button onClick={prevPage} disabled={currentPage === 1}>
              Previous
            </button>
            <span>Page {currentPage} of {Math.ceil(filteredBooks.length / booksPerPage)}</span>
            <button onClick={nextPage} disabled={currentPage === Math.ceil(filteredBooks.length / booksPerPage)}>
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Explore;