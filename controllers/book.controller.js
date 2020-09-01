"use strict";

const mongoose = require("mongoose");
const { Book } = require("../models/book.model");
const UserController = require("./user.controller");

// provide available books to borrow
module.exports.getAllBooks = async (req, res) => {
  let books = await Book.find({ copy: { $gte: 1 } });
  return res.json(books);
};

// book borrow
module.exports.borrowBook = async (req, res) => {
  let checkUserSpace = await UserController.checkSpaceAndUpdate(
    req.body.user_id,
    req.body.book_id
  );

  try {
    if (checkUserSpace === true) {
      const book = await Book.findByIdAndUpdate(
        req.body.book_id,
        { $inc: { copy: -1 } },
        { new: true }
      ).exec();
      res.status(200).json({ message: "successfully updated" });
    } else {
      res.status(400).json({
        error:
          "either borrow limit over or this book already exist in your borrow list",
      });
    }
  } catch (err) {
    res.status(400).json({ error: "erro while borrowing book" });
  }
};

// user returns only one book
module.exports.returnBook = async (req, res) => {
  const bookId = [req.body.book_id];
  const removeAndUpdateUser = await UserController.checkAndRemove(
    req.body.user_id,
    bookId
  );

  try {
    if (removeAndUpdateUser === true) {
      const book = await Book.findByIdAndUpdate(
        req.body.book_id,
        { $inc: { copy: 1 } },
        { new: true }
      ).exec();
      res.status(200).json({ message: "successfully updated" });
    } else {
      res
        .status(400)
        .json({ error: "book is not borrowed from this library." });
    }
  } catch (err) {
    res.status(400).json({ error: "erro while return the book" });
  }
};

// user returns both the books
module.exports.returnBooks = async (req, res) => {
  const bookIds = [req.body.book1_id, req.body.book2_id];
  const removeAndUpdateUser_book1 = await UserController.checkAndRemove(
    req.body.user_id,
    bookIds
  );

  try {
    if (removeAndUpdateUser_book1 === true) {
      await Book.updateMany(
        { _id: { $in: bookIds } },
        { $inc: { copy: 1 } },
        { new: true }
      ).exec();

      let books = await Book.find({ _id: { $in: bookIds } });

      res.status(200).json({ message: "successfully updated" });
    } else {
      res.status(400).json({
        message: "one of the book is not borrowed from this library.",
      });
    }
  } catch (err) {
    res.status(400).json({ error: "error in book stock update" });
  }
};
