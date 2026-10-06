import { Router } from "express";

import {
  createOrder,
  getAllOrders,
  getMyOrders,
  getOrderById,
  getWhatsAppOrder,
  updateOrderStatus,
  updatePaymentStatus,
} from "../controllers/orderController.js";

import {
  protect,
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
  protect,
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
  protect,
  getOrderById
);

router.get(
  "/:id/whatsapp",
  protect,
  getWhatsAppOrder
);

export default router;