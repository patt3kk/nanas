const { Readable } = require("stream");
const { cloudinary } = require("../config/cloudinary");
const { APIError } = require("../middlewares/errorApi");

const uploadBufferToCloudinary = async ({ buffer, filename, folder, resourceType = "image" }) => {
  if (!cloudinary.config().cloud_name) throw APIError.internalServerError("Cloudinary is not configured");
  if (!buffer) throw APIError.badRequest("File buffer is required");

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
        public_id: filename ? filename.replace(/\.[^/.]+$/, "") : undefined,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    Readable.from(buffer).pipe(uploadStream);
  });
};

module.exports = { uploadBufferToCloudinary };
