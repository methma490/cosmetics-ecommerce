import { Router } from "express";
import { uploadImages } from "../controllers/uploadController.js";
import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = Router();

/**
 * POST /api/upload
 * Protected route for admin to upload product/category images to Cloudinary
 */
router.post(
  "/",
  protect,
  adminOnly,
  upload.any(),
  uploadImages
);

export default router;
