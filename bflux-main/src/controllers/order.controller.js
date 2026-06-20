const asyncHandler = require("../utils/asyncHandler");
const { createOrder } = require("../services/order.service");
const { verifyPaystackReference } = require("../services/payment.service");

exports.createOrder = asyncHandler(async (req, res) => {
  const order = await createOrder(req.body);
  res.status(201).json({ success: true, order });
});

exports.verifyOrderPayment = asyncHandler(async (req, res) => {
  const order = await verifyPaystackReference({ reference: req.params.reference });
  res.json({ success: true, order });
});

