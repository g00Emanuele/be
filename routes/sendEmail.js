const express = require("express");
const { createTransport } = require("nodemailer");
const email = express.Router();

const transporter = createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  auth: {
    user: "tate.wilderman57@ethereal.email",
    pass: "BkTw6mqpsZr8r6TNax",
  },
});

email.post("/send-email", async (req, res) => {
  const { subject, text } = req.body;
  const mailOptions = {
    from: "g00emanuele@gmail.com",
    to: "tate.wilderman57@ethereal.email",
    subject,
    text,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
      res.status(500).send("Errore invio email");
    } else {
      console.log("Email inviata con successo");
      res.status(200).send({
        message: "Email inviata correttamente",
        mailOptions,
      });
    }
  });
});

module.exports = email;
