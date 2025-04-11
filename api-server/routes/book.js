const express = require("express");
const router = express.Router();

const { bookController } = require("../controllers");
const { bookValidator } = require("../validators/book");
const validate = require("../validators/validate");
const { isAuth } = require("../middlewares");

router.post("/", isAuth, bookValidator, validate, bookController.createBook);
router.get("/", isAuth, bookController.getAllBooks);
router.get("/:id", isAuth, bookController.getBookById);
router.put("/:id", isAuth, bookValidator, validate, bookController.updateBook);
router.delete("/:id", isAuth, bookController.deleteBook);

module.exports = router;
