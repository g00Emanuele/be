const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).send({
      errorType: "Token non presente",
      statusCode: 401,
      message: "Per poter accedere è necessario un token",
    });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.author = verified;

    next();
  } catch (error) {
    res.status(403).send({
      errorType: "Token error",
      statusCode: 403,
      message: "Token scaduto o non valido",
    });
  }
};
