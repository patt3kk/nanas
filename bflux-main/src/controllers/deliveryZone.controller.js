const asyncHandler = require("../utils/asyncHandler");
const DeliveryZone = require("../models/deliveryZone.model");

exports.listDeliveryZones = asyncHandler(async (_req, res) => {
  const zones = await DeliveryZone.find({}).sort({ "distanceRange.minKm": 1, fee: 1 }).lean().exec();
  res.json({ success: true, zones });
});

