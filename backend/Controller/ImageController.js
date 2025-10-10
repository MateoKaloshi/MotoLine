const Bike = require("../Models/PostBikesModel");
const Image = require("../Models/ImagesModel");

const uploadImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const { bike_id } = req.body;
    if (!bike_id) {
      return res.status(400).json({ message: "bike_id is required" });
    }

    const imageDocs = [];

    for (let file of req.files) {
      const newImage = new Image({
        url: `${req.protocol}://${req.get("host")}/uploads/${file.filename}`,
        path: file.path,
        mimeType: file.mimetype,
        bike_id,
      });

      const savedImage = await newImage.save();
      imageDocs.push(savedImage);
    }

    res.status(201).json({
      message: "Images uploaded successfully",
      images: imageDocs.map((img) => ({
        id: img._id,
        url: img.url,
        mimeType: img.mimeType,
        bike_id: img.bike_id,
      })),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
const deleteImages = async (req, res) => {
  try {
    const { imageUrl } = req.body;
    const bike = await PostBike.findById(req.params.id);
    if (!bike) return res.status(404).json({ message: "Bike not found" });

    bike.images = bike.images.filter(
      (img) => !img.includes(imageUrl.split("/").pop())
    );
    await bike.save();

    res.status(200).json({ message: "Image removed" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

module.exports = {
  uploadImages,
  deleteImages,
};
