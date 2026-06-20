const Joi = require("joi");

const orderItemSchema = Joi.object({
  menuItemId: Joi.string().required(),
  quantity: Joi.number().integer().min(1).required(),
});

const createOrderSchema = Joi.object({
  customer: Joi.object({
    fullName: Joi.string().min(2).required(),
    email: Joi.string().email().allow(null, ""),
    phone: Joi.string().allow(null, ""),
  })
    .or("email", "phone")
    .required(),
  items: Joi.array().items(orderItemSchema).min(1).required(),
  deliveryAddress: Joi.object({
    addressLine1: Joi.string().required(),
    addressLine2: Joi.string().allow(null, ""),
    city: Joi.string().allow(null, ""),
    state: Joi.string().allow(null, ""),
    landmark: Joi.string().allow(null, ""),
    notes: Joi.string().allow(null, ""),
  }).required(),
  distanceKm: Joi.number().min(0).allow(null),
  orderNotes: Joi.string().max(500).allow(null, ""),
});

const initPaymentSchema = Joi.object({
  orderId: Joi.string().required(),
  email: Joi.string().email().allow(null, ""),
});

const newsletterSchema = Joi.object({
  email: Joi.string().email().required(),
  source: Joi.string().allow(null, ""),
});

const contactSchema = Joi.object({
  name: Joi.string().min(2).required(),
  email: Joi.string().email().required(),
  subject: Joi.string().max(150).allow(null, ""),
  message: Joi.string().min(2).max(2000).required(),
});

const careerSchema = Joi.object({
  name: Joi.string().min(2).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().allow(null, ""),
  position: Joi.string().min(2).required(),
  coverLetter: Joi.string().max(4000).allow(null, ""),
});

module.exports = { createOrderSchema, initPaymentSchema, newsletterSchema, contactSchema, careerSchema };
