const asyncHandler = require("../utils/asyncHandler");
const { getSettings, upsertSettings } = require("../services/settings.service");

exports.getSettings = asyncHandler(async (_req, res) => {
  const settings = await getSettings();
  res.json({ success: true, settings });
});

exports.updateSettings = asyncHandler(async (req, res) => {
  const settings = await upsertSettings(req.body);
  res.json({ success: true, settings });
});

