const express = require("express");
const router = express.Router();

const { loanController } = require("../controllers");
const { loanValidator } = require("../validators/loan");
const validate = require("../validators/validate");
const { isAuth } = require("../middlewares");

router.post("/", isAuth, loanValidator, validate, loanController.createLoan);
router.get("/loans", isAuth, loanController.getAllLoans);
router.get("/", isAuth, loanController.getUserLoans);
router.delete("/:id", isAuth, loanController.deleteUserLoan);

module.exports = router;
