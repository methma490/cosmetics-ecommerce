import { Router } from "express";

import {
  createOrder,
  getAllOrders,
  getMyOrders,
  getOrderById,
  getWhatsAppOrder,
  updateOrderStatus,
  updatePaymentStatus,
  deleteOrder,
} from "../controllers/orderController.js";

import {
  protect,
  optionalAuth,
} from "../middleware/authMiddleware.js";

import {
  adminOnly,
} from "../middleware/adminMiddleware.js";

const router = Router();

/*
|--------------------------------------------------------------------------
| CUSTOMER ROUTES
|--------------------------------------------------------------------------
*/

router.post(
  "/",
  optionalAuth,
  createOrder
);

router.get(
  "/my-orders",
  protect,
  getMyOrders
);

/*
|--------------------------------------------------------------------------
| ADMIN ROUTES
|--------------------------------------------------------------------------
|
| IMPORTANT:
| Keep these ABOVE /:id.
|--------------------------------------------------------------------------
*/

router.get(
  "/admin/all",
  protect,
  adminOnly,
  getAllOrders
);

router.get(
  "/",
  protect,
  adminOnly,
  getAllOrders
);

router.patch(
  "/admin/:id/status",
  protect,
  adminOnly,
  updateOrderStatus
);

router.patch(
  "/admin/:id/payment-status",
  protect,
  adminOnly,
  updatePaymentStatus
);

router.delete(
  "/admin/:id",
  protect,
  adminOnly,
  deleteOrder
);

/*
|--------------------------------------------------------------------------
| CUSTOMER / ADMIN SINGLE ORDER
|--------------------------------------------------------------------------
|
| Must stay after specific routes like /admin/all.
|--------------------------------------------------------------------------
*/

router.get(
  "/:id",
  optionalAuth,
  getOrderById
);

router.get(
  "/:id/whatsapp",
  optionalAuth,
  getWhatsAppOrder
);

export default router;