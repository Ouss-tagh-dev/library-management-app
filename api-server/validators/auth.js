const { check } = require("express-validator");

const signupValidator = [
  check("first_name").not().isEmpty().withMessage("First name is required"),
  check("last_name").not().isEmpty().withMessage("Last name is required"),
  check("email")
    .isEmail()
    .withMessage("Email is not valid")
    .not()
    .isEmpty()
    .withMessage("Email is required"),
  check("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  check("role").not().isEmpty().withMessage("Role is required"),
];

const signinValidator = [
  check("email")
    .isEmail()
    .withMessage("Email is not valid")
    .notEmpty()
    .withMessage("Email is required"),
  check("password").notEmpty().withMessage("Password is required"),
];

module.exports = {
  signupValidator,signinValidator
};
