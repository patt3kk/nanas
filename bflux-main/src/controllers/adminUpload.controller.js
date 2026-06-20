const asyncHandler = require("../utils/asyncHandler");
const MenuItem = require("../models/menuItem.model");
const { APIError } = require("../middlewares/errorApi");
const { uploadBufferToCloudinary } = require("../services/upload.service");

exports.uploadMenuImages = asyncHandler(async (req, res) => {
  const item = await MenuItem.findById(req.params.id).exec();
  if (!item) throw APIError.notFound("Menu item not found");
  if (!req.files || req.files.length === 0) throw APIError.badRequest("Images are required");

  const uploads = await Promise.all(
    req.files.map((f) =>
      uploadBufferToCloudinary({
        buffer: f.buffer,
        filename: f.originalname,
        folder: "nanas-akara/menu-items",
        resourceType: "image",
      })
    )
  );

  const urls = uploads.map((u) => u.secure_url);
  item.images = Array.from(new Set([...(item.images || []), ...urls]));
  await item.save();

  res.json({ success: true, item });
});
