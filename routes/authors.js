const express = require("express");
const authors = express.Router();

authors.get("/authors", (req, res) => {
  res.send({
    author: "Emanuele",
    job: "student",
  });
});

authors.get("/authors/:id", (req, res) => {
  res.send({
    author: "Marco",
    job: "student",
  });
});

authors.post("/authors", (req, res) => {
    res.send({
      author: "Marco",
      job: "student",
    });
  });


module.exports = authors;
