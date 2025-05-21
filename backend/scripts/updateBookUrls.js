const mongoose = require('mongoose');
const Book = require('../models/book'); // adjust if in a different folder
require('dotenv').config();

async function deleteDuplicatesByTitle() {
  try {
    await mongoose.connect(process.env.URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const duplicates = await Book.aggregate([
      {
        $group: {
          _id: "$title",
          ids: { $push: "$_id" },
          count: { $sum: 1 }
        }
      },
      {
        $match: {
          count: { $gt: 1 }
        }
      }
    ]);

    let totalDeleted = 0;

    for (const group of duplicates) {
      const [keepId, ...removeIds] = group.ids;

      if (removeIds.length > 0) {
        const res = await Book.deleteMany({ _id: { $in: removeIds } });
        totalDeleted += res.deletedCount;
        console.log(`Deleted ${res.deletedCount} duplicate(s) for title: "${group._id}"`);
      }
    }

    console.log(`Finished deleting duplicates by title. Total deleted: ${totalDeleted}`);

    await mongoose.disconnect();
  } catch (error) {
    console.error("Error deleting duplicates:", error);
  }
}

deleteDuplicatesByTitle();
