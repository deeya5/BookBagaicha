import { openDB } from 'idb';

export const initDB = async () => {
  return openDB('BookBagaichaDB', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('books')) {
        db.createObjectStore('books', { keyPath: '_id' });
      }
    }
  });
};

export const saveBookToIndexedDB = async (book) => {
  try {
    const isPdf = book.url.endsWith('.pdf');
    const isTxt = book.url.endsWith('.txt');

    if (!isPdf && !isTxt) {
      throw new Error('Unsupported book format. Only .txt and .pdf are supported.');
    }

    const downloadUrl = book.download_url || book.url;
console.log("Downloading from URL:", downloadUrl);

if (!downloadUrl) {
  throw new Error("No valid download URL found.");
}

const response = await fetch(downloadUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch book content: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const db = await initDB();
    const tx = db.transaction('books', 'readwrite');
    
    tx.store.put({
      ...book,
      content: arrayBuffer,
      format: isPdf ? 'pdf' : 'txt',
    });

    await tx.done;
    console.log('Book saved to IndexedDB');
  } catch (error) {
    console.error('Error saving book to IndexedDB:', error);
    throw error;
  }
};

export const getBookFromIndexedDB = async (bookId) => {
  const db = await initDB();
  return db.get('books', bookId);
};

export const deleteBookFromIndexedDB = async (bookId) => {
  const db = await initDB();
  await db.delete('books', bookId);
};

export const getAllBooks = async () => {
  const db = await initDB();
  return db.getAll('books');
};
