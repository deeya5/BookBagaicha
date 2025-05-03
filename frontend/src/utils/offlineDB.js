import { openDB } from 'idb';

const DB_NAME = 'offlineBooksDB';
const STORE_NAME = 'books';

export const initDB = async () => {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    },
  });
};

export const saveBook = async (book) => {
  const db = await initDB();
  await db.put(STORE_NAME, book);
};

export const getAllBooks = async () => {
  const db = await initDB();
  return await db.getAll(STORE_NAME);
};

export const getBookById = async (id) => {
  const db = await initDB();
  return await db.get(STORE_NAME, id);
};

export const deleteBook = async (id) => {
  const db = await initDB();
  await db.delete(STORE_NAME, id);
};
