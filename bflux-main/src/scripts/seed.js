const mongoose = require("mongoose");
const { env } = require("../config");
const { connectDb } = require("../config/db");
const { logger } = require("../config/logger");
const User = require("../models/user.model");
const Category = require("../models/category.model");
const MenuItem = require("../models/menuItem.model");
const DeliveryZone = require("../models/deliveryZone.model");
const SiteSetting = require("../models/siteSetting.model");

const seedSuperAdmin = async () => {
  const email = process.env.SUPER_ADMIN_EMAIL;
  const password = process.env.SUPER_ADMIN_PASSWORD;
  const name = process.env.SUPER_ADMIN_NAME || "Super Admin";
  if (!email || !password) return;

  const existing = await User.findOne({ email: email.toLowerCase() }).exec();
  if (existing) return;

  await User.create({ name, email, password, role: "super-admin", isActive: true });
  logger.info("Seeded super-admin", { email });
};

const seedDeliveryZones = async () => {
  const count = await DeliveryZone.countDocuments();
  if (count > 0) return;

  await DeliveryZone.insertMany([
    { name: "Zone A (0-3km)", distanceRange: { minKm: 0, maxKm: 3 }, fee: 500 },
    { name: "Zone B (3-7km)", distanceRange: { minKm: 3, maxKm: 7 }, fee: 1000 },
    { name: "Zone C (7-12km)", distanceRange: { minKm: 7, maxKm: 12 }, fee: 1500 }
  ]);
  logger.info("Seeded delivery zones");
};

const seedSettings = async () => {
  const existing = await SiteSetting.findOne({ key: "default" }).exec();
  if (existing) return;

  await SiteSetting.create({
    key: "default",
    company: { name: "Nana's Akara", tagline: "Premium Nigerian Meals" },
    contact: { email: env.FROM_EMAIL || "hello@nanasakara.com" },
    seo: { title: "Nana's Akara", description: "Premium Nigerian meals delivered to your doorstep." }
  });
  logger.info("Seeded site settings");
};

const seedMenu = async () => {
  const catCount = await Category.countDocuments();
  if (catCount > 0) return;

  const categories = await Category.insertMany([
    { name: "Akara", description: "Fresh akara and combos" },
    { name: "Meals", description: "Authentic Nigerian meals" },
    { name: "Drinks", description: "Beverages" }
  ]);

  const byName = new Map(categories.map((c) => [c.name, c]));

  await MenuItem.insertMany([
    {
      name: "Classic Akara (6 pcs)",
      description: "Crispy outside, fluffy inside.",
      category: byName.get("Akara")._id,
      price: 1500,
      images: [],
      ingredients: ["Beans", "Pepper", "Onion"],
      tags: ["akara"],
      isFeatured: true,
      sortOrder: 1
    },
    {
      name: "Akara + Pap Combo",
      description: "Akara served with hot pap.",
      category: byName.get("Akara")._id,
      price: 2500,
      images: [],
      ingredients: ["Beans", "Pap"],
      tags: ["combo"],
      isFeatured: true,
      sortOrder: 2
    }
  ]);

  logger.info("Seeded categories and menu items");
};

const run = async () => {
  await connectDb();
  await seedSuperAdmin();
  await seedDeliveryZones();
  await seedSettings();
  await seedMenu();

  await mongoose.disconnect();
  logger.info("Seeding complete");
};

run().catch(async (err) => {
  logger.error("Seeding failed", { message: err.message, stack: err.stack });
  await mongoose.disconnect();
  process.exit(1);
});

