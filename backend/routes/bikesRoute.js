const express = require("express");
const router = express.Router();
const multer = require("multer");
const { uploadImage, getAllBikes, updateBike,deleteBike} = require("../controllers/bikeController");

// MULTER
const path = require("path");
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// ROUTES
router.post("/upload", upload.single("image"), uploadImage);
router.get("/bikes", getAllBikes);
router.get("/bikes/:id", getBikeById);
router.put("/bikes/:id", updateBike);
router.delete("/bikes/:id", deleteBike);

module.exports = router;



