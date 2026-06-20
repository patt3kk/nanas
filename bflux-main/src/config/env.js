const dotenv = require("dotenv");
const { APIError } = require("../middlewares/errorApi");

dotenv.config();

const required = (key) => {
  const value = process.env[key];
  if (!value) throw APIError.internalServerError(`${key} is required in environment`);
  return value;
};

const optional = (key, fallback) => {
  const value = process.env[key];
  if (value === undefined || value === null || value === "") return fallback;
  return value;
};

const nodeEnv = optional("NODE_ENV", "development");
const maxJsonBodySize = optional("MAX_JSON_BODY_SIZE", "1mb");
const uploadMaxFileSizeMb = Number(optional("UPLOAD_MAX_FILE_SIZE_MB", 10));
const shutdownTimeoutMs = Number(optional("SHUTDOWN_TIMEOUT_MS", 10000));

const normalizeUrl = (value) => {
  if (!value) return value;
  return String(value).replace(/\/$/, "");
};

const env = {
  NODE_ENV: nodeEnv,
  PORT: Number(optional("PORT", 4000)),
  MONGODB_URI: optional("MONGODB_URI", process.env.DB_URI),
  JWT_SECRET: optional("JWT_SECRET", process.env.ACCESS_TOKEN_SECRET),
  JWT_EXPIRES_IN: optional("JWT_EXPIRES_IN", "1d"),
  MAX_JSON_BODY_SIZE: maxJsonBodySize,
  UPLOAD_MAX_FILE_SIZE_MB: Number.isFinite(uploadMaxFileSizeMb) && uploadMaxFileSizeMb > 0 ? uploadMaxFileSizeMb : 10,
  SHUTDOWN_TIMEOUT_MS: Number.isFinite(shutdownTimeoutMs) && shutdownTimeoutMs > 0 ? shutdownTimeoutMs : 10000,
  DEFAULT_DELIVERY_FEE: process.env.DEFAULT_DELIVERY_FEE ? Number(process.env.DEFAULT_DELIVERY_FEE) : 0,
  TRUST_PROXY: process.env.TRUST_PROXY !== undefined ? Number(process.env.TRUST_PROXY) : undefined,
  CORS_ORIGINS: optional("CORS_ORIGINS", ""),
  MONGODB_CONNECT_RETRIES: process.env.MONGODB_CONNECT_RETRIES ? Number(process.env.MONGODB_CONNECT_RETRIES) : 5,
  MONGODB_CONNECT_RETRY_DELAY_MS: process.env.MONGODB_CONNECT_RETRY_DELAY_MS ? Number(process.env.MONGODB_CONNECT_RETRY_DELAY_MS) : 2000,
  LOG_LEVEL: optional("LOG_LEVEL", nodeEnv === "production" ? "info" : "debug"),
  PAYSTACK_PUBLIC_KEY: process.env.PAYSTACK_PUBLIC_KEY,
  PAYSTACK_SECRET_KEY: process.env.PAYSTACK_SECRET_KEY,
  PAYSTACK_WEBHOOK_SECRET: process.env.PAYSTACK_WEBHOOK_SECRET,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  FROM_EMAIL: process.env.FROM_EMAIL,
  CLOUDINARY_CLOUD_NAME: optional("CLOUDINARY_CLOUD_NAME", process.env.CLOUDINARY_NAME),
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  FRONTEND_URL: normalizeUrl(process.env.FRONTEND_URL),
  ADMIN_URL: normalizeUrl(process.env.ADMIN_URL),
  ADMIN_ALERT_EMAIL: process.env.ADMIN_ALERT_EMAIL,
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
};

const validateEnv = () => {
  if (!env.MONGODB_URI) required("MONGODB_URI");
  if (!env.JWT_SECRET) required("JWT_SECRET");

  if (env.NODE_ENV === "production") {
    if (["change_me", "changeme", "secret", "password"].includes(String(env.JWT_SECRET).toLowerCase())) {
      throw APIError.internalServerError("JWT_SECRET must be replaced with a strong production secret");
    }
    if (!env.FRONTEND_URL) required("FRONTEND_URL");
    if (!env.PAYSTACK_SECRET_KEY) required("PAYSTACK_SECRET_KEY");
    if (!env.PAYSTACK_WEBHOOK_SECRET) required("PAYSTACK_WEBHOOK_SECRET");
  }
};

validateEnv();

module.exports = { env };
