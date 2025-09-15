const mongoose = require("mongoose");

const imagesSchema = new mongoose.Schema({
    url: {
        type: String,
        required: true
    },
    bike_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Bike",
        required: true
    },
    path: {
        type: String,
        required: true
    },
    mimeType: {
        type: String,
    }
});

module.exports = mongoose.model("Image", imagesSchema);
