"use strict";

const express = require("express");
const router = express.Router();
const controller = require("../controllers/book.controller");

router.route("/available-books").get(controller.getAllBooks);

router.route("/borrowBook").post(controller.borrowBook);

router.route("/returnBook").post(controller.returnBook);

router.route("/returnBooks").post(controller.returnBooks);

module.exports = router;
