const asyncHandler = require("../utils/asyncHandler");
const { subscribeToNewsletter } = require("../services/newsletter.service");

exports.subscribe = asyncHandler(async (req, res) => {
  const subscriber = await subscribeToNewsletter(req.body);
  res.status(201).json({ success: true, subscriber });
});

