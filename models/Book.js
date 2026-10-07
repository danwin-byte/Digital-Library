const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true },
    genre: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    year: { type: Number },
    pages: { type: Number },
    status: {
      type: String,
      enum: ["Read", "Reading", "Want to read"],
      default: "Want to read",
    },
    rating: { type: Number, min: 0, max: 5, default: 0 },
  },
  { timestamps: true }
);

bookSchema.index({ title: "text", author: "text", genre: "text" });

module.exports = mongoose.model("Book", bookSchema);
