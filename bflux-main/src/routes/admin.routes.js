const express = require("express");
const { authRequired, requireRole } = require("../middlewares/auth.middleware");
const { validate } = require("../middlewares/validate.middleware");
const { upload } = require("../middlewares/upload.middleware");
const { buildCrudController } = require("../controllers/adminCrud.controller");
const { getSettings, updateSettings } = require("../controllers/adminSettings.controller");
const { uploadMenuImages } = require("../controllers/adminUpload.controller");
const { listUsers, getUser, createUser, updateUser, deleteUser, resetPassword } = require("../controllers/adminUsers.controller");
const { createUserSchema, updateUserSchema, resetPasswordSchema } = require("../validators/admin.validation");
const { getOverview } = require("../controllers/adminAnalytics.controller");
const { listCustomerOrders } = require("../controllers/adminCustomerOrders.controller");

const Category = require("../models/category.model");
const MenuItem = require("../models/menuItem.model");
const Order = require("../models/order.model");
const Customer = require("../models/customer.model");
const ContactMessage = require("../models/contactMessage.model");
const CareerApplication = require("../models/careerApplication.model");
const Testimonial = require("../models/testimonial.model");
const DeliveryZone = require("../models/deliveryZone.model");

const router = express.Router();

const allowedFields = {
  category: ["name", "slug", "description", "image"],
  menu: [
    "name",
    "slug",
    "description",
    "category",
    "price",
    "discountedPrice",
    "images",
    "ingredients",
    "tags",
    "isFeatured",
    "isAvailable",
    "stockStatus",
    "nutritionInfo.calories",
    "nutritionInfo.protein",
    "nutritionInfo.carbs",
    "nutritionInfo.fat",
    "sortOrder",
  ],
  order: ["status", "paymentStatus", "estimatedDeliveryTime", "orderNotes"],
  customer: ["fullName", "email", "phone", "addresses"],
  contact: ["subject", "message", "isRead"],
  career: ["status"],
  testimonial: ["customerName", "rating", "comment", "isApproved"],
  deliveryZone: ["name", "distanceRange.minKm", "distanceRange.maxKm", "fee"],
};

router.use(authRequired);

router.get("/users", requireRole("admin", "super-admin"), listUsers);
router.get("/users/:id", requireRole("admin", "super-admin"), getUser);
router.post("/users", requireRole("super-admin"), validate(createUserSchema), createUser);
router.put("/users/:id", requireRole("super-admin"), validate(updateUserSchema), updateUser);
router.delete("/users/:id", requireRole("super-admin"), deleteUser);
router.post("/users/:id/reset-password", requireRole("super-admin"), validate(resetPasswordSchema), resetPassword);

router.get("/analytics/overview", requireRole("admin", "super-admin"), getOverview);

const category = buildCrudController({ model: Category, searchFields: ["name", "slug"], allowedFields: allowedFields.category });
router.get("/categories", requireRole("admin", "super-admin"), category.list);
router.get("/categories/:id", requireRole("admin", "super-admin"), category.get);
router.post("/categories", requireRole("admin", "super-admin"), category.create);
router.put("/categories/:id", requireRole("admin", "super-admin"), category.update);
router.delete("/categories/:id", requireRole("admin", "super-admin"), category.remove);

const menu = buildCrudController({
  model: MenuItem,
  populate: "category",
  searchFields: ["name", "slug", "tags"],
  allowedFields: allowedFields.menu,
});
router.get("/menu-items", requireRole("admin", "super-admin"), menu.list);
router.get("/menu-items/:id", requireRole("admin", "super-admin"), menu.get);
router.post("/menu-items", requireRole("admin", "super-admin"), menu.create);
router.put("/menu-items/:id", requireRole("admin", "super-admin"), menu.update);
router.delete("/menu-items/:id", requireRole("admin", "super-admin"), menu.remove);
router.post("/menu-items/:id/images", requireRole("admin", "super-admin"), upload.array("images", 8), uploadMenuImages);

const orders = buildCrudController({
  model: Order,
  searchFields: ["orderNumber", "paymentReference", "status", "paymentStatus"],
  allowedFields: allowedFields.order,
});
router.get("/orders", requireRole("admin", "super-admin"), orders.list);
router.get("/orders/:id", requireRole("admin", "super-admin"), orders.get);
router.post("/orders", requireRole("admin", "super-admin"), orders.create);
router.put("/orders/:id", requireRole("admin", "super-admin"), orders.update);
router.delete("/orders/:id", requireRole("super-admin"), orders.remove);

const customers = buildCrudController({
  model: Customer,
  searchFields: ["fullName", "email", "phone"],
  allowedFields: allowedFields.customer,
});
router.get("/customers", requireRole("admin", "super-admin"), customers.list);
router.get("/customers/:id", requireRole("admin", "super-admin"), customers.get);
router.get("/customers/:id/orders", requireRole("admin", "super-admin"), listCustomerOrders);
router.post("/customers", requireRole("admin", "super-admin"), customers.create);
router.put("/customers/:id", requireRole("admin", "super-admin"), customers.update);
router.delete("/customers/:id", requireRole("super-admin"), customers.remove);

const contact = buildCrudController({
  model: ContactMessage,
  searchFields: ["name", "email", "subject"],
  allowedFields: allowedFields.contact,
});
router.get("/contact-messages", requireRole("admin", "super-admin"), contact.list);
router.get("/contact-messages/:id", requireRole("admin", "super-admin"), contact.get);
router.post("/contact-messages", requireRole("admin", "super-admin"), contact.create);
router.put("/contact-messages/:id", requireRole("admin", "super-admin"), contact.update);
router.delete("/contact-messages/:id", requireRole("super-admin"), contact.remove);

const careers = buildCrudController({
  model: CareerApplication,
  searchFields: ["name", "email", "position", "status"],
  allowedFields: allowedFields.career,
});
router.get("/career-applications", requireRole("admin", "super-admin"), careers.list);
router.get("/career-applications/:id", requireRole("admin", "super-admin"), careers.get);
router.post("/career-applications", requireRole("admin", "super-admin"), careers.create);
router.put("/career-applications/:id", requireRole("admin", "super-admin"), careers.update);
router.delete("/career-applications/:id", requireRole("super-admin"), careers.remove);

const testimonials = buildCrudController({
  model: Testimonial,
  searchFields: ["customerName", "comment"],
  allowedFields: allowedFields.testimonial,
});
router.get("/testimonials", requireRole("admin", "super-admin"), testimonials.list);
router.get("/testimonials/:id", requireRole("admin", "super-admin"), testimonials.get);
router.post("/testimonials", requireRole("admin", "super-admin"), testimonials.create);
router.put("/testimonials/:id", requireRole("admin", "super-admin"), testimonials.update);
router.delete("/testimonials/:id", requireRole("super-admin"), testimonials.remove);

const zones = buildCrudController({ model: DeliveryZone, searchFields: ["name"], allowedFields: allowedFields.deliveryZone });
router.get("/delivery-zones", requireRole("admin", "super-admin"), zones.list);
router.get("/delivery-zones/:id", requireRole("admin", "super-admin"), zones.get);
router.post("/delivery-zones", requireRole("admin", "super-admin"), zones.create);
router.put("/delivery-zones/:id", requireRole("admin", "super-admin"), zones.update);
router.delete("/delivery-zones/:id", requireRole("super-admin"), zones.remove);

router.get("/settings", requireRole("admin", "super-admin"), getSettings);
router.put("/settings", requireRole("admin", "super-admin"), updateSettings);

module.exports = router;
