const asyncHandler = require("../utils/asyncHandler");
const { initializePaystackPayment, verifyPaystackWebhook, markOrderPaid } = require("../services/payment.service");
const { APIError } = require("../middlewares/errorApi");

exports.initialize = asyncHandler(async (req, res) => {
  const data = await initializePaystackPayment(req.body);
  res.json({ success: true, data });
});

exports.webhook = asyncHandler(async (req, res) => {
  const signature = req.headers["x-paystack-signature"];
  const rawBody = req.rawBody || "";
  if (!signature || !rawBody) throw APIError.unauthorized("Invalid webhook signature");

  const ok = verifyPaystackWebhook({ signature, rawBody });
  if (!ok) throw APIError.unauthorized("Invalid webhook signature");

  const event = typeof req.body === "object" && req.body ? req.body : JSON.parse(rawBody);
  if (event.event === "charge.success" && event.data && event.data.reference) {
    await markOrderPaid({ reference: event.data.reference });
  }

  res.json({ received: true });
});
