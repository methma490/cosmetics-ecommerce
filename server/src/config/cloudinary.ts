import { v2 as cloudinary } from "cloudinary";

/**
 * Cloudinary configuration
 * Supports both:
 * 1. CLOUDINARY_URL=cloudinary://<api_key>:<api_secret>@<cloud_name>
 * 2. Individual credentials:
 *    CLOUDINARY_CLOUD_NAME
 *    CLOUDINARY_API_KEY
 *    CLOUDINARY_API_SECRET
 */
if (process.env.CLOUDINARY_URL) {
  cloudinary.config({
    cloudinary_url: process.env.CLOUDINARY_URL,
    secure: true,
  });
} else {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

export const isCloudinaryConfigured = (): boolean => {
  return Boolean(
    process.env.CLOUDINARY_URL ||
      (process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET)
  );
};

export default cloudinary;
