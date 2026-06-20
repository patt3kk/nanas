const mongoose = require("mongoose");
const slugify = require("slugify");

const nutritionInfoSchema = new mongoose.Schema(
  {
    calories: { type: Number },
    protein: { type: Number },
    carbs: { type: Number },
    fat: { type: Number },
  },
  { _id: false }
);

const menuItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    slug: { type: String, required: true, trim: true, unique: true, index: true },
    description: { type: String, trim: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true, index: true },
    price: { type: Number, required: true, min: 0 },
    discountedPrice: { type: Number, min: 0 },
    images: [{ type: String, trim: true }],
    ingredients: [{ type: String, trim: true }],
    tags: [{ type: String, trim: true }],
    isFeatured: { type: Boolean, default: false, index: true },
    isAvailable: { type: Boolean, default: true, index: true },
    stockStatus: { type: String, enum: ["in_stock", "out_of_stock", "limited"], default: "in_stock" },
    nutritionInfo: nutritionInfoSchema,
    sortOrder: { type: Number, default: 0, index: true },
  },
  { timestamps: true }
);

menuItemSchema.pre("validate", function preValidate(next) {
  if (!this.slug && this.name) this.slug = slugify(this.name, { lower: true, strict: true });
  next();
});

module.exports = mongoose.model("MenuItem", menuItemSchema);

