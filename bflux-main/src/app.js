const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { env } = require("./config");
const { morganStream } = require("./config/logger");
const { buildSecurityMiddleware } = require("./middlewares/security.middleware");
const { notFound, errorHandler } = require("./middlewares/error.middleware");
const { mountRoutes } = require("./routes");

const app = express();

app.disable("x-powered-by");

// app.use(
//   cors({
//     origin: process.env.FRONTEND_URL,
//     credentials: true,
//   })
// );

app.use(
  cors({
    origin: [
      "http://localhost:5500",
      "http://127.0.0.1:5500",
      "https://nanasakara-test.vercel.app",
      "https://nanasupportpage.netlify.app",
      "https://nanasakara.ng"
    ],
    credentials: true,
  })
);

if (env.TRUST_PROXY !== undefined) {
  app.set("trust proxy", env.TRUST_PROXY);
} else if (env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

app.use(
  express.json({
    limit: env.MAX_JSON_BODY_SIZE,
    verify: (req, _res, buf) => {
      if (req.originalUrl && req.originalUrl.includes("/payments/webhook")) {
        req.rawBody = buf.toString("utf8");
      }
    },
  })
);
app.use(express.urlencoded({ extended: true, limit: env.MAX_JSON_BODY_SIZE }));
app.use(cookieParser());
app.use(buildSecurityMiddleware());

app.use(morgan("combined", { stream: morganStream }));

app.get("/api/status", (_req, res) => {
  res.json({
    success: true,
    name: "Nana's Akara API",
    env: env.NODE_ENV,
    uptimeSeconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

mountRoutes(app);

app.all("*", notFound);
app.use(errorHandler);

module.exports = app;
