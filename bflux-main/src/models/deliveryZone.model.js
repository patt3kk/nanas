const mongoose = require("mongoose");

const deliveryZoneSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    distanceRange: {
      minKm: { type: Number, required: true, min: 0 },
      maxKm: { type: Number, required: true, min: 0 },
    },
    fee: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

deliveryZoneSchema.index({ "distanceRange.minKm": 1, "distanceRange.maxKm": 1 });

module.exports = mongoose.model("DeliveryZone", deliveryZoneSchema);

