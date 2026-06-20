const jwt = require("jsonwebtoken");
const { env } = require("../config");
const { APIError } = require("./errorApi");

const extractToken = (req) => {
  const auth = req.headers.authorization;
  if (!auth) return null;
  const [type, token] = auth.split(" ");
  if (type !== "Bearer") return null;
  return token;
};

exports.authRequired = (req, _res, next) => {
  try {
    const token = extractToken(req);
    if (!token) return next(APIError.unauthenticated());
    const payload = jwt.verify(token, env.JWT_SECRET);
    req.auth = { userId: payload.sub, role: payload.role, email: payload.email };
    next();
  } catch (error) {
    if (error.message === "jwt expired") return next(APIError.unauthenticated("Access Token Expired"));
    next(error);
  }
};

exports.requireRole = (...roles) => {
  return (req, _res, next) => {
    if (!req.auth) return next(APIError.unauthenticated());
    if (!roles.includes(req.auth.role)) return next(APIError.unauthorized());
    next();
  };
};
