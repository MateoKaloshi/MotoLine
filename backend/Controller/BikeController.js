const mongoose = require('mongoose');
const path = require("path");
const PostBike = require('../Models/PostBikesModel'); 
const Bike = require('../Models/BikesModel');      
const Image = require('../Models/ImagesModel'); 

// CREATE BIKE
const createBike = async (req, res) => {
  try {
    const { brand, model, production_year, engine, description, price, location, is_sold } = req.body;

    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    if (!brand || !model || !production_year || !engine || !price || !location) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    const user_id = req.user._id;

    const newBike = new PostBike({
      brand,
      model,
      production_year,
      engine,
      description,
      price,
      location,
      user_id,
      is_sold
    });

    const savedBike = await newBike.save();
    res.status(201).json(savedBike);
  } catch (err) {
    console.error('Create bike error:', err);
    res.status(500).json({ message: err.message });
  }
};

// GET ALL BIKES
const getAllBikes = async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const bikes = await PostBike.find({})
      .sort({ published: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const bikeIds = bikes.map(b => b._id);

    const images = await Image.find({ bike_id: { $in: bikeIds } }).lean();

    const imagesByBike = images.reduce((acc, img) => {
      const key = String(img.bike_id);
      acc[key] = acc[key] || [];
      const url = img.url || `${req.protocol}://${req.get('host')}/uploads/${(img.path || '').split(/[\\/]/).pop()}`;
      acc[key].push({ _id: img._id, url, path: img.path, mimeType: img.mimeType });
      return acc;
    }, {});

    const bikesWithImages = bikes.map(bike => {
      const key = String(bike._id);
      const imgs = imagesByBike[key] || [];
      return {
        ...bike,
        images: imgs,
        firstImageUrl: imgs.length > 0 ? imgs[0].url : null
      };
    });

    const total = await PostBike.countDocuments({});
    res.status(200).json({
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
      bikes: bikesWithImages
    });
  } catch (err) {
    console.error('getAllBikes error:', err);
    res.status(500).json({ message: 'Server error', error: { message: err.message } });
  }
};

// GET BIKE BY ID
const getBikeById = async (req, res) => {
  try {
    const bike = await PostBike.findById(req.params.id)
      .populate("user_id", "first_name last_name phone_number adress email")
      .lean();

    if (!bike) {
      return res.status(404).json({ message: "Bike not found" });
    }

    
    return res.status(200).json(bike);
  } catch (error) {
    console.error("getBikeById error:", error);
    return res.status(500).json({
      message: "Server error",
      error: { message: error.message, path: error.path || null },
    });
  }
};

// UPDATE BIKE
const updateBike = async (req, res) => {
  try {
    const bike = await PostBike.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate("images");

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

// DELETE BIKE
const deleteBike = async (req, res) => {
  try {
    const bike = await PostBike.findByIdAndDelete(req.params.id);
    if (!bike) {
      return res.status(404).json({ message: "Bike not found" });
    }   
    res.status(200).json({ message: "Bike deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

const getModel = async (req, res) => {
  try {
    const { brand } = req.query;
    if (!brand) return res.status(400).json({ message: "brand query param required" });

    const models = await Bike.find({ brand }).distinct("model");
    models.sort((a, b) => a.localeCompare(b));

    res.json({ models });
  } catch (err) {
    console.error("GET /api/bikes/models error", err);
    res.status(500).json({ message: "Failed to fetch models" });
  }
};

const getEngine = async (req, res) => {
  try {
    const { brand, model } = req.query;
    if (!brand || !model) return res.status(400).json({ message: 'brand and model query params required' });

    const engines = await Bike.find({ brand, model }).distinct('engine');
    engines.sort((a, b) => a.localeCompare(b));
    res.json({ engines });
  } catch (err) {
    console.error('GET /api/modelbikes/engines error', err);
    res.status(500).json({ message: 'Failed to fetch engines' });
  }
};

module.exports = {
  createBike,
  getAllBikes,
  getBikeById,
  updateBike,
  deleteBike,
  getModel,
  getEngine
};
