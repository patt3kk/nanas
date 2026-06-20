const app = require("./src/app");
const mongoose = require("mongoose");
const { env } = require("./src/config");
const { connectDb } = require("./src/config/db");
const { logger } = require("./src/config/logger");

let server;
let shuttingDown = false;

const shutdown = async (signal, reason) => {
  if (shuttingDown) return;
  shuttingDown = true;

  logger.warn("Shutdown initiated", { signal, reason });

  const forceTimer = setTimeout(() => {
    logger.error("Forced shutdown after timeout", { timeoutMs: env.SHUTDOWN_TIMEOUT_MS });
    process.exit(1);
  }, env.SHUTDOWN_TIMEOUT_MS);

  try {
    if (server) {
      await new Promise((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      });
    }

    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }

    clearTimeout(forceTimer);
    logger.info("Shutdown completed");
    process.exit(0);
  } catch (err) {
    clearTimeout(forceTimer);
    logger.error("Shutdown failed", { message: err.message, stack: err.stack });
    process.exit(1);
  }
};

const start = async () => {
  await connectDb();

  server = app.listen(env.PORT, () => {
    logger.info("Server started", { port: env.PORT, env: env.NODE_ENV });
  });
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled promise rejection", {
    message: reason instanceof Error ? reason.message : String(reason),
    stack: reason instanceof Error ? reason.stack : undefined,
  });
  shutdown("unhandledRejection", reason instanceof Error ? reason.message : String(reason));
});
process.on("uncaughtException", (error) => {
  logger.error("Uncaught exception", { message: error.message, stack: error.stack });
  shutdown("uncaughtException", error.message);
});

start().catch((err) => {
  logger.error("Failed to start server", { message: err.message, stack: err.stack });
  process.exit(1);
});
