const express = require("express");
const router = express.Router();
let upload = null;
try {
  const multerLib = require('multer');
  const path = require('path');
  const storage = multerLib.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
  });
  upload = multerLib({ storage });
} catch (err) {
  upload = null;
}

const {
  createBike,
  getAllBikes,
  getBikeById,
  updateBike,
  deleteBike
} = require("../Controller/BikeController");

const { authenticateToken } = require("../Controller/authenticate");

const { uploadImages } = require("../Controller/ImageController");

// ROUTES
if (upload) {
  router.post('/upload', upload.array('images'), uploadImages);
} else {
  router.post('/upload', (req, res) => res.status(501).json({ message: 'Image upload not available (multer not installed)' }));
}

router.post('/bikes', authenticateToken, createBike);
router.get("/bikes", getAllBikes);
router.get("/bikes/:id", getBikeById);
router.put("/bikes/:id", authenticateToken, updateBike);
router.delete("/bikes/:id", authenticateToken, deleteBike);

module.exports = router;
