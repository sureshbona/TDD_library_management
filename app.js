"use strict";

const express = require("express");
const mongoose = require("mongoose");
const createError = require("http-errors");
const config = require("./config/config.js");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// database configuration
mongoose
  .connect(global.gConfig.database, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB at " + global.gConfig.database))
  .catch((err) => {
    console.log("Failed to connect to MongoDB...", err);
    process.exit();
  });

// route initialization
const usersRouter = require("./routes/user.route");
const libRouter = require("./routes/book.route");

app.use("/api/users", usersRouter);
app.use("/api/books", libRouter);

// error handling
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // render the error page
  res.status(err.status || 500);
  res.send(err);
});

module.exports = app;
