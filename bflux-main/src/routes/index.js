const publicRoutes = require("./public.routes");
const adminRoutes = require("./admin.routes");
const authRoutes = require("./auth.routes");

const mountRoutes = (app) => {
  app.use("/api/auth", authRoutes);
  app.use("/api", publicRoutes);
  app.use("/api/admin", adminRoutes);
};

module.exports = { mountRoutes };
