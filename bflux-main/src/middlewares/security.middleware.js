const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const compression = require("compression");
const { env } = require("../config");

const parseOrigins = (raw) => {
  const csv = String(raw || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return Array.from(new Set(csv));
};

const buildSecurityMiddleware = () => {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
  });

  const allowed = [
    ...parseOrigins(env.CORS_ORIGINS),
    env.FRONTEND_URL,
    env.ADMIN_URL,
  ].filter(Boolean);

  // Use explicit allowlist for browser requests.
  // Ensure preflight requests are handled (browser sends OPTIONS with Access-Control-Request-* headers).
  const corsOptions = {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowed.length === 0) {
        // dev convenience; production requires explicit env allowlist
        if (env.NODE_ENV === "production") return callback(null, false);
        return callback(null, true);
      }
      if (allowed.includes(origin)) return callback(null, true);
      return callback(null, false);
    },
    credentials: true,
    optionsSuccessStatus: 204,
  };

  return [
    // Preflight handling must happen early.
    cors(corsOptions),
    helmet(),
    limiter,
    mongoSanitize(),
    xss(),
    hpp(),
    compression(),
  ];
};

module.exports = { buildSecurityMiddleware };
