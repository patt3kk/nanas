const asyncHandler = require("../utils/asyncHandler");
const { createCareerApplication } = require("../services/career.service");
const { uploadBufferToCloudinary } = require("../services/upload.service");

exports.apply = asyncHandler(async (req, res) => {
  let cvUrl;
  if (req.file) {
    const uploaded = await uploadBufferToCloudinary({
      buffer: req.file.buffer,
      filename: req.file.originalname,
      folder: "nanas-akara/cvs",
      resourceType: "raw",
    });
    cvUrl = uploaded.secure_url;
  }

  const application = await createCareerApplication({ ...req.body, cvUrl });
  res.status(201).json({ success: true, application });
});

