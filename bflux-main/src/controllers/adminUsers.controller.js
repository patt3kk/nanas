const asyncHandler = require("../utils/asyncHandler");
const User = require("../models/user.model");
const { APIError } = require("../middlewares/errorApi");
const crud = require("../services/crud.service");

exports.listUsers = asyncHandler(async (req, res) => {
  const { page, limit, sort, q } = req.query;
  const data = await crud.list({
    model: User,
    page: page || 1,
    limit: limit || 20,
    sort: sort || "-createdAt",
    search: q,
    searchFields: ["name", "email", "role"],
  });
  res.json({ success: true, ...data });
});

exports.getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).lean().exec();
  if (!user) throw APIError.notFound("User not found");
  res.json({ success: true, user });
});

exports.createUser = asyncHandler(async (req, res) => {
  const user = await User.create(req.body);
  res.status(201).json({ success: true, user });
});

exports.updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("+password").exec();
  if (!user) throw APIError.notFound("User not found");

  Object.entries(req.body).forEach(([k, v]) => {
    user[k] = v;
  });

  await user.save();
  const safe = await User.findById(user._id).lean().exec();
  res.json({ success: true, user: safe });
});

exports.deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id).lean().exec();
  if (!user) throw APIError.notFound("User not found");
  res.json({ success: true, user });
});

exports.resetPassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("+password").exec();
  if (!user) throw APIError.notFound("User not found");
  user.password = req.body.password;
  await user.save();
  const safe = await User.findById(user._id).lean().exec();
  res.json({ success: true, user: safe });
});
