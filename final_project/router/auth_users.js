const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [{
  "username": "Oluwaseun",
  "password": "123456789"
}];

const isValid = (username) => { 
  let userswithsamename = users.filter((user) => {
    return user.username === username;
  });
  return userswithsamename.length > 0;
}

const authenticatedUser = (username, password) => { 
  let validusers = users.filter((user) => {
    return (user.username === username && user.password === password);
  });
  return validusers.length > 0;
}

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'No token provided' });

  jwt.verify(token, 'access', (err, user) => {
    if (err) return res.status(403).json({ message: 'Failed to authenticate token' });
    req.user = user;
    next();
  });
}

// Only registered users can login
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(404).json({ message: "Error logging in" });
  }

  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign({ username: username }, 'access', { expiresIn: '1h' });

    req.session.authorization = {
      accessToken, username
    };
    return res.status(200).json({ 
      message: "User successfully logged in",
      token: accessToken,
      username: username 
    });
  } else {
    return res.status(208).json({ message: "Invalid Login. Check username and password" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", verifyToken, (req, res) => {
  const isbn = req.params.isbn;
  const { review } = req.body;
  const reviewer = req.user.username;

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  const reviewId = new Date().getTime();
  books[isbn].reviews[reviewId] = { reviewer, review };
  return res.status(200).json({ message: "Review added successfully", data: books[isbn].reviews });
});

// Update a book review
regd_users.put("/auth/review/:isbn/:reviewId", verifyToken, (req, res) => {
  const isbn = req.params.isbn;
  const reviewId = req.params.reviewId;
  const { review } = req.body;
  const username = req.user.username;

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  const book = books[isbn];

  if (!book.reviews[reviewId]) {
    return res.status(404).json({ message: "Review not found" });
  }

  if (book.reviews[reviewId].reviewer !== username) {
    return res.status(403).json({ message: "You can only update your own reviews" });
  }

  book.reviews[reviewId].review = review;
  return res.status(200).json({ message: "Review updated successfully", data: book.reviews });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn/:reviewId", verifyToken, (req, res) => {
  const isbn = req.params.isbn;
  const reviewId = req.params.reviewId;
  const username = req.user.username;

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  const book = books[isbn];

  if (!book.reviews[reviewId]) {
    return res.status(404).json({ message: "Review not found" });
  }

  if (book.reviews[reviewId].reviewer !== username) {
    return res.status(403).json({ message: "You can only delete your own reviews" });
  }

  delete book.reviews[reviewId];
  return res.status(200).json({ message: "Review deleted successfully", data: book.reviews });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
