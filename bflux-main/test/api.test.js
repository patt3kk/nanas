const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test_jwt_secret";
process.env.PAYSTACK_SECRET_KEY = "sk_test_xxx";
process.env.FROM_EMAIL = "Nana's Akara <no-reply@nanasakara.ng>";

const app = require("../src/app");
const { paystackHttp } = require("../src/config/paystack");
const User = require("../src/models/user.model");
const Category = require("../src/models/category.model");
const MenuItem = require("../src/models/menuItem.model");
const Order = require("../src/models/order.model");

let mongo;

const resetDb = async () => {
  const collections = await mongoose.connection.db.collections();
  await Promise.all(collections.map((c) => c.deleteMany({})));
};

const seedMenu = async () => {
  const DeliveryZone = require("../src/models/deliveryZone.model");
  // Seed a default delivery zone so delivery fee calc succeeds during tests
  await DeliveryZone.create({
    name: "Test Zone",
    distanceRange: { minKm: 0, maxKm: 5 },
    fee: 1200,
  });

  const category = await Category.create({ name: "Akara", description: "Fresh akara" });
  const item = await MenuItem.create({
    name: "Classic Akara (6 pcs)",
    description: "Crispy outside, fluffy inside.",
    category: category._id,
    price: 1500,
    images: [],
    ingredients: ["Beans", "Pepper", "Onion"],
    tags: ["akara"],
    isFeatured: true,
    isAvailable: true,
    sortOrder: 1,
  });
  return { category, item };
};

const seedAdmin = async () => {
  return User.create({
    name: "Admin",
    email: "admin@nanasakara.ng",
    password: "password123",
    role: "super-admin",
    isActive: true,
  });
};

const loginAdmin = async () => {
  const res = await request(app)
    .post("/api/auth/admin/login")
    .send({ email: "admin@nanasakara.ng", password: "password123" });
  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.ok(res.body.token);
  return res.body.token;
};

test.before(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri(), { dbName: "test" });
});

test.after(async () => {
  await mongoose.disconnect();
  if (mongo) await mongo.stop();
});

test("GET /api/status returns ok", async () => {
  const res = await request(app).get("/api/status");
  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
});

test("Public order -> Paystack init -> verify -> webhook updates order", async () => {
  await resetDb();
  const { item } = await seedMenu();

  paystackHttp.post = async () => {
    return {
      data: {
        status: true,
        data: {
          authorization_url: "https://paystack.test/redirect",
          access_code: "access_code",
          reference: "ref_test_123",
        },
      },
    };
  };

  paystackHttp.get = async () => {
    return {
      data: {
        status: true,
        data: {
          status: "success",
        },
      },
    };
  };

  const orderRes = await request(app).post("/api/orders").send({
  
    /* Debug note: payload must satisfy Joi + delivery fee calc */

    customer: { fullName: "Test User", email: "user@example.com", phone: "08000000000" },
    items: [{ menuItemId: String(item._id), quantity: 2 }],
    deliveryAddress: {
      addressLine1: "1 Test Street",
      addressLine2: "",
      city: "Lagos",
      state: "Lagos",
      landmark: "",
      notes: "",
    },
    distanceKm: 2,
    orderNotes: "Ring bell",
  });
  assert.equal(orderRes.status, 201);
  assert.equal(orderRes.body.success, true);

  const orderId = String(orderRes.body.order._id);

  const initRes = await request(app).post("/api/payments/initialize").send({
    orderId,
    email: "user@example.com",
  });
  assert.equal(initRes.status, 200);
  assert.equal(initRes.body.success, true);
  assert.equal(initRes.body.data.reference, "ref_test_123");

  const verifyRes = await request(app).get("/api/orders/verify/ref_test_123");

  assert.equal(verifyRes.status, 200);
  assert.equal(verifyRes.body.success, true);
  assert.equal(verifyRes.body.order.paymentStatus, "success");

  const raw = JSON.stringify({
    event: "charge.success",
    data: { reference: "ref_test_123" },
  });
  const sig = crypto.createHmac("sha512", process.env.PAYSTACK_SECRET_KEY).update(raw).digest("hex");

  const webhookRes = await request(app)
    .post("/api/payments/webhook")
    .set("x-paystack-signature", sig)
    .set("Content-Type", "application/json")
    .send(raw);
  assert.equal(webhookRes.status, 200);
  assert.equal(webhookRes.body.received, true);

  const saved = await Order.findById(orderId).lean().exec();
  assert.equal(saved.paymentStatus, "success");
  assert.equal(saved.status, "Confirmed");
});

test("Admin auth and protected route access", async () => {
  await resetDb();
  await seedMenu();
  await seedAdmin();

  const token = await loginAdmin();

  const meRes = await request(app).get("/api/auth/me").set("Authorization", `Bearer ${token}`);
  assert.equal(meRes.status, 200);
  assert.equal(meRes.body.success, true);

  const listRes = await request(app).get("/api/admin/orders").set("Authorization", `Bearer ${token}`);
  assert.equal(listRes.status, 200);
  assert.equal(listRes.body.success, true);
  assert.ok(Array.isArray(listRes.body.items));
});

