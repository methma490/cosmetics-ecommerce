import { Router } from "express";

import {
  createProduct,
  deleteProduct,
  getProductBySlug,
  getProducts,
  updateProduct,
} from "../controllers/productController.js";

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
  getProducts
);

router.get(
  "/:slug",
  optionalAuth,
  getProductBySlug
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
  createProduct
);

router.patch(
  "/:id",
  protect,
  adminOnly,
  updateProduct
);

router.delete(
  "/:id",
  protect,
  adminOnly,
  deleteProduct
);

export default router;