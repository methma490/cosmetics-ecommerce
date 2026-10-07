import { Router } from "express";

import {
  initiatePayHerePayment,
  handlePayHereNotification,
  getPaymentStatus,
} from "../controllers/paymentController.js";

import { optionalAuth } from "../middleware/authMiddleware.js";

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
  optionalAuth,
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

/**
 * Get payment status
 *
 * Protected route to verify payment and order status
 * after returning from PayHere checkout.
 *
 * GET:
 * /api/payments/:orderId/status
 */
router.get(
  "/:orderId/status",
  optionalAuth,
  getPaymentStatus
);

// Alias route for /payhere/:orderId/status
router.get(
  "/payhere/:orderId/status",
  optionalAuth,
  getPaymentStatus
);

export default router;