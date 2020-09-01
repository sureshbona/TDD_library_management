"use strict";

const { Book } = require("../models/book.model");
const { User } = require("../models/user.model");
const request = require("supertest");
const expect = require("chai").expect;
const app = require("../app");

// delete existing data before testing each case
describe("Library Management Test", () => {
  beforeEach(async () => {
    await Book.deleteMany({});
    await User.deleteMany({});
  });

  describe("User can view books in library", () => {
    it("Given, there are no books in the library. When, I view the books in the library. Then, I see an empty library", async () => {
      const res = await request(app).get("/api/books/available-books");
      expect(res.status).to.equal(200);
      expect(res.body.length).to.equal(0);
    });

    it("Given, there are books in the library. When, I view the books in the library. Then, I see the list of books in the library.", async () => {
      const books = [
        { title: "book1", author: "author1", copy: 5 },
        { title: "book2", author: "author2", copy: 2 },
        { title: "book3", author: "author3", copy: 1 },
      ];
      await Book.insertMany(books);
      // console.log(books);
      const res = await request(app).get("/api/books/available-books");
      expect(res.status).to.equal(200);
      expect(res.body.length).to.equal(3);
    });
  });

  describe("User can borrow a book from the library", () => {
    it("Given, there are books in the library. When, I choose a book to add to my borrowed list. Then, the book is added to my borrowed list. And, the book is removed from the library.", async () => {
      const user = await User.create({ name: "user1" });

      const books = [
        { title: "book1", author: "author1", copy: 5 },
        { title: "book2", author: "author2", copy: 2 },
        { title: "book3", author: "author3", copy: 3 },
      ];
      const storedBooks = await Book.insertMany(books);
      const bookToBorrow = storedBooks[0];

      const res = await request(app).post("/api/books/borrowBook").send({
        user_id: user._id,
        book_id: bookToBorrow._id,
      });

      //check updates after request
      const user_test = await User.findById(user._id);
      const book_test = await Book.findById(bookToBorrow._id);

      expect(res.status).to.equal(200);
      expect(user_test.borrowedBooks).to.include(bookToBorrow._id);
      expect(book_test.copy).to.equal(bookToBorrow.copy - 1);
    });
  });

  describe("User can borrow a copy of a book from the library", () => {
    it("Given, there are more than one copy of a book in the library. When, I choose a book to add to my borrowed list. Then, one copy of the book is added to my borrowed list. And, the library has at least one copy of the book left.", async () => {
      const user = await User.create({ name: "user1" });

      const books = [
        { title: "book1", author: "author1", copy: 5 },
        { title: "book2", author: "author2", copy: 2 },
        { title: "book3", author: "author3", copy: 2 },
      ];
      const storedBooks = await Book.insertMany(books);
      const bookToBorrow = storedBooks[0];

      const res = await request(app).post("/api/books/borrowBook").send({
        user_id: user._id,
        book_id: bookToBorrow._id,
      });

      //check updates after request
      const user_test = await User.findById(user._id);
      const book_test = await Book.findById(bookToBorrow._id);

      expect(res.status).to.equal(200);
      expect(user_test.borrowedBooks).to.includes(bookToBorrow._id);
      expect(book_test.copy).to.least(1);
    });

    it("Given, there is only one copy of a book in the library. When, I choose a book to add to my borrowed list. Then, one copy of the book is added to my borrowed list. And, the book is removed from the library", async () => {
      const user = await User.create({ name: "user1" });

      // book to borrow by a user
      const books = [
        { title: "book1", author: "author1", copy: 1 },
        { title: "book2", author: "author2", copy: 1 },
        { title: "book3", author: "author3", copy: 1 },
      ];
      const storedBooks = await Book.insertMany(books);
      const bookToBorrow = storedBooks[0];

      const res = await request(app).post("/api/books/borrowBook").send({
        user_id: user._id,
        book_id: bookToBorrow._id,
      });

      //check updates after request
      const user_test = await User.findById(user._id);
      const book_test = await Book.findById(bookToBorrow._id);

      expect(res.status).to.equal(200);
      expect(user_test.borrowedBooks).to.include(bookToBorrow._id);
      expect(book_test.copy).to.equal(0);
    });
  });

  describe("User can return books to the library", () => {
    it("Given, I have 2 books in my borrowed list. When, I return one book to the library. Then, the book is removed from my borrowed list. And, the library reflects the updated stock of the book.", async () => {
      // adding books to the library
      const books = [
        { title: "book1", author: "author1", copy: 2 },
        { title: "book2", author: "author2", copy: 3 },
        { title: "book3", author: "author3", copy: 1 },
      ];
      const storedBooks = await Book.insertMany(books);
      const book1 = storedBooks[0];
      const book2 = storedBooks[1];

      // adding a user having two books in his borrow list
      const userData = {
        name: "user1",
        borrowedBooks: [book1._id, book2._id],
      };
      const user = await User.create(userData);

      const res = await request(app).post("/api/books/returnBook").send({
        user_id: user._id,
        book_id: book1._id,
      });

      //check updates after request
      const user_test = await User.findById(user._id);
      const book_test = await Book.findById(book1._id);

      expect(res.status).to.equal(200);
      expect(user_test.borrowedBooks).to.not.include(book1._id);
      expect(book_test.copy).to.equal(book1.copy + 1);
    });

    it("Given, I have 2 books in my borrowed list. When, I return both books to the library. Then, my borrowed list is empty. And, the library reflects the updated stock of the books.", async () => {
      // adding books to the library
      const books = [
        { title: "book1", author: "author1", copy: 1 },
        { title: "book2", author: "author2", copy: 1 },
        { title: "book3", author: "author3", copy: 1 },
      ];
      const storedBooks = await Book.insertMany(books);
      const book1 = storedBooks[0];
      const book2 = storedBooks[1];

      // add a user to user data
      const userData = {
        name: "user1",
        borrowedBooks: [book1._id, book2._id],
      };
      const user = await User.create(userData);

      const res = await request(app).post("/api/books/returnBooks").send({
        user_id: user._id,
        book1_id: book1._id,
        book2_id: book2._id,
      });

      //check updates after request
      const user_test = await User.findById(user._id);
      const book1_test = await Book.findById(book1._id);
      const book2_test = await Book.findById(book1._id);

      expect(res.status).to.equal(200);
      expect(user_test.borrowedBooks).to.not.have.members([
        book1._id,
        book2._id,
      ]);
      expect(book1_test.copy).to.equal(book1.copy + 1);
      expect(book2_test.copy).to.equal(book1.copy + 1);
    });
  });
});
