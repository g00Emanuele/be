const express = require("express");
const mongoose = require("mongoose");
const authorsRoute = require("./routes/authors");
const postsRoute = require("./routes/posts");
require("dotenv").config();
const PORT = 5050;

const app = express();

//middleware parser json
app.use(express.json());

//routes
app.use("/", authorsRoute);
app.use("/", postsRoute);

//http://localhost:5050/
/*app.get("/", (req, res) => {
  res.status(200).send({
    author: "Emanuele",
    job: "WebDev",
  });
});*/

mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "Error during db connection"));
db.once("open", () => {
  console.log("Database succesfully connected!");
});

app.listen(PORT, () => console.log(`Server up and running on port ${PORT}`));
