const asyncHandler = require("../utils/asyncHandler");
const { getSettings } = require("../services/settings.service");

exports.getPublicSettings = asyncHandler(async (_req, res) => {
  const settings = await getSettings();
  res.json({ success: true, settings });
});

