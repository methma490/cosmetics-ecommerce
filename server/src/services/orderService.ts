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

import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";

const router = Router();

/*
|--------------------------------------------------------------------------
| CUSTOMER / ADMIN ORDER ROUTES
|--------------------------------------------------------------------------
|
| Both customer and admin are authenticated users.
| Therefore both can create orders and view their own orders.
|
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
| CREATE ORDER
|--------------------------------------------------------------------------
| POST /api/orders
|
| Access:
| Customer = YES
| Admin    = YES
| Guest    = NO
|--------------------------------------------------------------------------
*/

router.post(
  "/",
  protect,
  createOrder
);

/*
|--------------------------------------------------------------------------
| GET LOGGED-IN USER'S ORDERS
|--------------------------------------------------------------------------
| GET /api/orders/my-orders
|
| Access:
| Customer = YES
| Admin    = YES
| Guest    = NO
|--------------------------------------------------------------------------
*/

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
| Keep these routes BEFORE "/:id".
|
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
| GET ALL ORDERS
|--------------------------------------------------------------------------
| GET /api/orders/admin/all
|
| Optional filters:
|
| /api/orders/admin/all?status=pending
| /api/orders/admin/all?paymentStatus=paid
| /api/orders/admin/all?paymentMethod=whatsapp
|
| Access:
| Customer = NO
| Admin    = YES
|--------------------------------------------------------------------------
*/

router.get(
  "/admin/all",
  protect,
  adminOnly,
  getAllOrders
);

/*
|--------------------------------------------------------------------------
| UPDATE ORDER STATUS
|--------------------------------------------------------------------------
| PATCH /api/orders/admin/:id/status
|
| Example body:
|
| {
|   "orderStatus": "confirmed"
| }
|
| Allowed:
| pending
| confirmed
| processing
| shipped
| delivered
| cancelled
|
| Access:
| Customer = NO
| Admin    = YES
|--------------------------------------------------------------------------
*/

router.patch(
  "/admin/:id/status",
  protect,
  adminOnly,
  updateOrderStatus
);

/*
|--------------------------------------------------------------------------
| UPDATE PAYMENT STATUS
|--------------------------------------------------------------------------
| PATCH /api/orders/admin/:id/payment-status
|
| Example body:
|
| {
|   "paymentStatus": "paid"
| }
|
| Allowed:
| pending
| paid
| failed
| refunded
|
| Access:
| Customer = NO
| Admin    = YES
|
| NOTE:
| This is manual/admin controlled for now.
| Later PayHere callback will automatically update payment status.
|--------------------------------------------------------------------------
*/

router.patch(
  "/admin/:id/payment-status",
  protect,
  adminOnly,
  updatePaymentStatus
);

/*
|--------------------------------------------------------------------------
| WHATSAPP ORDER
|--------------------------------------------------------------------------
| GET /api/orders/:id/whatsapp
|
| Generates:
| - WhatsApp message
| - WhatsApp wa.me URL
|
| Customer:
| Can access ONLY their own order.
|
| Admin:
| Can access any order.
|
|--------------------------------------------------------------------------
*/

router.get(
  "/:id/whatsapp",
  protect,
  getWhatsAppOrder
);

/*
|--------------------------------------------------------------------------
| GET SINGLE ORDER
|--------------------------------------------------------------------------
| GET /api/orders/:id
|
| Customer:
| Can access ONLY their own order.
|
| Admin:
| Can access any order.
|
|--------------------------------------------------------------------------
*/

router.get(
  "/:id",
  protect,
  getOrderById
);

export default router;