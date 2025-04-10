const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const bodyParser = require("body-parser");
const { connectDB } = require("./init/db");
const { authRoute } = require("./routes");
const { errorHandler } = require("./middlewares");

// Init app
const app = express();

// Connect to DB
connectDB();

// Middleware
app.use(express.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));

// Routes
app.use("/api/v1/auth", authRoute);

// not found route
app.use((req, res, next) => {
  const error = new Error("Not Found");
  error.status = 404;
  next(error);
});

// Error handler middleware
app.use(errorHandler);

module.exports = app;
