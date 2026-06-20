const asyncHandler = require("../utils/asyncHandler");
const MenuItem = require("../models/menuItem.model");
const { APIError } = require("../middlewares/errorApi");

exports.listMenu = asyncHandler(async (req, res) => {
  const { category, featured, q } = req.query;
  const filter = { isAvailable: true };
  if (category) filter.category = category;
  if (featured === "true") filter.isFeatured = true;
  if (q) filter.name = { $regex: String(q), $options: "i" };

  const items = await MenuItem.find(filter).populate("category").sort({ sortOrder: 1, createdAt: -1 }).lean().exec();
  res.json({ success: true, items });
});

exports.getMenuItemBySlug = asyncHandler(async (req, res) => {
  const item = await MenuItem.findOne({ slug: req.params.slug, isAvailable: true }).populate("category").lean().exec();
  if (!item) throw APIError.notFound("Menu item not found");
  res.json({ success: true, item });
});

