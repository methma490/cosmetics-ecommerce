import type { Request, Response } from "express";
import mongoose from "mongoose";

import Order from "../models/order.js";
import Product from "../models/product.js";

import {
  formatPayHereAmount,
  generatePayHereHash,
  getPayHereConfig,
  verifyPayHereNotification,
} from "../services/payhereService.js";

/**
 * =========================================================
 * CREATE PAYHERE CHECKOUT DATA
 * =========================================================
 *
 * Route:
 * POST /api/payments/payhere/initiate/:orderId
 *
 * Protected route.
 *
 * Customer can initiate payment only for their own order.
 * Admin can initiate any PayHere order.
 */
export const initiatePayHerePayment = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { orderId } = req.params;

    const userId = req.user?.userId;
    const role = req.user?.role;

    // userId is optional: allows guests to initiate PayHere payment for guest orders

    if (
      typeof orderId !== "string" ||
      !mongoose.Types.ObjectId.isValid(orderId)
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
      return;
    }

    const order = await Order.findById(orderId);

    if (!order) {
      res.status(404).json({
        success: false,
        message: "Order not found",
      });
      return;
    }

    // Customer can only pay for their own order (if order has an assigned user)
    if (
      order.user &&
      role !== "admin" &&
      order.user.toString() !== userId
    ) {
      res.status(403).json({
        success: false,
        message: "You are not allowed to access this order",
      });
      return;
    }

    if (order.paymentMethod !== "payhere") {
      res.status(400).json({
        success: false,
        message: "This order does not use PayHere payment",
      });
      return;
    }

    if (order.paymentStatus === "paid") {
      res.status(400).json({
        success: false,
        message: "This order has already been paid",
      });
      return;
    }

    if (order.orderStatus === "cancelled") {
      res.status(400).json({
        success: false,
        message: "Cannot pay for a cancelled order",
      });
      return;
    }

    const config = getPayHereConfig();

    const amount = formatPayHereAmount(order.total);

    /*
     * IMPORTANT:
     * We use our public orderNumber as PayHere's order_id.
     *
     * Example:
     * ORD-1791289642180-1297
     */
    const payHereOrderId = order.orderNumber;

    const hash = generatePayHereHash(
      payHereOrderId,
      order.total,
      config.currency
    );

    const address = [
      order.customer.address,
      order.customer.apartment,
    ]
      .filter(Boolean)
      .join(", ");

    const itemDescription =
      order.items.length === 1
        ? order.items[0].name
        : `Cosmetics Order ${order.orderNumber}`;

    const payment = {
      sandbox: true,

      checkout_url: config.sandboxUrl,

      merchant_id: config.merchantId,

      return_url: config.returnUrl,
      cancel_url: config.cancelUrl,
      notify_url: config.notifyUrl,

      order_id: payHereOrderId,

      items: itemDescription,

      currency: config.currency,
      amount,

      first_name: order.customer.firstName,
      last_name: order.customer.lastName,
      email: order.customer.email,
      phone: order.customer.phone,

      address,
      city: order.customer.city,
      country: order.customer.country,

      hash,
    };

    res.status(200).json({
      success: true,
      message: "PayHere payment data generated successfully",
      order: {
        _id: order._id,
        orderNumber: order.orderNumber,
        total: order.total,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
      },
      payment,
    });
  } catch (error) {
    console.error("Initiate PayHere payment error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to initiate PayHere payment",
    });
  }
};

/**
 * =========================================================
 * PAYHERE NOTIFICATION / CALLBACK
 * =========================================================
 *
 * Route:
 * POST /api/payments/payhere/notify
 *
 * IMPORTANT:
 * This route MUST NOT use protect middleware.
 *
 * PayHere's server calls this endpoint.
 *
 * PayHere sends:
 * application/x-www-form-urlencoded
 */
export const handlePayHereNotification = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      merchant_id,
      order_id,
      payment_id,
      payhere_amount,
      payhere_currency,
      status_code,
      md5sig,
    } = req.body;

    /*
     * Make sure required PayHere fields exist.
     */
    if (
      !merchant_id ||
      !order_id ||
      !payhere_amount ||
      !payhere_currency ||
      status_code === undefined ||
      !md5sig
    ) {
      console.error(
        "PayHere callback missing required fields:",
        req.body
      );

      res.status(400).send("Missing required fields");
      return;
    }

    /*
     * Verify that this notification really came with
     * a valid PayHere signature.
     */
    const isValid = verifyPayHereNotification({
      merchantId: String(merchant_id),
      orderId: String(order_id),
      amount: String(payhere_amount),
      currency: String(payhere_currency),
      statusCode: String(status_code),
      md5sig: String(md5sig),
    });

    if (!isValid) {
      console.error(
        `Invalid PayHere signature for order ${order_id}`
      );

      res.status(400).send("Invalid signature");
      return;
    }

    /*
     * We sent order.orderNumber to PayHere as order_id.
     */
    const order = await Order.findOne({
      orderNumber: String(order_id),
    });

    if (!order) {
      console.error(
        `PayHere callback order not found: ${order_id}`
      );

      res.status(404).send("Order not found");
      return;
    }

    /*
     * Extra security:
     * verify currency.
     */
    const expectedCurrency =
      process.env.PAYHERE_CURRENCY || "LKR";

    if (
      String(payhere_currency).toUpperCase() !==
      expectedCurrency.toUpperCase()
    ) {
      console.error(
        `PayHere currency mismatch for ${order.orderNumber}`
      );

      res.status(400).send("Currency mismatch");
      return;
    }

    /*
     * Extra security:
     * verify PayHere amount against OUR database total.
     *
     * Never trust payment amount only because it came
     * from the request.
     */
    const expectedAmount =
      formatPayHereAmount(order.total);

    const receivedAmount =
      Number(payhere_amount).toFixed(2);

    if (expectedAmount !== receivedAmount) {
      console.error(
        `PayHere amount mismatch for ${order.orderNumber}. ` +
          `Expected ${expectedAmount}, received ${receivedAmount}`
      );

      res.status(400).send("Amount mismatch");
      return;
    }

    const statusCode = String(status_code);

    /**
     * PayHere:
     *
     *  2  = successful
     *  0  = pending
     * -1  = cancelled
     * -2  = failed
     * -3  = chargedback
     */

    if (statusCode === "2") {
      /*
       * =====================================================
       * SUCCESSFUL PAYMENT
       * =====================================================
       */

      /*
       * Callback may be delivered/retried more than once.
       *
       * If already processed, do NOT deduct inventory again.
       */
      if (
        order.paymentStatus === "paid" &&
        order.inventoryDeducted
      ) {
        res.status(200).send("OK");
        return;
      }

      /*
       * We check inventory BEFORE changing quantities.
       */
      if (!order.inventoryDeducted) {
        for (const item of order.items) {
          const product = await Product.findById(
            item.product
          );

          if (!product) {
            console.error(
              `Product missing while confirming PayHere order: ${item.product}`
            );

            res.status(409).send(
              "Product no longer exists"
            );
            return;
          }

          if (product.stock < item.quantity) {
            console.error(
              `Insufficient stock for product ${product._id}`
            );

            res.status(409).send(
              "Insufficient product stock"
            );
            return;
          }
        }

        /*
         * All stock checks passed.
         * Now deduct inventory.
         */
        for (const item of order.items) {
          await Product.findByIdAndUpdate(
            item.product,
            {
              $inc: {
                stock: -item.quantity,
              },
            }
          );
        }

        order.inventoryDeducted = true;
      }

      order.paymentStatus = "paid";

      /*
       * Save PayHere's payment ID when available.
       */
      if (payment_id) {
        order.payHerePaymentId =
          String(payment_id);
      }

      /*
       * Automatically confirm the order after
       * verified successful payment.
       */
      if (order.orderStatus === "pending") {
        order.orderStatus = "confirmed";
      }

      await order.save();

      console.log(
        `PayHere payment successful: ${order.orderNumber}`
      );

      res.status(200).send("OK");
      return;
    }

    /*
     * =====================================================
     * PENDING PAYMENT
     * =====================================================
     */
    if (statusCode === "0") {
      order.paymentStatus = "pending";

      await order.save();

      res.status(200).send("OK");
      return;
    }

    /*
     * =====================================================
     * FAILED / CANCELLED
     * =====================================================
     *
     * Your Order model currently uses:
     *
     * pending | paid | failed | refunded
     *
     * Therefore PayHere cancellation/failure is stored
     * as "failed".
     */
    if (
      statusCode === "-1" ||
      statusCode === "-2"
    ) {
      /*
       * Do not overwrite an already successful payment
       * with a later failed notification.
       */
      if (order.paymentStatus !== "paid") {
        order.paymentStatus = "failed";
        await order.save();
      }

      res.status(200).send("OK");
      return;
    }

    /*
     * =====================================================
     * CHARGEBACK
     * =====================================================
     *
     * Your existing schema has "refunded", but not
     * "chargedback", so we map -3 to refunded for now.
     */
    if (statusCode === "-3") {
      order.paymentStatus = "refunded";

      await order.save();

      res.status(200).send("OK");
      return;
    }

    /*
     * Unknown PayHere status.
     */
    console.warn(
      `Unknown PayHere status ${statusCode} for ${order.orderNumber}`
    );

    res.status(200).send("OK");
  } catch (error) {
    console.error(
      "PayHere notification error:",
      error
    );

    res.status(500).send("Internal server error");
  }
};

/**
 * =========================================================
 * GET PAYMENT STATUS BY ORDER ID
 * =========================================================
 *
 * Route:
 * GET /api/payments/:orderId/status
 *
 * Protected route.
 * Customer can access own order; Admin can access any order.
 */
export const getPaymentStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { orderId } = req.params;
    const userId = req.user?.userId;
    const role = req.user?.role;

    // userId is optional: allows guest order status queries

    if (
      typeof orderId !== "string" ||
      !orderId.trim()
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid order identifier",
      });
      return;
    }

    const isObjectId = mongoose.Types.ObjectId.isValid(orderId);
    const order = isObjectId
      ? await Order.findById(orderId)
      : await Order.findOne({ orderNumber: orderId.trim() });

    if (!order) {
      res.status(404).json({
        success: false,
        message: "Order not found",
      });
      return;
    }

    if (
      order.user &&
      role !== "admin" &&
      order.user.toString() !== userId
    ) {
      res.status(403).json({
        success: false,
        message: "You are not allowed to access this order",
      });
      return;
    }

    res.status(200).json({
      success: true,
      orderId: order._id,
      orderNumber: order.orderNumber,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      orderStatus: order.orderStatus,
      total: order.total,
      currency: "LKR",
    });
  } catch (error) {
    console.error("Get payment status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get payment status",
    });
  }
};