const Bike = require("../models/Bike");
const Image = require("../models/Image");

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

      await Bike.findByIdAndUpdate(bike_id, {
        $push: { images: savedImage._id },
      });
    }

    res.status(201).json(imageDocs);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
