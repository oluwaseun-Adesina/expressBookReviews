const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    try {
        // Check if both username and password are provided
        if (username && password) {
            // Check if the user does not already exist
            if (!isValid(username)) {
                // Add the new user to the users array
                users.push({ "username": username, "password": password });
                return res.status(200).json({ message: "User successfully registered. Now you can login" });
            } else {
                return res.status(409).json({ message: "User already exists!" });
            }
        }
        // Return error if username or password is missing
        return res.status(400).json({ message: "Unable to register user." });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

// Get the book list available in the shop
public_users.get('/', async (req, res) => {
    try {
        return res.status(200).json({ message: "All Books", data: books });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async (req, res) => {
    const isbn = req.params.isbn;
    const book = books[isbn];

    try {
        if (book) {
            return res.status(200).json({ message: `Book with ISBN ${isbn}:`, data: book });
        } else {
            return res.status(404).json({ message: "Book not found" });
        }
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

// Get book details based on author
public_users.get('/author/:author', async (req, res) => {
    const author = req.params.author;
    const bookList = Object.values(books).filter(book => book.author.toLowerCase() === author.toLowerCase());

    try {
        if (bookList.length > 0) {
            return res.status(200).json({ message: `Books by ${author}:`, data: bookList });
        } else {
            return res.status(404).json({ message: "Books by this author not found" });
        }
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

// Get all books based on title
public_users.get('/title/:title', async (req, res) => {
    const title = req.params.title;
    const bookList = Object.values(books).filter(book => book.title.toLowerCase() === title.toLowerCase());

    try {
        if (bookList.length > 0) {
            return res.status(200).json({ message: "Books with the title", data: bookList });
        } else {
            return res.status(404).json({ message: "Books with this title not found" });
        }
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

// Get book review
public_users.get('/review/:isbn', async (req, res) => {
    const isbn = req.params.isbn;
    const book = books[isbn];

    try {
        if (book) {
            return res.status(200).json({ message: `Reviews for book with ISBN ${isbn}:`, data: book.reviews });
        } else {
            return res.status(404).json({ message: "Book not found" });
        }
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

module.exports.general = public_users;
