const winston = require("winston");
const { env } = require("./env");

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const logger = winston.createLogger({
  levels,
  level: env.LOG_LEVEL,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [new winston.transports.Console()],
});

const morganStream = {
  write: (message) => {
    logger.http(message.trim());
  },
};

module.exports = { logger, morganStream };
