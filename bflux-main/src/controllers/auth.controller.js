const asyncHandler = require("../utils/asyncHandler");
const { loginAdmin } = require("../services/auth.service");
const User = require("../models/user.model");
const { APIError } = require("../middlewares/errorApi");

exports.adminLogin = asyncHandler(async (req, res) => {
  const result = await loginAdmin(req.body);
  res.json({ success: true, ...result });
});

exports.me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.auth.userId).lean().exec();
  if (!user) throw APIError.unauthenticated();
  res.json({ success: true, user });
});

exports.logout = asyncHandler(async (_req, res) => {
  res.json({ success: true });
});
