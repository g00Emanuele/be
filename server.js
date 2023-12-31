const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authorsRoute = require("./routes/authors");
const postsRoute = require("./routes/posts");
const emailRoute = require("./routes/sendEmail");
const loginRoute = require("./routes/login");
const githubRoute = require("./routes/github");
const path = require("path");
require("dotenv").config();
const PORT = 5050;

const app = express();

app.use("/public", express.static(path.join(__dirname, "public")));

//cors collega frontend e backend
app.use(cors());
//middleware parser json
app.use(express.json());

//routes
app.use("/", authorsRoute);
app.use("/", postsRoute);
app.use("/", emailRoute);
app.use("/", loginRoute);
app.use("/", githubRoute);
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
