const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const { env } = require("../config");
const { APIError } = require("../middlewares/errorApi");

const signAccessToken = (user) => {
  return jwt.sign(
    { role: user.role, email: user.email },
    env.JWT_SECRET,
    { subject: String(user._id), expiresIn: env.JWT_EXPIRES_IN }
  );
};

const loginAdmin = async ({ email, password }) => {
  const user = await User.findOne({ email: email.toLowerCase() }).select("+password").exec();
  if (!user) throw APIError.unauthenticated("Invalid credentials");
  if (!user.isActive) throw APIError.unauthorized("Account is disabled");

  const ok = await user.comparePassword(password);
  if (!ok) throw APIError.unauthenticated("Invalid credentials");

  user.lastLogin = new Date();
  await user.save();

  const token = signAccessToken(user);
  return {
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role, isActive: user.isActive, lastLogin: user.lastLogin },
  };
};

module.exports = { loginAdmin, signAccessToken };

