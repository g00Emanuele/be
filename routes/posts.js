const express = require("express");
const posts = express.Router();
const logger = require("../middleware/logger");
const validatePost = require("../middleware/validatePost");
const PostModel = require("../models/post");
const CommentModel = require("../models/comment");
require("dotenv").config();
const multer = require("multer");
const crypto = require("crypto");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const cloudStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "myFiles",
    format: async (req, file) => "jpg",
    public_id: (req, file) => file.name,
  },
});

const internalStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    // posizione in cui salvare i file
    cb(null, "./public");
  },
  filename: (req, file, cb) => {
    // generiamo un suffisso unico per il nostro file
    const uniqueSuffix = `${Date.now()}-${crypto.randomUUID()}`;
    // qui ci recuperiamo da tutto solo l'estensione dello stesso file
    const fileExtension = file.originalname.split(".").pop();
    // eseguiamo la cb con il titolo completo
    cb(null, `${file.fieldname}-${uniqueSuffix}.${fileExtension}`);
  },
});

const upload = multer({ storage: internalStorage });
const cloudUpload = multer({ storage: cloudStorage });

//POST DELL'IMMAGINE DEL BLOGPOST CON CLOUDINARY
posts.post(
  "/posts/cloudUpload",
  cloudUpload.single("cover"),
  async (req, res) => {
    try {
      res.status(200).json({
        cover: req.file.path,
      });
    } catch (error) {
      res.status(500).send({
        statusCode: 500,
        message: "Errore interno del server",
      });
    }
  }
);

//POST DELL'IMMAGINE DEL BLOGPOST
posts.post("/posts/upload", upload.single("cover"), async (req, res) => {
  const url = `${req.protocol}://${req.get("host")}`; // http://localhost:5050

  console.log(req.file);

  try {
    const imgUrl = req.file.filename;
    res.status(200).json({ cover: `${url}/public/${imgUrl}` });
  } catch (e) {
    res.status(500).send({
      statusCode: 500,
      message: "Errore interno del server",
    });
  }
});

//GET DI TUTTI I POST
posts.get("/posts", logger, async (req, res) => {
  const { page = 1, pageSize = 4 } = req.query;

  try {
    const posts = await PostModel.find()
      .populate("author")
      .limit(pageSize)
      .skip((page - 1) * pageSize);

    const totalPosts = await PostModel.count();

    res.status(200).send({
      statusCode: 200,
      posts,
      currentPage: Number(page),
      totalPages: Math.ceil(totalPosts / pageSize),
      totalPosts,
    });
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

//COMMENTS

posts.get("/posts/:postId/comments", async (req, res) => {
  const { postId } = req.params;
  const postExist = await PostModel.findById(postId);
  if (!postExist) {
    return res.status(404).send({
      statusCode: 404,
      message: "This post does not exist!",
    });
  }
  try {
    const result = await CommentModel.find();
    res.status(200).send({
      statusCode: 200,
      message: "Comments loaded successfully",
      result,
    });
  } catch (error) {
    res.status(500).send({
      statusCode: 500,
      message: "Errore interno del server",
    });
  }
});

//GET DI UN COMMENTO SPECIFICO DI UN POST

posts.get("/posts/:postId/comments/:commentId", async (req, res) => {
  const { commentId } = req.params;
  const { postId } = req.params;
  const postExist = await PostModel.findById(postId);
  if (!postExist) {
    return res.status(404).send({
      statusCode: 404,
      message: "This post does not exist!",
    });
  }
  try {
    const result = await CommentModel.findById(commentId);
    res.status(200).send({
      statusCode: 200,
      message: "Comment loaded successfully",
      result,
    });
  } catch (error) {
    res.status(500).send({
      statusCode: 500,
      message: "Errore interno del server",
    });
  }
});

//POST DI UN COMMENTO SOTTO UN BLOGPOST

posts.post("/posts/:postId/comments/create", async (req, res) => {
  const { postId } = req.params;
  const postExist = await PostModel.findById(postId);
  if (!postExist) {
    return res.status(404).send({
      statusCode: 404,
      message: "This post does not exist!",
    });
  }
  const newComment = new CommentModel({
    post: req.body.post,
    author: req.body.author,
    comment: req.body.comment,
  });
  try {
    const comment = await newComment.save();
    res.status(201).send({
      statusCode: 201,
      message: "Comment saved succesfully",
      payload: comment,
    });
  } catch (error) {
    res.status(500).send({
      statusCode: 500,
      message: "Errore interno del server",
      error,
    });
  }
});

//MODIFICA DI UN COMMENTO

posts.patch("/posts/:postId/comments/:commentId/update", async (req, res) => {
  const { postId } = req.params;
  const { commentId } = req.params;
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
    const result = await CommentModel.findByIdAndUpdate(
      commentId,
      dataToUpdate,
      options
    );
    res.status(200).send({
      statusCode: 200,
      message: "Comment edited succesfully",
      result,
    });
  } catch (error) {
    res.status(500).send({
      statusCode: 500,
      message: "Errore interno del server",
    });
  }
});

//DELETE DI UN COMMENTO

posts.delete("/posts/:postId/comments/:commentId/delete", async (req, res) => {
  const { postId } = req.params;
  const { commentId } = req.params;
  const postExist = await PostModel.findById(postId);
  if (!postExist) {
    return res.status(404).send({
      statusCode: 404,
      message: "This post doesn't exists",
    });
  }
  try {
    const comment = await CommentModel.findByIdAndDelete(commentId);
    if (!comment) {
      return res.status(404).send({
        statusCode: 404,
        message: "This comment doesn't exists or already deleted!",
      });
    }
    res.status(200).send({
      statusCode: 200,
      message: "Comment deleted succesfully",
    });
  } catch (error) {
    res.status(500).send({
      statusCode: 500,
      message: "Errore interno del server",
    });
  }
});

//PATCH DELLA NUOVA COVER DI UN POST ESISTENTE CON CLOUDINARY

posts.patch(
  "/posts/:postId/coverUpdate",
  cloudUpload.single("cover"),
  async (req, res) => {
    const { postId } = req.params;
    const postExist = await PostModel.findById(postId);
    if (!postExist) {
      return res.status(404).send({
        statusCode: 404,
        message: "This post doesn't exists",
      });
    }
    try {
      const coverToUpdate = req.body;
      const options = { new: true };
      const result = await PostModel.findByIdAndUpdate(
        postId,
        coverToUpdate,
        options
      );
      res
        .status(201)
        // .json({
        //   cover: req.file.path,
        // })
        .send({
          statusCode: 200,
          message: "Post cover edited succesfully",
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

module.exports = posts;
