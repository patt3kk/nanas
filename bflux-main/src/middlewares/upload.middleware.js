const multer = require("multer");
const path = require("path");
const { APIError } = require("./errorApi");
const { env } = require("../config");

const storage = multer.memoryStorage();

const allowedMimeByExtension = {
  ".jpg": ["image/jpeg"],
  ".jpeg": ["image/jpeg"],
  ".png": ["image/png"],
  ".webp": ["image/webp"],
  ".gif": ["image/gif"],
  ".pdf": ["application/pdf"],
  ".doc": ["application/msword"],
  ".docx": ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
};

const fileFilter = (_req, file, cb) => {
  if (!file.mimetype) return cb(APIError.badRequest("Invalid file"), false);
  const mimeType = String(file.mimetype || "").toLowerCase();
  const extension = path.extname(String(file.originalname || "")).toLowerCase();
  const expectedMimeTypes = allowedMimeByExtension[extension];

  if (!expectedMimeTypes) {
    return cb(APIError.badRequest("Unsupported file extension"), false);
  }

  if (!expectedMimeTypes.includes(mimeType)) {
    return cb(APIError.badRequest("File type does not match file extension"), false);
  }

  if (extension === ".gif" && mimeType.startsWith("image/")) {
    return cb(null, true);
  }

  if (mimeType.startsWith("image/") || expectedMimeTypes.includes(mimeType)) return cb(null, true);
  return cb(APIError.badRequest("Unsupported file type"), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: env.UPLOAD_MAX_FILE_SIZE_MB * 1024 * 1024 },
});

module.exports = { upload };
