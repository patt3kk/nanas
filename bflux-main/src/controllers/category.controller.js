const asyncHandler = require("../utils/asyncHandler");
const Category = require("../models/category.model");

exports.listCategories = asyncHandler(async (_req, res) => {
  const items = await Category.find({}).sort({ name: 1 }).lean().exec();
  res.json({ success: true, items });
});

