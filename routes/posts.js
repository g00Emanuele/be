const express = require("express");
const posts = express.Router();
const logger = require("../middleware/logger");
const validatePost = require("../middleware/validatePost");
const PostModel = require("../models/post");
const AuthorModel = require("../models/author");

//GET DI TUTTI I POST
posts.get("/posts", logger, async (req, res) => {
  try {
    const posts = await PostModel.find();
    res.status(200).send(posts);
  } catch (error) {
    res.status(500).send({
      statusCode: 500,
      message: "Errore interno del server",
    });
  }
});

//GET DEL POST CON ID ASSOCIATO
posts.get("/posts/byId/:postId", logger, async (req, res) => {
  const { postId } = req.params;
  try {
    const post = await PostModel.findById(postId);
    if (!post) {
      return res.status(404).send({
        statusCode: 404,
        message: "Post not found",
      });
    }
    res.status(200).send({
      statusCode: 200,
      post,
    });
  } catch (error) {
    res.status(500).send({
      statusCode: 500,
      message: "Errore interno del server",
    });
  }
});

//GET DEL POST TRAMITE TITOLO
posts.get("/posts/byTitle", async (req, res) => {
  const { title } = req.query;
  try {
    const postByTitle = await PostModel.find({
      title: {
        $regex: title,
        $options: "i",
      },
    });

    res.status(200).send(postByTitle);
  } catch (e) {
    res.status(500).send({
      statusCode: 500,
      message: "Errore interno del server",
    });
  }
});

//GET DEI POST DI UN SINGOLO AUTHOR


//POST DI UN BLOGPOST
posts.post("/posts/create", logger, validatePost, async (req, res) => {
  const newPost = new PostModel({
    title: req.body.title,
    category: req.body.category,
    cover: req.body.cover,
    readTime: {
      value: Number(req.body.readTime.value),
      unit: req.body.readTime.unit,
    },
    author: req.body.author,
    content: req.body.content,
  });
  try {
    const post = await newPost.save();
    res.status(201).send({
      statusCode: 201,
      message: "Post saved succesfully",
      payload: post,
    });
  } catch (error) {
    res.status(500).send({
      statusCode: 500,
      message: "Errore interno del server",
    });
  }
});

posts.patch("/posts/update/:postId", async (req, res) => {
  const { postId } = req.params;
  const postExist = await PostModel.findById(postId);
  if (!postExist) {
    return res.status(404).send({
      statusCode: 404,
      message: "This post doesn't exists",
    });
  }

  try {
    const dataToUpdate = req.body;
    const options = { new: true };
    const result = await PostModel.findByIdAndUpdate(
      postId,
      dataToUpdate,
      options
    );
    res.status(200).send({
      statusCode: 200,
      message: "Post edited succesfully",
      result,
    });
  } catch (error) {
    res.status(500).send({
      statusCode: 500,
      message: "Errore interno del server",
    });
  }
});

posts.delete("/posts/delete/:postId", async (req, res) => {
  const { postId } = req.params;

  try {
    const post = await PostModel.findByIdAndDelete(postId);
    if (!post) {
      return res.status(404).send({
        statusCode: 404,
        message: "This post doesn't exists or already deleted!",
      });
    }
    res.status(200).send({
      statusCode: 200,
      message: "Post deleted succesfully",
    });
  } catch (error) {
    res.status(500).send({
      statusCode: 500,
      message: "Errore interno del server",
    });
  }
});

module.exports = posts;
