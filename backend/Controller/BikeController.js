const mongoose = require("mongoose");
const path = require("path");
const PostBike = require("../Models/PostBikesModel");
const Bike = require("../Models/BikesModel");
const Image = require("../Models/ImagesModel");
const Sold = require("../Models/SoldModel");
const fs = require("fs");

function normalizeImages(images = [], req) {
  const hostPrefix = `${req.protocol}://${req.get("host")}`;
  return images.map((img) => {
    const url =
      img.url ||
      `${hostPrefix}/uploads/${(img.path || img.filename || "")
        .split(/[\\/]/)
        .pop()}`;
    return {
      _id: img._id,
      url,
      path: img.path,
      mimeType: img.mimeType,
      filename: img.filename || null,
    };
  });
}

/** CREATE BIKE */
const createBike = async (req, res) => {
  try {
    const {
      brand,
      model,
      production_year,
      engine,
      description,
      price,
      location,
    } = req.body;

    const isSoldFlag =
      req.body.isSold !== undefined
        ? Boolean(req.body.isSold)
        : req.body.is_sold !== undefined
        ? Boolean(req.body.is_sold)
        : false;

    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Authentication required" });
    }
    if (
      !brand ||
      !model ||
      !production_year ||
      !engine ||
      !price ||
      !location
    ) {
      return res
        .status(400)
        .json({ message: "All required fields must be provided" });
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
      isSold: isSoldFlag,
      published: Date.now(),
    });

    const savedBike = await newBike.save();
    res.status(201).json(savedBike);
  } catch (err) {
    console.error("Create bike error:", err);
    res
      .status(500)
      .json({ message: "Server error", error: { message: err.message } });
  }
};

/** GET ALL AVAILABLE BIKES (not sold ones) **/
const getAllBikes = async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const baseFilter = { is_sold: { $ne: true } };

    const bikes = await PostBike.find(baseFilter)
      .sort({ published: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const bikeIds = bikes.map((b) => b._id);
    const images = bikeIds.length
      ? await Image.find({ bike_id: { $in: bikeIds } }).lean()
      : [];

    const imagesByBike = images.reduce((acc, img) => {
      const key = String(img.bike_id);
      acc[key] = acc[key] || [];
      const url =
        img.url ||
        `${req.protocol}://${req.get("host")}/uploads/${(
          img.path ||
          img.filename ||
          ""
        )
          .split(/[\\/]/)
          .pop()}`;
      acc[key].push({
        _id: img._id,
        url,
        path: img.path,
        mimeType: img.mimeType,
      });
      return acc;
    }, {});

    const bikesWithImages = bikes
      .map((bike) => {
        const key = String(bike._id);
        const imgs = imagesByBike[key] || [];
        return {
          ...bike,
          images: imgs,
          firstImageUrl: imgs.length > 0 ? imgs[0].url : null,
        };
      })
      .filter((bike) => bike.images.length > 0);

    const total = await PostBike.countDocuments(baseFilter);

    res.status(200).json({
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
      bikes: bikesWithImages,
    });
  } catch (err) {
    console.error("getAllBikes error:", err);
    res
      .status(500)
      .json({ message: "Server error", error: { message: err.message } });
  }
};

/** GET BIKE BY ID */
const getBikeById = async (req, res) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid bike id" });
    }

    const bike = await PostBike.findById(id)
      .populate("user_id", "first_name last_name phone_number address email")
      .lean();

    if (!bike) {
      return res.status(404).json({ message: "Bike not found" });
    }

    let images = [];
    if (mongoose.modelNames().includes("Image")) {
      const ImageModel = mongoose.model("Image");
      images = await ImageModel.find({ bike_id: bike._id }).lean();
    } else {
      images = bike.images && Array.isArray(bike.images) ? bike.images : [];
    }

    const normalized = normalizeImages(images, req);
    bike.images = normalized;
    bike.firstImageUrl = normalized.length ? normalized[0].url : null;

    return res.status(200).json(bike);
  } catch (error) {
    console.error("getBikeById error:", error);
    return res.status(500).json({
      message: "Server error",
      error: { message: error.message, path: error.path || null },
    });
  }
};

/** GET BIKES FOR LOGGED-IN USER */
const getUserBikes = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Authentication required" });
    }
    const userId = req.user._id;
    console.log("getUserBikes - userId:", String(userId));

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    // POSTED BIKES (the bikes this user posted)
    const postedBikes = await PostBike.find({ user_id: userId })
      .sort({ published: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const postedTotal = await PostBike.countDocuments({ user_id: userId });

    // SOLD BIKES WHERE THIS USER IS THE BUYER
    const soldRecords = await Sold.find({ buyer_id: userId }).lean();
    console.log("getUserBikes - soldRecords found:", soldRecords.length);

    const soldByBike = soldRecords.reduce((acc, s) => {
      const key = String(s.bike_id);
      acc[key] = acc[key] || [];
      acc[key].push({
        _id: s._id,
        sold_date: s.sold_date,
        price: s.price,
        buyer_id: s.buyer_id,
        seller_id: s.seller_id,
        notes: s.notes,
      });
      return acc;
    }, {});

    const boughtBikeIds = Object.keys(soldByBike);

    let boughtBikes = [];
    if (boughtBikeIds.length > 0) {
      const bikes = await PostBike.find({ _id: { $in: boughtBikeIds } }).lean();
      boughtBikes = bikes.map((b) => {
        const key = String(b._id);
        return {
          ...b,
          soldRecords: soldByBike[key] || [],
        };
      });
    }

    const allIds = [
      ...new Set([
        ...postedBikes.map((b) => String(b._id)),
        ...boughtBikes.map((b) => String(b._id)),
      ]),
    ];

    let images = [];
    if (allIds.length > 0) {
      images = await Image.find({ bike_id: { $in: allIds } }).lean();
    }

    const imagesByBike = images.reduce((acc, img) => {
      const key = String(img.bike_id);
      acc[key] = acc[key] || [];
      const url =
        img.url ||
        `${req.protocol}://${req.get("host")}/uploads/${(
          img.path ||
          img.filename ||
          ""
        )
          .split(/[\\/]/)
          .pop()}`;
      acc[key].push({
        _id: img._id,
        url,
        path: img.path,
        mimeType: img.mimeType,
      });
      return acc;
    }, {});

    const postedWithImages = postedBikes.map((b) => {
      const key = String(b._id);
      const imgs = imagesByBike[key] || [];
      return { ...b, images: imgs, firstImageUrl: imgs[0]?.url || null };
    });

    const boughtWithImages = boughtBikes.map((b) => {
      const key = String(b._id);
      const imgs = imagesByBike[key] || [];
      return { ...b, images: imgs, firstImageUrl: imgs[0]?.url || null };
    });

    return res.status(200).json({
      posted: {
        total: postedTotal,
        page,
        limit,
        pages: Math.ceil(postedTotal / limit),
        bikes: postedWithImages,
      },
      bought: {
        total: boughtWithImages.length,
        bikes: boughtWithImages,
      },
    });
  } catch (err) {
    console.error("getUserBikes error:", err);
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};

/** MARK BIKE AS SOLD */
const soldBike = async (req, res) => {
  try {
    const bikeId = req.params.id;

    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Authentication required" });
    }
    const buyerId = String(req.user._id);

    if (!mongoose.Types.ObjectId.isValid(bikeId)) {
      return res.status(400).json({ message: "Invalid bike ID" });
    }

    const bike = await PostBike.findById(bikeId).lean();
    if (!bike) return res.status(404).json({ message: "Bike not found" });

    const ownerId =
      bike.user_id && typeof bike.user_id === "object"
        ? String(bike.user_id._id || bike.user_id.id || bike.user_id)
        : String(bike.user_id || "");

    if (ownerId && buyerId === ownerId) {
      return res.status(403).json({ message: "You cannot buy your own bike" });
    }

    if (bike.is_sold) {
      return res
        .status(400)
        .json({ message: "This bike is already marked as sold" });
    }

    const updatedBike = await PostBike.findByIdAndUpdate(
      bikeId,
      { is_sold: true },
      { new: true }
    );

    const soldEntry = new Sold({
      bike_id: updatedBike._id,
      price: req.body.price !== undefined ? req.body.price : updatedBike.price,
      buyer_id: req.user._id,
      seller_id: updatedBike.user_id,
      notes: req.body.notes || "",
      sold_date: Date.now(),
    });

    await soldEntry.save();

    return res
      .status(200)
      .json({ message: "Bike marked as sold", bike: updatedBike, soldEntry });
  } catch (err) {
    console.error("soldBike error:", err);
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};

/** UPDATE BIKE */
const updateBike = async (req, res) => {
  try {
    const { price, location, description } = req.body;

    const bike = await PostBike.findByIdAndUpdate(
      req.params.id,
      { price, location, description },
      { new: true, runValidators: true }
    ).populate({
      path: "images",
      model: "Image",
      options: { strictPopulate: false },
    });

    if (!bike) {
      return res.status(404).json({ message: "Bike not found" });
    }

    const bikeObj = bike.toObject();
    bikeObj.images = (bike.images || []).map((img) => ({
      _id: img._id,
      url: `${req.protocol}://${req.get("host")}/uploads/${(
        img.path ||
        img.filename ||
        ""
      )
        .split("/")
        .pop()}`,
    }));

    res.status(200).json(bikeObj);
  } catch (error) {
    console.error("updateBike error:", error);
    res
      .status(500)
      .json({ message: "Server error", error: { message: error.message } });
  }
};

/** DELETE BIKE */
const deleteBike = async (req, res) => {
  try {
    const bike = await PostBike.findByIdAndDelete(req.params.id);
    if (!bike) {
      return res.status(404).json({ message: "Bike not found" });
    }
    res.status(200).json({ message: "Bike deleted successfully" });
  } catch (error) {
    console.error("deleteBike error:", error);
    res
      .status(500)
      .json({ message: "Server error", error: { message: error.message } });
  }
};

/** GET MODELS (for a specified brand) */
const getModel = async (req, res) => {
  try {
    const { brand } = req.query;
    if (!brand)
      return res.status(400).json({ message: "brand query param required" });

    const models = await Bike.find({ brand }).distinct("model");
    models.sort((a, b) => a.localeCompare(b));
    res.json({ models });
  } catch (err) {
    console.error("GET /api/bikes/models error", err);
    res.status(500).json({ message: "Failed to fetch models" });
  }
};

/** GET ENGINES for brand+model */
const getEngine = async (req, res) => {
  try {
    const { brand, model } = req.query;
    if (!brand || !model)
      return res
        .status(400)
        .json({ message: "brand and model query params required" });

    const engines = await Bike.find({ brand, model }).distinct("engine");
    engines.sort((a, b) => a.localeCompare(b));
    res.json({ engines });
  } catch (err) {
    console.error("GET /api/modelbikes/engines error", err);
    res.status(500).json({ message: "Failed to fetch engines" });
  }
};

/** GET BIKES BY BRAND */
const getBikesByBrand = async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 20));
    const skip = (page - 1) * limit;
    const brand = req.params.brand;

    if (!brand)
      return res.status(400).json({ message: "Brand required in params" });

    const filter = { brand, isSold: { $ne: true } };

    const bikes = await PostBike.find(filter)
      .sort({ published: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const bikeIds = bikes.map((b) => b._id);
    const images = bikeIds.length
      ? await Image.find({ bike_id: { $in: bikeIds } }).lean()
      : [];

    const imagesByBike = images.reduce((acc, img) => {
      const key = String(img.bike_id);
      acc[key] = acc[key] || [];
      const url =
        img.url ||
        `${req.protocol}://${req.get("host")}/uploads/${(
          img.path ||
          img.filename ||
          ""
        )
          .split(/[\\/]/)
          .pop()}`;
      acc[key].push({
        _id: img._id,
        url,
        path: img.path,
        mimeType: img.mimeType,
      });
      return acc;
    }, {});

    const bikesWithImages = bikes.map((bike) => {
      const key = String(bike._id);
      const imgs = imagesByBike[key] || [];
      return {
        ...bike,
        images: imgs,
        firstImageUrl: imgs.length > 0 ? imgs[0].url : null,
      };
    });

    const total = await PostBike.countDocuments(filter);

    res.status(200).json({
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
      bikes: bikesWithImages,
    });
  } catch (err) {
    console.error("getBikesByBrand error:", err);
    res
      .status(500)
      .json({ message: "Server error", error: { message: err.message } });
  }
};

const searchBikes = async (req, res) => {
  try {
    let rawQuery = req.query.query;
    if (!rawQuery || rawQuery === "null" || rawQuery === "undefined")
      rawQuery = "";
    const query = String(rawQuery).trim();

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    // Exclude sold bikes
    const baseFilter = { is_sold: { $ne: true } };

    let filter;
    if (!query) {
      filter = baseFilter;
    } else {
      const regex = new RegExp(query, "i");
      filter = {
        $and: [
          baseFilter,
          {
            $or: [
              { brand: regex },
              { model: regex },
              {
                $expr: {
                  $regexMatch: {
                    input: { $concat: ["$brand", " ", "$model"] },
                    regex,
                  },
                },
              },
            ],
          },
        ],
      };
    }

    const bikes = await PostBike.find(filter)
      .sort({ published: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const bikeIds = bikes.map((b) => b._id);
    const images = bikeIds.length
      ? await Image.find({ bike_id: { $in: bikeIds } }).lean()
      : [];

    const imagesByBike = images.reduce((acc, img) => {
      const key = String(img.bike_id);
      acc[key] = acc[key] || [];
      const url =
        img.url ||
        `${req.protocol}://${req.get("host")}/uploads/${(
          img.path ||
          img.filename ||
          ""
        )
          .split(/[\\/]/)
          .pop()}`;
      acc[key].push({
        _id: img._id,
        url,
        path: img.path,
        mimeType: img.mimeType,
      });
      return acc;
    }, {});

    const bikesWithImages = bikes.map((bike) => {
      const imgs = imagesByBike[bike._id] || [];
      return {
        ...bike,
        images: imgs,
        firstImageUrl: imgs[0]?.url || null,
      };
    });

    const total = await PostBike.countDocuments(filter);

    res.status(200).json({
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
      bikes: bikesWithImages,
    });
  } catch (error) {
    console.error("searchBikes error:", error);
    res
      .status(500)
      .json({ message: "Server error", error: { message: error.message } });
  }
};

module.exports = {
  createBike,
  getAllBikes,
  getBikeById,
  updateBike,
  deleteBike,
  getModel,
  getEngine,
  soldBike,
  getUserBikes,
  getBikesByBrand,
  searchBikes,
};
