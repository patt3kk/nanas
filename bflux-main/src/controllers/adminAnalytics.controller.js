const asyncHandler = require("../utils/asyncHandler");
const Order = require("../models/order.model");
const Customer = require("../models/customer.model");
const MenuItem = require("../models/menuItem.model");

exports.getOverview = asyncHandler(async (_req, res) => {
  const [totalOrders, totalCustomers, totalMenuItems, revenueAgg, statusAgg, recentOrders] = await Promise.all([
    Order.countDocuments({}),
    Customer.countDocuments({}),
    MenuItem.countDocuments({}),
    Order.aggregate([{ $match: { paymentStatus: "success" } }, { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } }]),
    Order.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    Order.find({})
      .sort({ createdAt: -1 })
      .limit(8)
      .select("orderNumber customer totalAmount status paymentStatus createdAt")
      .lean()
      .exec(),
  ]);

  const statusCounts = statusAgg.reduce((acc, row) => {
    acc[row._id || "Unknown"] = row.count;
    return acc;
  }, {});

  res.json({
    success: true,
    totals: {
      totalOrders,
      totalRevenue: revenueAgg?.[0]?.totalRevenue || 0,
      totalCustomers,
      totalMenuItems,
    },
    statusCounts,
    recentOrders,
  });
});

