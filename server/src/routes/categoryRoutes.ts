import { Router } from "express";

import {
  createCategory,
  deleteCategory,
  getCategories,
  getCategoryBySlug,
  updateCategory,
} from "../controllers/categoryController.js";

import { protect, optionalAuth } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";

const router = Router();

/*
|--------------------------------------------------------------------------
| Public (with optional auth for admin context)
|--------------------------------------------------------------------------
*/

router.get(
  "/",
  optionalAuth,
  getCategories
);

router.get(
  "/:slug",
  getCategoryBySlug
);

/*
|--------------------------------------------------------------------------
| Admin
|--------------------------------------------------------------------------
*/

router.post(
  "/",
  protect,
  adminOnly,
  createCategory
);

router.patch(
  "/:id",
  protect,
  adminOnly,
  updateCategory
);

router.delete(
  "/:id",
  protect,
  adminOnly,
  deleteCategory
);

export default router;