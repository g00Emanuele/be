const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      default: "General",
    },
    cover: {
      type: String,
      required: false,
      default:
        "https://www.google.com/url?sa=i&url=https%3A%2F%2Funsplash.com%2Fs%2Fphotos%2Fblank&psig=AOvVaw17-o7WjNGouXpF_y9zM6yF&ust=1696196129775000&source=images&cd=vfe&opi=89978449&ved=0CBEQjRxqFwoTCNCy4pCl04EDFQAAAAAdAAAAABAR",
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    rate: {
      type: Number,
      required: false,
    },
    author: {
      type: String,
      required: true,
    },
  },
  { timestamps: true, strict: true }
);

module.exports = mongoose.model("postModel", PostSchema, "posts");
