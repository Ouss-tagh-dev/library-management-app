const { Book, User } = require("../models");

const createBook = async (req, res) => {
  try {
    const { title, author, description, isbn, publicationDate, quantity } =
      req.body;
    const userId = parseInt(req.user.id);

    const existingBook = await Book.findOne({ where: { isbn } });
    if (existingBook) {
      return res.status(400).json({
        success: false,
        message: "Book with this ISBN already exists",
      });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to create a book",
      });
    }

    const newBook = await Book.create({
      title,
      author,
      description,
      isbn,
      publicationDate,
      quantity,
      createdBy: userId,
      updatedBy: userId,
    });

    res.status(201).json({
      success: true,
      message: "Book created successfully",
      book: newBook,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error creating book",
      error: error.message,
    });
  }
};

const getAllBooks = async (req, res) => {
  try {
    const books = await Book.findAll();
    res.status(200).json({
      success: true,
      message: "Books retrieved successfully",
      books: books,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error retrieving books",
      error: error.message,
    });
  }
};

const getBookById = async (req, res) => {
  try {
    const { id } = req.params;
    const book = await Book.findByPk(id);
    if (!book) {
      return res
        .status(404)
        .json({ success: false, message: "Book not found" });
    }
    res.status(200).json({
      success: true,
      message: "Book retrieved successfully",
      book: book,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error retrieving book",
      error: error.message,
    });
  }
};

const updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, author, description, isbn, publicationDate, quantity } =
      req.body;
    const book = await Book.findByPk(id);
    const userId = parseInt(req.user.id);

    if (!book) {
      return res
        .status(404)
        .json({ success: false, message: "Book not found" });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to create a book",
      });
    }

    book.title = title;
    book.author = author;
    book.description = description;
    book.isbn = isbn;
    book.publicationDate = publicationDate;
    book.quantity = quantity;
    book.updatedBy = userId;

    await book.save();
    res.status(200).json({
      success: true,
      message: "Book updated successfully",
      book: book,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error updating book",
      error: error.message,
    });
  }
};

const deleteBook = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = parseInt(req.user.id);
    const book = await Book.findByPk(id);

    if (!book) {
      return res
        .status(404)
        .json({ success: false, message: "Book not found" });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to create a book",
      });
    }

    await book.destroy();
    res.status(200).json({
      success: true,
      message: "Book deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error deleting book",
      error: error.message,
    });
  }
};

module.exports = {
  createBook,
  getAllBooks,
  getBookById,
  updateBook,
  deleteBook,
};
