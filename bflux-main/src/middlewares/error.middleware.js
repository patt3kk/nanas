const { env } = require("../config");
const { logger } = require("../config/logger");
const { APIError } = require("./errorApi");

exports.notFound = (_req, _res, next) => {
  next(APIError.notFound("Route Not Found"));
};

exports.errorHandler = (err, _req, res, _next) => {
  const statusCode = err.statusCode || err.status || 500;

  if (statusCode >= 500) {
    logger.error("Unhandled error", { message: err.message, stack: err.stack });
  }

  const payload = {
    success: false,
    message: err.message || "Unknown error occurred",
  };

  if (err.details) payload.details = err.details;
  if (env.NODE_ENV !== "production" && err.stack) payload.stack = err.stack;

  res.status(statusCode).json(payload);
};
