const express = require("express");
const router = express.Router();
let upload = null;
try {
  const multerLib = require("multer");
  const path = require("path");
  const storage = multerLib.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads/"),
    filename: (req, file, cb) =>
      cb(null, Date.now() + path.extname(file.originalname)),
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
  getBikeById,
  updateBike,
  deleteBike,
  soldBike,
  getUserBikes,
  getBikesByBrand,
  searchBikes,
} = require("../Controller/BikeController");

const { authenticateToken } = require("../Controller/authenticate");
const { uploadImages, deleteImages } = require("../Controller/ImageController");

if (upload) {
  router.post(
    "/upload",
    authenticateToken,
    upload.array("images", 12),
    uploadImages
  );
} else {
  router.post("/upload", (req, res) =>
    res
      .status(501)
      .json({ message: "Image upload not available" })
  );
}

router.post("/bikes", authenticateToken, createBike);
router.get("/bikes", getAllBikes);
router.get("/bikes/models", getModel);
router.get("/bikes/engines", getEngine);

router.get("/bikes/search", searchBikes);

router.get("/bikes/brand/:brand", getBikesByBrand);

router.get("/bikes/:id", getBikeById);

router.post("/bikes/:id/sold", authenticateToken, soldBike);
router.put("/bikes/:id", authenticateToken, updateBike);
router.delete("/bikes/:id", authenticateToken, deleteBike);
router.get("/my-bikes", authenticateToken, getUserBikes);
router.delete("/:id/images", authenticateToken, deleteImages);

module.exports = router;
