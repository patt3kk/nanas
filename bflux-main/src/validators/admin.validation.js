const Joi = require("joi");

const createUserSchema = Joi.object({
  name: Joi.string().min(2).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid("admin", "super-admin").default("admin"),
  isActive: Joi.boolean().default(true),
});

const updateUserSchema = Joi.object({
  name: Joi.string().min(2),
  email: Joi.string().email(),
  password: Joi.string().min(6),
  role: Joi.string().valid("admin", "super-admin"),
  isActive: Joi.boolean(),
});

const resetPasswordSchema = Joi.object({
  password: Joi.string().min(6).required(),
});

module.exports = { createUserSchema, updateUserSchema, resetPasswordSchema };
