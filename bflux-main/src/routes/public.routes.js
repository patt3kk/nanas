const express = require("express");
const { validate } = require("../middlewares/validate.middleware");
const { upload } = require("../middlewares/upload.middleware");
const { listMenu, getMenuItemBySlug } = require("../controllers/menu.controller");
const { listCategories } = require("../controllers/category.controller");
const { createOrder, verifyOrderPayment } = require("../controllers/order.controller");
const { initialize, webhook } = require("../controllers/payment.controller");
const { createMessage } = require("../controllers/contact.controller");
const { apply } = require("../controllers/career.controller");
const { listPublicTestimonials } = require("../controllers/testimonial.controller");
const { getPublicSettings } = require("../controllers/settings.controller");
const { listDeliveryZones } = require("../controllers/deliveryZone.controller");
const { subscribe } = require("../controllers/newsletter.controller");
const { createOrderSchema, initPaymentSchema, newsletterSchema, contactSchema, careerSchema } = require("../validators/public.validation");

const router = express.Router();

router.get("/menu", listMenu);
router.get("/menu/:slug", getMenuItemBySlug);
router.get("/categories", listCategories);
router.post("/orders", validate(createOrderSchema), createOrder);
router.get("/orders/verify/:reference", verifyOrderPayment);
router.post("/payments/initialize", validate(initPaymentSchema), initialize);
router.post("/payments/webhook", webhook);
router.post("/contact", validate(contactSchema), createMessage);
router.post("/careers", upload.single("cv"), validate(careerSchema), apply);
router.get("/testimonials", listPublicTestimonials);
router.get("/settings", getPublicSettings);
router.get("/delivery-zones", listDeliveryZones);
router.post("/newsletter", validate(newsletterSchema), subscribe);

module.exports = router;
