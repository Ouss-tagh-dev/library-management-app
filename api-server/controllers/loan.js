const { Book, User, Loan } = require("../models");

const createLoan = async (req, res) => {
  try {
    const { bookId, loanDate, returnDate } = req.body;
    const userId = parseInt(req.user.id);
    const user = await User.findByPk(userId);
    const book = await Book.findByPk(bookId);

    if (!book) {
      return res
        .status(404)
        .json({ success: false, message: "Book not found" });
    }

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const loan = await Loan.create({
      book_id: bookId,
      user_id: userId,
      loan_date: loanDate,
      return_date: returnDate,
    });
    res.status(201).json({
      success: true,
      message: "Loan created successfully",
      loan: loan,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error creating loan",
      error: error.message,
    });
  }
};

const getUserLoans = async (req, res) => {
  try {
    const userId = parseInt(req.user.id);
    const loans = await Loan.findAll({ where: { user_id: userId } });
    res.status(200).json({
      success: true,
      message: "Loans retrieved successfully",
      loans: loans,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error retrieving loans",
      error: error.message,
    });
  }
};

const deleteUserLoan = async (req, res) => {
  try {
    const userId = parseInt(req.user.id);
    const { id: loanId } = req.params;
    const loan = await Loan.findByPk(loanId);

    if (!loan) {
      return res
        .status(404)
        .json({ success: false, message: "Loan not found" });
    }
    if (loan.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to delete this loan",
      });
    }
    await loan.destroy();
    res.status(200).json({
      success: true,
      message: "Loan deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error deleting loan",
      error: error.message,
    });
  }
};

const getAllLoans = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only administrators can retrieve all loans.",
      });
    }

    const loans = await Loan.findAll({
      include: [
        {
          model: User,
          attributes: ["first_name", "last_name", "email", "role"],
        },
        {
          model: Book,
          attributes: ["id", "title", "author", "publicationDate"],
        },
      ],
    });

    res.status(200).json({
      success: true,
      message: "Loans retrieved successfully",
      loans: loans,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error retrieving loans",
      error: error.message,
    });
  }
};

module.exports = {
  createLoan,
  getUserLoans,
  deleteUserLoan,
  getAllLoans,
};
