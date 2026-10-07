import type { Request, Response } from "express";
import cloudinary, { isCloudinaryConfigured } from "../config/cloudinary.js";

/**
 * Helper to upload a Buffer stream to Cloudinary
 */
const streamUpload = (
  buffer: Buffer,
  folder: string = "cosmetics_ecommerce/products"
): Promise<{ url: string; publicId: string }> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        if (!result) {
          return reject(new Error("Cloudinary upload returned empty result"));
        }
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    );

    stream.end(buffer);
  });
};

/**
 * POST /api/upload
 * Handles single or multiple image uploads to Cloudinary
 */
export const uploadImages = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!isCloudinaryConfigured()) {
      res.status(400).json({
        success: false,
        message:
          "Cloudinary credentials are not configured. Please add CLOUDINARY_URL (or CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET) to server/.env",
      });
      return;
    }

    const files: Express.Multer.File[] = [];

    if (req.file) {
      files.push(req.file);
    } else if (req.files && Array.isArray(req.files)) {
      files.push(...req.files);
    }

    if (files.length === 0) {
      res.status(400).json({
        success: false,
        message: "No image files provided for upload",
      });
      return;
    }

    const folder = typeof req.body?.folder === "string" && req.body.folder.trim()
      ? req.body.folder.trim()
      : "cosmetics_ecommerce/products";

    const uploadPromises = files.map((file) => streamUpload(file.buffer, folder));
    const uploadResults = await Promise.all(uploadPromises);

    const urls = uploadResults.map((r) => r.url);

    res.status(200).json({
      success: true,
      message: `${files.length} image(s) uploaded successfully to Cloudinary`,
      urls,
      images: uploadResults,
    });
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to upload image(s) to Cloudinary",
    });
  }
};
