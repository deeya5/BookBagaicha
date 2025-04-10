exports.addBookToLibrary = async (req, res) => {
  const userId = req.user.id;
  const { bookId } = req.body;

  try {
    const existing = await Library.findOne({ user: userId, book: bookId });
    if (existing) {
      return res.status(400).json({ message: "Book already in library" });
    }

    const newBook = new Library({
      user: userId,
      book: bookId, // ✅ match field name in schema
    });

    const saved = await newBook.save();
    res.status(201).json({ message: "Book added to library", data: saved });
  } catch (err) {
    console.error("Add to library error:", err);
    res.status(500).json({ error: "Failed to add book to library" });
  }
};
