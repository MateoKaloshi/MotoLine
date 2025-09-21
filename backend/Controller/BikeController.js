const mongose = require('mongoose');
const Bike = require('../Models/BikesModel');
const express = require('express');

// CREATE BIKE
exports.createBike = async (req, res) => {
    try {
        const { brand, model, production_year, engine, description, price, location } = req.body;   
        if (!brand || !model || !production_year || !engine || !user_id || !image_ids || image_ids.length === 0 || !price || !location) {
            return res.status(400).json({ message: "All required fields must be provided" });
        }
        const user_id = req.user.id;
        const newBike = new Bike({
            brand,
            model,
            production_year,
            engine,
            user_id,
            description,
            price,
            location
        });
        const savedBike = await newBike.save();
        res.status(201).json(savedBike);
    } catch (err) {
        console.error("Create bike error:", err);
        res.status(500).json({ message: err.message });
    }
};

// GET ALL BIKES
const getAllBikes = async (req, res) => {
  try {
    const bikes = await Bike.find().populate("images"); // or .populate("image_id") if single

    // transform image paths into URLs
    const bikesWithImages = bikes.map(bike => ({
      ...bike.toObject(),
      images: bike.images?.map(img => ({
        _id: img._id,
        url: `${req.protocol}://${req.get("host")}/uploads/${img.path.split("/").pop()}`
      }))
    }));

    res.status(200).json(bikesWithImages);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// GET BIKE BY ID
const getBikeById = async (req, res) => {
  try {
    const bike = await Bike.findById(req.params.id).populate("images");
    if (!bike) {
      return res.status(404).json({ message: "Bike not found" });
    }
    const bikeWithImages = {
      ...bike.toObject(),
      images: bike.images?.map(img => ({
        _id: img._id,
        url: `${req.protocol}://${req.get("host")}/uploads/${img.path.split("/").pop()}`
      }))
    };
    res.status(200).json(bikeWithImages);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// UPDATE BIKE
const updateBike = async (req, res) => {
  try {
    const bike = await Bike.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true } // return updated document
    ).populate("images");

    if (!bike) {
      return res.status(404).json({ message: "Bike not found" });
    }

    // build response with map
    const bikeWithImages = {
      ...bike.toObject(),
      images: bike.images?.map(img => ({
        _id: img._id,
        url: `${req.protocol}://${req.get("host")}/uploads/${img.path.split("/").pop()}`
      }))
    };

    res.status(200).json(bikeWithImages);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// DELETE BIKE
const deleteBike = async (req, res) => {
  try {
    const bike = await Bike.findByIdAndDelete(req.params.id);
    if (!bike) {
      return res.status(404).json({ message: "Bike not found" });
    }   
    res.status(200).json({ message: "Bike deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
