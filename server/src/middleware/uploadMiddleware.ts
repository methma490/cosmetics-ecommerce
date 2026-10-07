import multer from "multer";
import type { Request } from "express";

// Store uploaded files in memory as Buffers for direct streaming to Cloudinary
const storage = multer.memoryStorage();

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/avif",
  ];

  if (allowedMimeTypes.includes(file.mimetype.toLowerCase())) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Unsupported file type: ${file.mimetype}. Allowed types: JPG, PNG, WEBP, GIF, AVIF.`
      )
    );
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max per file
    files: 10, // Max 10 files per request
  },
});

export const uploadSingle = upload.single("image");
export const uploadMultiple = upload.array("images", 10);
