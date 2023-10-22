const express = require("express");
const login = express.Router();
const bcrypt = require("bcrypt");
const AuthorModel = require("../models/author");
const jwt = require("jsonwebtoken");
require("dotenv").config();

login.post("/login", async (req, res) => {
  const author = await AuthorModel.findOne({ email: req.body.email });
  if (!author) {
    return res.status(404).send({
      message: "L'utente non esiste",
      statusCode: 404,
    });
  }

  const validPassword = await bcrypt.compare(
    req.body.password,
    author.password
  );

  if (!validPassword) {
    return res.status(400).send({
      message: "Email o password errati",
      statusCode: 400,
    });
  }

  const token = jwt.sign(
    {
      id: author._id,
      name: author.name,
      surname: author.surname,
      email: author.email,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "24h",
    }
  );

  res.header("Authorization", token).status(200).send({
    message: "Login effettuato con successo",
    statusCode: 200,
    token,
  });

  console.log(token)
});

module.exports = login;
