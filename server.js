const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const Book = require("./models/book");

const app = express();

// ================= MIDDLEWARE =================
app.use(cors());
app.use(express.json());

// ================= DATABASE CONNECTION =================
mongoose
  .connect("mongodb://127.0.0.1:27017/libraryDB")
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ MongoDB Error:", err));

// ================= TEST ROUTE =================
app.get("/", (req, res) => {
  res.send("Library Management System API Running");
});

// =====================================================
// ======================= GET APIs ====================
// =====================================================

// GET all books
app.get("/books", async (req, res) => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: "Error fetching books" });
  }
});

// GET single book by ID
app.get("/books/:id", async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.json(book);
  } catch (error) {
    res.status(500).json({ message: "Error fetching book" });
  }
});

// GET books by category
app.get("/books/category/:category", async (req, res) => {
  try {
    const books = await Book.find({
      category: req.params.category
    });
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: "Error fetching by category" });
  }
});

// GET books by published year
app.get("/books/year/:year", async (req, res) => {
  try {
    const books = await Book.find({
      publishedYear: req.params.year
    });
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: "Error fetching by year" });
  }
});

// =====================================================
// ======================= POST APIs ===================
// =====================================================

// POST add new book
app.post("/add-book", async (req, res) => {
  try {
    const {
      title,
      author,
      category,
      publishedYear,
      availableCopies
    } = req.body;

    if (
      !title ||
      !author ||
      !category ||
      !publishedYear ||
      availableCopies === undefined
    ) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    const book = new Book({
      title,
      author,
      category,
      publishedYear,
      availableCopies
    });

    await book.save();

    res.status(201).json({
      message: "Book added successfully",
      book
    });
  } catch (error) {
    res.status(500).json({
      message: "Error adding book",
      error: error.message
    });
  }
});

// =====================================================
// ====================== PATCH APIs ===================
// =====================================================

// PATCH update book count
app.patch("/books/update-count/:id", async (req, res) => {
  try {
    const { availableCopies } = req.body;

    const book = await Book.findByIdAndUpdate(
      req.params.id,
      { availableCopies },
      { new: true }
    );

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.json({
      message: "Book count updated",
      book
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating count" });
  }
});

// PATCH update book category
app.patch("/books/update-category/:id", async (req, res) => {
  try {
    const { category } = req.body;

    const book = await Book.findByIdAndUpdate(
      req.params.id,
      { category },
      { new: true }
    );

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.json({
      message: "Book category updated",
      book
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating category" });
  }
});

// =====================================================
// ====================== DELETE API ===================
// =====================================================

// DELETE book only if availableCopies = 0
app.delete("/books/:id", async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    if (book.availableCopies > 0) {
      return res.status(400).json({
        message: "Cannot delete book with available copies"
      });
    }

    await book.deleteOne();

    res.json({ message: "Book deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting book" });
  }
});

// ================= START SERVER =================
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
