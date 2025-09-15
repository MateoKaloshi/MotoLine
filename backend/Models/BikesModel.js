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
    },
    engine: {
        type: String,
        required: true
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    published: {
        type: Date,
        default: Date.now
    },
    image_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Image",
        required: true
    },
    description: {
        type: String,
    },
    price: {
        type: Number,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    is_sold: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model("Bike", bikesSchema);