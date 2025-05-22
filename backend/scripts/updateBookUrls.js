const mongoose = require("mongoose");
const axios = require("axios");
const Book = require("../models/book");
const Genre = require("../models/genre");
const User = require("../models/user");
require("dotenv").config();

/**
 * Fetch books from Gutendex API and save only those with .txt formats to the database
 * @param {number} booksToFetch - Number of books to fetch and save (default: 50)
 * @param {number} maxPages - Maximum number of pages to fetch (default: 20)
 */
async function fetchAndSaveTextBooks(booksToFetch = 50, maxPages = 20) {
  try {
    console.log(`🚀 Starting book fetch process. Target: ${booksToFetch} .txt format books`);
    
    // Connect to database
    await mongoose.connect(process.env.URI);
    console.log("📊 Connected to database");

    // Find admin user
    const adminUser = await User.findOne({ role: { $in: ["super_admin", "admin"] } });
    if (!adminUser) {
      console.error("❌ No admin or superadmin user found. Book upload requires an admin account.");
      await mongoose.disconnect();
      return;
    }
    console.log(`👤 Found admin user: ${adminUser.username || adminUser.email}`);

    // Stats tracking
    let totalAdded = 0;
    let totalSkipped = 0;
    let totalDuplicates = 0;
    let notTextFormat = 0;
    let page = 1;

    // Continue fetching until we reach desired number of books or max pages
    while (totalAdded < booksToFetch && page <= maxPages) {
      try {
        console.log(`📚 Fetching page ${page} from Gutendex...`);
        const response = await axios.get(`https://gutendex.com/books?page=${page}`);
        
        if (!response.data || !response.data.results || !Array.isArray(response.data.results)) {
          console.error("❌ Invalid API response format");
          page++;
          continue;
        }

        const books = response.data.results;
        console.log(`📖 Found ${books.length} books on page ${page}`);

        // Process each book
        for (const book of books) {
          // Stop if we've reached our target
          if (totalAdded >= booksToFetch) {
            break;
          }

          // Check for necessary book data
          if (!book.title) {
            totalSkipped++;
            continue;
          }

          const formats = book.formats || {};
          
          // Only look for plain text formats (.txt)
          const plainTextUrl = formats["text/plain"] || formats["text/plain; charset=utf-8"];
          
          // Skip if no plain text format available
          if (!plainTextUrl) {
            notTextFormat++;
            continue;
          }
          
          // Additional check to ensure URL ends with .txt
          if (!plainTextUrl.endsWith('.txt')) {
            notTextFormat++;
            continue;
          }

          // Check for duplicates
          const exists = await Book.findOne({ 
            $or: [
              { title: book.title },
              { url: plainTextUrl }
            ]
          });
          
          if (exists) {
            totalDuplicates++;
            continue;
          }

          // Process genre
          const genreName = book.subjects?.[0] || "Uncategorized";
          let genre = await Genre.findOne({ name: genreName });
          if (!genre) {
            genre = await Genre.create({ 
              name: genreName,
              desc: `Books about ${genreName}`
            });
            console.log(`🏷️ Created new genre: ${genreName}`);
          }

          // Create book entry
          await Book.create({
            title: book.title,
            url: plainTextUrl,
            author: book.authors?.[0]?.name || "Unknown",
            genre: genre._id,
            coverImage: book.formats["image/jpeg"] || "",
            desc: book.subjects?.slice(0, 5).join(", ") || "No description available.",
            uploadedBy: adminUser._id,
            createdAt: new Date(),
            downloads: 0,
            languages: book.languages || ["en"],
            copyright: book.copyright ? false : true,
            downloadCount: 0,
            format: "txt"  // Explicitly mark as txt format
          });

          totalAdded++;
          console.log(`✅ Added .txt book: "${book.title}" by ${book.authors?.[0]?.name || "Unknown"}`);
          
          // Small delay to avoid overwhelming the database
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        console.log(`📊 Progress - Page ${page}: Added: ${totalAdded}/${booksToFetch}, Skipped: ${totalSkipped}, Not .txt format: ${notTextFormat}, Duplicates: ${totalDuplicates}`);
        
        // Check if there are more pages
        if (!response.data.next) {
          console.log("🛑 No more pages available from Gutendex API");
          break;
        }
        
        page++;
        
        // Add a small delay between page requests to be nice to the API
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (pageError) {
        console.error(`❌ Error fetching page ${page}:`, pageError.message);
        page++;
        
        // Wait a bit longer if we encounter an error
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    // Summary
    console.log("\n📝 SUMMARY:");
    console.log(`🎉 Book fetch complete! Pages processed: ${page}`);
    console.log(`📚 .txt Books added: ${totalAdded}`);
    console.log(`⏭️ Books skipped (missing data): ${totalSkipped}`);
    console.log(`📄 Books skipped (not .txt format): ${notTextFormat}`);
    console.log(`🔄 Duplicate books: ${totalDuplicates}`);
    
    // Disconnect from database
    await mongoose.disconnect();
    console.log("🔌 Disconnected from database");
    
  } catch (err) {
    console.error("❌ Fatal error syncing books:", err);
    
    // Ensure database connection is closed even on error
    try {
      await mongoose.disconnect();
      console.log("🔌 Disconnected from database after error");
    } catch (disconnectErr) {
      console.error("❌ Error disconnecting from database:", disconnectErr);
    }
  }
}

// Execute the function with the desired number of books
fetchAndSaveTextBooks(50);

// Export the function for potential reuse in other scripts
module.exports = fetchAndSaveTextBooks;