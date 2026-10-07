require("dotenv").config();
const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const Book = require("./models/Book");

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/cream_shelf";

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const GROUP_FIELDS = ["genre", "author", "status", "year"];

// List books (optional ?q= search, ?genre= filter)
app.get("/api/books", async (req, res) => {
  try {
    const { q, genre } = req.query;
    const filter = {};
    if (genre) filter.genre = genre;
    if (q) {
      const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [{ title: rx }, { author: rx }, { genre: rx }];
    }
    const books = await Book.find(filter).sort({ title: 1 }).lean();
    res.json(books);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Books grouped into shelves: /api/shelves?by=genre|author|status|year
app.get("/api/shelves", async (req, res) => {
  try {
    const by = GROUP_FIELDS.includes(req.query.by) ? req.query.by : "genre";
    const shelves = await Book.aggregate([
      { $sort: { title: 1 } },
      { $group: { _id: "$" + by, books: { $push: "$$ROOT" }, count: { $sum: 1 } } },
      { $sort: { count: -1, _id: 1 } },
    ]);
    res.json(shelves.map((s) => ({ name: String(s._id), count: s.count, books: s.books })));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/books/:id", async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).lean();
    if (!book) return res.status(404).json({ error: "Not found" });
    res.json(book);
  } catch (e) {
    res.status(400).json({ error: "Invalid id" });
  }
});

app.post("/api/books", async (req, res) => {
  try {
    const book = await Book.create(req.body);
    res.status(201).json(book);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.put("/api/books/:id", async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!book) return res.status(404).json({ error: "Not found" });
    res.json(book);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.delete("/api/books/:id", async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) return res.status(404).json({ error: "Not found" });
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: "Invalid id" });
  }
});

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log(`Cream Shelf running at http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  });
