const asyncHandler = require("../utils/asyncHandler");
const Testimonial = require("../models/testimonial.model");

exports.listPublicTestimonials = asyncHandler(async (_req, res) => {
  const items = await Testimonial.find({ isApproved: true }).sort({ createdAt: -1 }).lean().exec();
  res.json({ success: true, items });
});

