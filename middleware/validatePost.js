const validatePost = (req, res, next) => {
  const errors = [];
  const { title, category, cover, author, readTime } = req.body;
  if (typeof title !== "string") {
    errors.push("Title must be a string");
  }
  if (typeof category !== "string" && category) {
    errors.push("Category must be a string");
  }
  if (typeof cover !== "string" && cover) {
    errors.push("Cover must be a string");
  }
  if (typeof author.name !== "string") {
    errors.push("Author name must be a string");
  }
  if (typeof author.avatar !== "string" && author.avatar) {
    errors.push("Author avatar must be a string");
  }
  if (typeof readTime.value !== "number") {
    errors.push("readTime value must be a number");
  }
  if (typeof readTime.unit !== "string" && readTime.unit) {
    errors.push("readTime unit must be a string");
  }
  if (errors.length > 0) {
    res.status(400).send({ errors });
  } else {
    next();
  }
};

module.exports = validatePost
