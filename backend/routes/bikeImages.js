const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const PostBike = require("../Models/PostBikesModel");

router.get("/:id/images", async (req, res) => {
  const bikeId = req.params.id;
  const hostPrefix = `${req.protocol}://${req.get("host")}`;
  const uploadDir = path.join(__dirname, "..", "uploads");

  try {
    let images = [];

    if (mongoose.modelNames().includes("Image")) {
      const Image = mongoose.model("Image");
      const candidateFields = ["bike_id", "postbike_id", "postId", "post_id", "post", "owner_id"];
      for (const field of candidateFields) {
        const q = {};
        q[field] = bikeId;
        const docs = await Image.find(q).lean().limit(200);
        if (docs && docs.length > 0) {
          images = docs.map((d) => {
            if (d.url) {
              const url = d.url.startsWith("http") ? d.url : `${hostPrefix}${d.url.startsWith("/") ? "" : "/"}${d.url}`;
              return { url, filename: d.filename || null, _id: d._id || null };
            }
            if (d.path) {
              const filename = String(d.path).split(/[\\/]/).pop();
              return { url: `${hostPrefix}/uploads/${filename}`, filename, _id: d._id || null };
            }
            if (d.filename) {
              return { url: `${hostPrefix}/uploads/${d.filename}`, filename: d.filename, _id: d._id || null };
            }
            return null;
          }).filter(Boolean);
          break;
        }
      }
    }

    if (!images.length) {
      const db = mongoose.connection.db;
      const collections = await db.listCollections().toArray();
      if (collections.find((c) => c.name === "images")) {
        const col = db.collection("images");
        const orQueries = [
          { bike_id: bikeId }, { postbike_id: bikeId }, { postId: bikeId },
          { post_id: bikeId }, { post: bikeId }
        ];
        const oid = mongoose.Types.ObjectId.isValid(bikeId) ? mongoose.Types.ObjectId(bikeId) : null;
        if (oid) orQueries.push({ bike_id: oid }, { postbike_id: oid }, { postId: oid });
        const docs = await col.find({ $or: orQueries }).limit(200).toArray();
        if (docs && docs.length > 0) {
          images = docs.map((d) => {
            if (d.url) {
              const url = d.url.startsWith("http") ? d.url : `${hostPrefix}${d.url.startsWith("/") ? "" : "/"}${d.url}`;
              return { url, filename: d.filename || null, _id: d._id || null };
            }
            if (d.path) {
              const filename = String(d.path).split(/[\\/]/).pop();
              return { url: `${hostPrefix}/uploads/${filename}`, filename, _id: d._id || null };
            }
            if (d.filename) {
              return { url: `${hostPrefix}/uploads/${d.filename}`, filename: d.filename, _id: d._id || null };
            }
            return null;
          }).filter(Boolean);
        }
      }
    }

    if (!images.length) {
      try {
        if (fs.existsSync(uploadDir)) {
          const files = fs.readdirSync(uploadDir);
          const matched = files.filter((f) => f.includes(bikeId));
          if (matched.length > 0) {
            images = matched.map((f) => ({ url: `${hostPrefix}/uploads/${f}`, filename: f, _id: null }));
          }
        }
      } catch (e) {
        console.warn("Error scanning uploads folder:", e);
      }
    }

    if (!images.length) {
      const bike = await PostBike.findById(bikeId).lean();
      if (bike && Array.isArray(bike.images) && bike.images.length > 0) {
        images = bike.images.map((img) => {
          if (!img) return null;
          if (typeof img === "string") {
            const filename = img.split(/[\\/]/).pop();
            return { url: `${hostPrefix}/uploads/${filename}`, filename, _id: null };
          }
          if (img.url) {
            const url = img.url.startsWith("http") ? img.url : `${hostPrefix}${img.url.startsWith("/") ? "" : "/"}${img.url}`;
            return { url, filename: img.filename || null, _id: img._id || null };
          }
          if (img.path || img.filename) {
            const filename = (img.path || img.filename).split(/[\\/]/).pop();
            return { url: `${hostPrefix}/uploads/${filename}`, filename, _id: img._id || null };
          }
          return null;
        }).filter(Boolean);
      }
    }

    images = images.filter(Boolean).map(i => ({ url: i.url, filename: i.filename || null, _id: i._id || null }));

    return res.json({ images });
  } catch (err) {
    console.error("GET /api/bikes/:id/images error:", err);
    return res.status(500).json({ message: "Server error", error: { message: err.message } });
  }
});

module.exports = router;
