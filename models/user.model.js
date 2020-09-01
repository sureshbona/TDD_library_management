"use strict";

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  borrowedBooks: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Book",
    default: [],
  },
});

module.exports.User = mongoose.model("User", userSchema);
