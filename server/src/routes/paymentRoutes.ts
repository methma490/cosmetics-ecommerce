import { Router } from "express";

import {
  initiatePayHerePayment,
  handlePayHereNotification,
} from "../controllers/paymentController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = Router();

/**
 * =========================================================
 * PAYHERE PAYMENT ROUTES
 * =========================================================
 */

/**
 * Initiate PayHere payment
 *
 * Protected because only the logged-in customer who owns
 * the order (or admin) should be able to initiate payment.
 *
 * POST:
 * /api/payments/payhere/initiate/:orderId
 */
router.post(
  "/payhere/initiate/:orderId",
  protect,
  initiatePayHerePayment
);

/**
 * PayHere payment notification / callback
 *
 * IMPORTANT:
 * DO NOT add protect middleware here.
 *
 * PayHere's server calls this URL directly, so there will
 * be no customer JWT cookie.
 *
 * POST:
 * /api/payments/payhere/notify
 */
router.post(
  "/payhere/notify",
  handlePayHereNotification
);

export default router;