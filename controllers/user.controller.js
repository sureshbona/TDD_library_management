"use strict";

const { User } = require("../models/user.model");

// check if user is allowed to a book
module.exports.checkSpaceAndUpdate = async (userId, bookId) => {
  try {
    const user = await User.findById(userId).exec();

    // check if user borrow limit and also borrow list
    if (user.borrowedBooks.length < 2 && !user.borrowedBooks.includes(bookId)) {
      user.borrowedBooks.push(bookId);
      await user.save();
      return true;
    }
  } catch (err) {
    return false;
  }
};

// check if user borrowed the mentioned book/books.
module.exports.checkAndRemove = async (userId, bookId) => {
  try {
    const user = await User.findById(userId).exec();

    // check if book exist in borrowlist
    var result = bookId.every((val) => user.borrowedBooks.includes(val));
    if (result) {
      user.borrowedBooks = user.borrowedBooks.filter(
        (el) => !bookId.includes(String(el))
      );
      await user.save();
      return true;
    }
  } catch (err) {
    return false;
  }
};
