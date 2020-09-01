"use strict";

const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  copy: {
    type: Number,
    default: 1,
  },
});

module.exports.Book = mongoose.model("Book", bookSchema);
