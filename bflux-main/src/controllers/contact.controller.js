const asyncHandler = require("../utils/asyncHandler");
const { createContactMessage } = require("../services/contact.service");

exports.createMessage = asyncHandler(async (req, res) => {
  const message = await createContactMessage(req.body);
  res.status(201).json({ success: true, message });
});

