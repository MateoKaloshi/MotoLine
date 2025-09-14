const mongoose = require("mongoose");

const bikesSchema = new mongoose.Schema({
    brand: {
        type: String,
        required: true
    },
    model: {
        type: String,
        required: true
    },
    production_year: {
        type: Number,
        required: true
    }
)};