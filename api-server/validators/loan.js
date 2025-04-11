const { check } = require("express-validator");

const loanValidator = [
  check("bookId").notEmpty().withMessage("Book ID is required"),
  check("loanDate").notEmpty().withMessage("Loan date is required"),
  check("returnDate").notEmpty().withMessage("Return date is required"),
];

module.exports = {
  loanValidator,
};
