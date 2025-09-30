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
  getModel, 
  getEngine,
 getBikeById
} = require("../Controller/BikeController");

const { authenticateToken } = require("../Controller/authenticate");

const { uploadImages } = require("../Controller/ImageController");

if (upload) {
  router.post("/upload", authenticateToken, upload.array("images", 12), uploadImages);
} else {
  router.post('/upload', (req, res) => res.status(501).json({ message: 'Image upload not available (multer not installed)' }));
}

router.post('/bikes', authenticateToken, createBike);
router.get("/bikes", getAllBikes);
router.get("/bikes/models", getModel);
router.get("/bikes/engines", getEngine);
router.get("/bikes/:id", getBikeById);


module.exports = router;
