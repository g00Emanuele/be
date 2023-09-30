const express = require("express");
const posts = express.Router();
const PostModel = require("../models/post");

posts.get("/posts", async (req, res) => {
  try {
    const posts = await PostModel.find();
    res.status(200).send({
      statusCode: 200,
      posts,
    });
  } catch (error) {
    res.status(500).send({
      statusCode: 500,
      message: "Errore interno del server",
    });
  }
});

posts.post("/posts", async (req, res) => {
  const newPost = new PostModel({
    title: req.body.title,
    category: req.body.category,
    cover: req.body.cover,
    price: Number(req.body.price),
    rate: Number(req.body.rate),
    author: req.body.author,
  });
  try {
    const post = await newPost.save();
    res.status(200).send({
      statusCode: 200,
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

posts.patch("/posts/:postId", async (req, res) => {
  const { postId } = req.params;
  const postExist = await PostModel.findById(postId);
  if (!postExist) {
    return res.status(404).send({
      statusCode: 404,
      message: "This post doesn't exists",
    });
  }
});
module.exports = posts;
