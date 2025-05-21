import { openDB } from 'idb';

// Initialize or upgrade IndexedDB
export const initDB = async () => {
  return openDB('BookBagaichaDB', 2, {
    upgrade(db) {
      if (db.objectStoreNames.contains('books')) {
        db.deleteObjectStore('books'); // Recreate to avoid schema mismatch
      }
      db.createObjectStore('books', { keyPath: '_id' });
    }
  });
};

// Save a book to IndexedDB (supports PDF and TXT)
export const saveBookToIndexedDB = async (book) => {
  try {
    const isPdf = book.url.endsWith('.pdf');
    const isTxt = book.url.endsWith('.txt');

    if (!isPdf && !isTxt) {
      throw new Error('Unsupported book format. Only .txt and .pdf are supported.');
    }

    const downloadUrl = book.download_url || book.url;
    if (!downloadUrl) {
      throw new Error("No valid download URL found.");
    }

    // Normalize the book structure
    const normalizedBook = {
      ...book,
      _id: book._id || book.id,
    };

    if (!normalizedBook._id) {
      throw new Error("Cannot save book: missing '_id'. Book object: " + JSON.stringify(book));
    }

    let content;

    if (isPdf) {
      const response = await fetch(downloadUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch book content: ${response.statusText}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      content = Array.from(new Uint8Array(arrayBuffer)); // Store as Array
    } else if (isTxt) {
      const response = await fetch(downloadUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch book content: ${response.statusText}`);
      }
      content = await response.text(); // Plain text
    }

    const db = await initDB();
    const tx = db.transaction('books', 'readwrite');

    await tx.store.put({
      ...normalizedBook,
      content,
      format: isPdf ? 'pdf' : 'txt',
    });

    await tx.done;
    console.log('✅ Book saved to IndexedDB:', normalizedBook._id);
  } catch (error) {
    console.error('❌ Error saving book to IndexedDB:', error);
    throw error;
  }
};

// Retrieve one book by ID
export const getBookFromIndexedDB = async (bookId) => {
  const db = await initDB();
  return db.get('books', bookId);
};

// Delete book by ID
export const deleteBookFromIndexedDB = async (bookId) => {
  const db = await initDB();
  await db.delete('books', bookId);
};

// Get all stored books
export const getAllBooks = async () => {
  const db = await initDB();
  return db.getAll('books');
};
