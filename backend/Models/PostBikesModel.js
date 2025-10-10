const mongoose = require("mongoose");

const postBikesSchema = new mongoose.Schema({
  brand: {
    type: String,
    required: true,
  },
  model: {
    type: String,
    required: true,
  },
  production_year: {
    type: Date,
    required: true,
  },
  engine: {
    type: String,
    required: true,
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  published: {
    type: Date,
    default: Date.now,
  },
  description: {
    type: String,
  },
  price: {
    type: Number,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  is_sold: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("PostBike", postBikesSchema);
