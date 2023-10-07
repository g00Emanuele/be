const validatePost = (req, res, next) => {
  const errors = [];
  const { title, category, cover, author, readTime } = req.body;
  if (typeof title !== "string") {
    errors.push("Title must be a string");
  }
  if (typeof category !== "string") {
    errors.push("Category must be a string");
  }
  if (typeof cover !== "string") {
    errors.push("Cover must be a string");
  }
  if (typeof author.name !== "string") {
    errors.push("Author must be a string");
  }
  if (typeof author.avatar !== "string") {
    errors.push("Author must be a string");
  }
  if (typeof readTime.value !== "number") {
    errors.push("Author must be a string");
  }
  if (typeof readTime.unit !== "string") {
    errors.push("Author must be a string");
  }
  if (errors.length > 0) {
    res.status(400).send({ errors });
  } else {
    next();
  }
};

module.exports = validatePost
