const mongoose = require("mongoose");
const { env } = require("./env");
const { logger } = require("./logger");

mongoose.set("strictQuery", true);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const connectDb = async () => {
  const maxAttempts = Number.isFinite(env.MONGODB_CONNECT_RETRIES) ? env.MONGODB_CONNECT_RETRIES : 5;
  const baseDelayMs = Number.isFinite(env.MONGODB_CONNECT_RETRY_DELAY_MS) ? env.MONGODB_CONNECT_RETRY_DELAY_MS : 2000;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await mongoose.connect(env.MONGODB_URI);
      logger.info("MongoDB connected", { attempt, maxAttempts });
      return;
    } catch (err) {
      logger.error("MongoDB connection failed", {
        attempt,
        maxAttempts,
        message: err.message,
      });

      if (attempt === maxAttempts) throw err;
      await sleep(baseDelayMs * attempt);
    }
  }
};

module.exports = { connectDb };
