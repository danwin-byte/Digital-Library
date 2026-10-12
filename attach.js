require("dotenv").config();
const mongoose = require("mongoose");
const Book = require("./models/Book");

const [title, filePath] = process.argv.slice(2);
if (!title || !filePath) {
  console.log('Usage: node attach.js "Book Title" books/file.pdf');
  process.exit(1);
}

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    const book = await Book.findOneAndUpdate(
      { title: new RegExp("^" + esc(title) + "$", "i") },
      { filePath },
      { new: true }
    );
    console.log(book ? `Attached ${filePath} to "${book.title}"` : "No book found with that title");
    process.exit(0);
  })
  .catch((e) => {
    console.error(e.message);
    process.exit(1);
  });