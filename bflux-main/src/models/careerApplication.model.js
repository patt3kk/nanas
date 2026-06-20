const mongoose = require("mongoose");

const careerApplicationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true, index: true },
    phone: { type: String, trim: true },
    position: { type: String, required: true, trim: true },
    coverLetter: { type: String, trim: true },
    cvUrl: { type: String, trim: true },
    status: { type: String, enum: ["submitted", "reviewing", "shortlisted", "rejected", "hired"], default: "submitted", index: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("CareerApplication", careerApplicationSchema);

