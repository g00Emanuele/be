const express = require("express");
const authors = express.Router();
const AuthorModel = require("../models/author");
const validateAuthor = require("../middleware/validateAuthor");
require("dotenv").config();
const multer = require("multer");
const crypto = require("crypto");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const bcrypt = require('bcrypt')

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const cloudStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "myAuthorFiles",
    format: async (req, file) => "jpg",
    public_id: (req, file) => file.name,
  },
});

const cloudUpload = multer({ storage: cloudStorage });

authors.post(
  "/authors/cloudUpload",
  cloudUpload.single("avatar"),
  async (req, res) => {
    try {
      res.status(200).json({
        avatar: req.file.path,
      });
    } catch (error) {
      res.status(500).send({
        statusCode: 500,
        message: "Errore interno del server",
      });
    }
  }
);

authors.patch(
  "/authors/:authorId/avatarUpdate",
  cloudUpload.single("avatar"),
  async (req, res) => {
    const { authorId } = req.params;
    const authorExist = await AuthorModel.findById(authorId);
    if (!authorExist) {
      return res.status(404).send({
        statusCode: 404,
        message: "This author doesn't exists",
      });
    }
    try {
      const avatarToUpdate = req.body;
      const options = { new: true };
      const result = await AuthorModel.findByIdAndUpdate(
        authorId,
        avatarToUpdate,
        options
      );
      res
        .status(201)
        // .json({
        //   cover: req.file.path,
        // })
        .send({
          statusCode: 200,
          message: "Author avatar edited succesfully",
          result,
        });
    } catch (error) {
      res.status(500).send({
        statusCode: 500,
        message: "Errore interno del server",
      });
    }
  }
);

authors.get("/authors", async (req, res) => {
  try {
    const authors = await AuthorModel.find();
    res.status(200).send({
      statusCode: 200,
      authors,
    });
  } catch (error) {
    res.status(500).send({
      statusCode: 500,
      message: "Errore interno del server",
    });
  }
});

authors.get("/authors/byId/:authorId", async (req, res) => {
  const { authorId } = req.params;

  try {
    const author = await AuthorModel.findById(authorId);
    if (!author) {
      return res.status(404).send({
        statusCode: 404,
        message: "This author doesn't exists",
      });
    }
    res.status(200).send({
      statusCode: 200,
      author,
    });
  } catch (error) {
    res.status(500).send({
      statusCode: 500,
      message: "Errore interno del server",
    });
  }
});



authors.post("/authors/create", validateAuthor, async (req, res) => {

  const salt = await bcrypt.genSalt(10)
  const newAuthor = new AuthorModel({
    name: req.body.name,
    surname: req.body.surname,
    email: req.body.email,
    birthday: req.body.birthday,
    avatar: req.body.avatar,
  });
  try {
    const author = await newAuthor.save();
    res.status(201).send({
      statusCode: 201,
      message: "Author created succesfully",
      payload: author,
    });
  } catch (error) {
    res.status(500).send({
      statusCode: 500,
      message: "Errore interno del server",
    });
  }
});

authors.patch("/authors/update/:authorId", async (req, res) => {
  const { authorId } = req.params;
  const authorExist = await AuthorModel.findById(authorId);
  if (!authorExist) {
    return res.status(404).send({
      statusCode: 404,
      message: "This author doesn't exists",
    });
  }

  try {
    const dataToUpdate = req.body;
    const options = { new: true };
    const result = await AuthorModel.findByIdAndUpdate(
      authorId,
      dataToUpdate,
      options
    );
    res.status(200).send({
      statusCode: 200,
      message: "Author edited succesfully",
      result,
    });
  } catch (error) {
    res.status(500).send({
      statusCode: 500,
      message: "Errore interno del server",
    });
  }
});

authors.delete("/authors/delete/:authorId", async (req, res) => {
  const { authorId } = req.params;

  try {
    const author = await AuthorModel.findByIdAndDelete(authorId);
    if (!author) {
      return res.status(404).send({
        statusCode: 404,
        message: "This author doesn't exists or already deleted!",
      });
    }
    res.status(200).send({
      statusCode: 200,
      message: "author deleted succesfully",
    });
  } catch (error) {
    res.status(500).send({
      statusCode: 500,
      message: "Errore interno del server",
    });
  }
});

module.exports = authors;
