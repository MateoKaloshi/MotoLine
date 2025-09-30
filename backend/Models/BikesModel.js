const e = require("express");
const mongose = require("mongoose");

const bikesSchema = new mongose.Schema({
    brand: {
        type: String,
        required: true
    },
    model: {
        type: String,
        required: true,
    },
    engine: {
        type: String,
        required: true
    },
});

module.exports = mongose.model("Bike", bikesSchema);