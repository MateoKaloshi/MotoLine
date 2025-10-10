// controllers/contactController.js
const Contact = require("../Models/ContactModel");

const post = async (req, res) => {
  try {
    let { name, last_name, email, phone, subject, message } = req.body || {};

    name = typeof name === "string" ? name.trim() : undefined;
    last_name = typeof last_name === "string" ? name.trim() : undefined;
    email = typeof email === "string" ? email.trim().toLowerCase() : undefined;
    phone = typeof phone === "string" ? phone.trim() : undefined;
    subject = typeof subject === "string" ? subject.trim() : undefined;
    message = typeof message === "string" ? message.trim() : undefined;

    if (!message)
      return res.status(400).json({ message: "Message is required." });

    const payload = {
      name,
      last_name,
      email,
      phone,
      subject,
      message,
    };

    const contact = await Contact.create(payload);
    return res.status(201).json(contact);
  } catch (err) {
    console.error("Contact POST error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = { post };
