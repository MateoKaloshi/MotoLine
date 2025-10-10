const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    last_name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      match: [/.+@.+\..+/, "Please provide a valid email address"],
    },
    phone: {
      type: String,
      required: false,
      maxlength: 30,
    },

    subject: { type: String, require: true ,trim: true, maxlength: 200 },
    message: { type: String, required: true, trim: true },

    status: {
      type: String,
      enum: ["new", "open", "resolved", "closed"],
      default: "new",
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Contact", contactSchema);
