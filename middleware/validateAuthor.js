const validateAuthor = (req, res, next) => {
  const errors = [];
  const { name, surname, email, birthday, avatar } = req.body;
  if (typeof name !== "string") {
    errors.push("Name must be a string");
  }
  if (typeof surname !== "string") {
    errors.push("Surname must be a string");
  }
  if (typeof email !== "string") {
    errors.push("Email must be a string");
  }
  if (typeof birthday !== "string") {
    errors.push("Birthday must be a string");
  }
  if (typeof avatar !== "string") {
    errors.push("Avatar must be a string");
  }
  if (errors.length > 0) {
    res.status(400).send({ errors });
  } else {
    next();
  }
};

module.exports = validateAuthor;
