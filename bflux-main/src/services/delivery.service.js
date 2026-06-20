const DeliveryZone = require("../models/deliveryZone.model");
const { APIError } = require("../middlewares/errorApi");
const { env } = require("../config");

const calculateDeliveryFee = async ({ distanceKm }) => {
  if (distanceKm === undefined || distanceKm === null) return Number(env.DEFAULT_DELIVERY_FEE || 0);
  if (Number.isNaN(Number(distanceKm)) || Number(distanceKm) < 0) throw APIError.badRequest("Invalid distanceKm");

  const zone = await DeliveryZone.findOne({
    "distanceRange.minKm": { $lte: Number(distanceKm) },
    "distanceRange.maxKm": { $gte: Number(distanceKm) },
  })
    .sort({ fee: 1 })
    .exec();

  if (!zone) throw APIError.badRequest("No delivery zone matches the provided distance");
  return zone.fee;
};

module.exports = { calculateDeliveryFee };
