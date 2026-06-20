const asyncHandler = require("../utils/asyncHandler");
const Order = require("../models/order.model");
const crud = require("../services/crud.service");

exports.listCustomerOrders = asyncHandler(async (req, res) => {
  const { page, limit, sort } = req.query;
  const data = await crud.list({
    model: Order,
    query: { customerId: req.params.id },
    page: page || 1,
    limit: limit || 20,
    sort: sort || "-createdAt",
  });
  res.json({ success: true, ...data });
});

