const { check } = require("express-validator");

const bookValidator = [
  check("title").notEmpty().withMessage("Title is required"),
  check("author").notEmpty().withMessage("Author is required"),
  check("description").notEmpty().withMessage("Description is required"),
  check("isbn").notEmpty().withMessage("ISBN is required"),
  check("isbn")
    .isLength({ max: 100 })
    .withMessage("ISBN must be at most 100 characters"),
  check("publicationDate")
    .notEmpty()
    .withMessage("Publication date is required"),
  check("publicationDate")
    .isISO8601()
    .withMessage("Publication date must be a valid date"),
  check("quantity")
    .notEmpty()
    .withMessage("Quantity is required")
    .isInt({ min: 1 })
    .withMessage("Quantity must be an integer greater than or equal to 1"),
];

module.exports = {
  bookValidator,
};
