import type {
  Request,
  Response,
} from "express";

import mongoose from "mongoose";

import Order, {
  type OrderStatus,
  type PaymentMethod,
  type PaymentStatus,
} from "../models/order.js";

import Product from "../models/product.js";
import Cart from "../models/cart.js";

import generateOrderNumber from "../utils/generateOrderNumber.js";

import {
  generateWhatsAppOrderMessage,
  generateWhatsAppOrderUrl,
} from "../services/whatsappService.js";

/*
|--------------------------------------------------------------------------
| GET WHATSAPP ORDER DATA
|--------------------------------------------------------------------------
| Order owner or admin
|--------------------------------------------------------------------------
*/

export const getWhatsAppOrder = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const userId =
      req.user?.userId;

    const role =
      req.user?.role;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });

      return;
    }

    if (
      typeof id !== "string" ||
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });

      return;
    }

    const order =
      await Order.findById(id);

    if (!order) {
      res.status(404).json({
        success: false,
        message: "Order not found",
      });

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | Security
    |--------------------------------------------------------------------------
    |
    | Customer can only access own order.
    | Admin can access any order.
    |--------------------------------------------------------------------------
    */

    if (
      role !== "admin" &&
      order.user.toString() !== userId
    ) {
      res.status(403).json({
        success: false,
        message:
          "You are not allowed to access this order",
      });

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | Only WhatsApp orders
    |--------------------------------------------------------------------------
    */

    if (
      order.paymentMethod !== "whatsapp"
    ) {
      res.status(400).json({
        success: false,
        message:
          "This order does not use WhatsApp ordering",
      });

      return;
    }

    const message =
      generateWhatsAppOrderMessage(order);

    const whatsappUrl =
      generateWhatsAppOrderUrl(order);

    res.status(200).json({
      success: true,

      orderNumber:
        order.orderNumber,

      message,

      whatsappUrl,
    });
  } catch (error) {
    console.error(
      "Generate WhatsApp order error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Unable to generate WhatsApp order",
    });
  }
};
/*
|--------------------------------------------------------------------------
| SHIPPING
|--------------------------------------------------------------------------
|
| Keep it simple for this assessment.
|
| We can later move this into environment/config if required.
|--------------------------------------------------------------------------
*/

const SHIPPING_FEE = 500;
const FREE_SHIPPING_THRESHOLD = 8000;

/*
|--------------------------------------------------------------------------
| REQUEST ITEM
|--------------------------------------------------------------------------
*/

interface CreateOrderItemInput {
  product: string;
  quantity: number;
}

/*
|--------------------------------------------------------------------------
| CREATE ORDER
|--------------------------------------------------------------------------
| Logged-in customer
|--------------------------------------------------------------------------
*/

export const createOrder = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    /*
    |--------------------------------------------------------------------------
    | Logged-in user
    |--------------------------------------------------------------------------
    |
    | This assumes your auth middleware already sets req.user.
    |--------------------------------------------------------------------------
    */

    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message:
          "Authentication required",
      });

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | Request body
    |--------------------------------------------------------------------------
    */

    const {
      items,
      customer,
      paymentMethod,
    } = req.body;

    /*
    |--------------------------------------------------------------------------
    | Validate items
    |--------------------------------------------------------------------------
    */

    if (
      !Array.isArray(items) ||
      items.length === 0
    ) {
      res.status(400).json({
        success: false,
        message:
          "Order must contain at least one product",
      });

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | Validate customer object
    |--------------------------------------------------------------------------
    */

    if (
      !customer ||
      typeof customer !== "object"
    ) {
      res.status(400).json({
        success: false,
        message:
          "Customer information is required",
      });

      return;
    }

    const {
      firstName,
      lastName,
      email,
      phone,
      address,
      apartment,
      city,
      postalCode,
      country,
    } = customer;

    /*
    |--------------------------------------------------------------------------
    | Required customer fields
    |--------------------------------------------------------------------------
    */

    if (
      typeof firstName !== "string" ||
      !firstName.trim() ||
      typeof lastName !== "string" ||
      !lastName.trim() ||
      typeof email !== "string" ||
      !email.trim() ||
      typeof phone !== "string" ||
      !phone.trim() ||
      typeof address !== "string" ||
      !address.trim() ||
      typeof city !== "string" ||
      !city.trim()
    ) {
      res.status(400).json({
        success: false,
        message:
          "First name, last name, email, phone, address and city are required",
      });

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | Simple email validation
    |--------------------------------------------------------------------------
    */

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
      !emailRegex.test(
        email.trim()
      )
    ) {
      res.status(400).json({
        success: false,
        message:
          "Please provide a valid email address",
      });

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | Optional fields validation
    |--------------------------------------------------------------------------
    */

    if (
      apartment !== undefined &&
      typeof apartment !== "string"
    ) {
      res.status(400).json({
        success: false,
        message:
          "Apartment must be text",
      });

      return;
    }

    if (
      postalCode !== undefined &&
      typeof postalCode !== "string"
    ) {
      res.status(400).json({
        success: false,
        message:
          "Postal code must be text",
      });

      return;
    }

    if (
      country !== undefined &&
      typeof country !== "string"
    ) {
      res.status(400).json({
        success: false,
        message:
          "Country must be text",
      });

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | Payment method
    |--------------------------------------------------------------------------
    */

    const allowedPaymentMethods:
      PaymentMethod[] = [
        "payhere",
        "whatsapp",
      ];

    if (
      typeof paymentMethod !== "string" ||
      !allowedPaymentMethods.includes(
        paymentMethod as PaymentMethod
      )
    ) {
      res.status(400).json({
        success: false,
        message:
          "Payment method must be payhere or whatsapp",
      });

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | Validate all cart items
    |--------------------------------------------------------------------------
    */

    const validatedItems:
      CreateOrderItemInput[] = [];

    for (const item of items) {
      if (
        !item ||
        typeof item !== "object"
      ) {
        res.status(400).json({
          success: false,
          message:
            "Invalid order item",
        });

        return;
      }

      const {
        product,
        quantity,
      } = item;

      if (
        typeof product !== "string" ||
        !mongoose.Types.ObjectId.isValid(
          product
        )
      ) {
        res.status(400).json({
          success: false,
          message:
            "Invalid product ID in cart",
        });

        return;
      }

      const numericQuantity =
        Number(quantity);

      if (
        !Number.isInteger(
          numericQuantity
        ) ||
        numericQuantity <= 0
      ) {
        res.status(400).json({
          success: false,
          message:
            "Product quantity must be a positive whole number",
        });

        return;
      }

      validatedItems.push({
        product,
        quantity:
          numericQuantity,
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Combine duplicate products
    |--------------------------------------------------------------------------
    |
    | If frontend accidentally sends:
    |
    | product A x 2
    | product A x 3
    |
    | backend treats it as product A x 5.
    |--------------------------------------------------------------------------
    */

    const quantityMap =
      new Map<string, number>();

    for (
      const item of validatedItems
    ) {
      const currentQuantity =
        quantityMap.get(
          item.product
        ) ?? 0;

      quantityMap.set(
        item.product,
        currentQuantity +
          item.quantity
      );
    }

    const productIds =
      Array.from(
        quantityMap.keys()
      );

    /*
    |--------------------------------------------------------------------------
    | Load real products from database
    |--------------------------------------------------------------------------
    */

    const products =
      await Product.find({
        _id: {
          $in: productIds,
        },

        isActive: true,
      });

    /*
    |--------------------------------------------------------------------------
    | Ensure all products exist
    |--------------------------------------------------------------------------
    */

    if (
      products.length !==
      productIds.length
    ) {
      res.status(400).json({
        success: false,
        message:
          "One or more products are unavailable",
      });

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | Build trusted order items
    |--------------------------------------------------------------------------
    |
    | PRICE COMES FROM DATABASE.
    | Never trust frontend prices.
    |--------------------------------------------------------------------------
    */

    const orderItems = [];

    let subtotal = 0;

    for (const product of products) {
      const productId =
        product._id.toString();

      const quantity =
        quantityMap.get(
          productId
        );

      if (!quantity) {
        continue;
      }

      /*
      |--------------------------------------------------------------------------
      | Check stock
      |--------------------------------------------------------------------------
      */

      if (
        product.stock < quantity
      ) {
        res.status(400).json({
          success: false,
          message:
            `Insufficient stock for ${product.name}. Available: ${product.stock}`,
        });

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | Calculate subtotal
      |--------------------------------------------------------------------------
      */

      const itemSubtotal =
        product.price *
        quantity;

      subtotal +=
        itemSubtotal;

      orderItems.push({
        product:
          product._id,

        name:
          product.name,

        image:
          product.images.length > 0
            ? product.images[0]
            : undefined,

        price:
          product.price,

        quantity,

        subtotal:
          itemSubtotal,
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Calculate final total
    |--------------------------------------------------------------------------
    */

    const shippingFee =
      subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;

    const total =
      subtotal +
      shippingFee;

    /*
    |--------------------------------------------------------------------------
    | Generate order number
    |--------------------------------------------------------------------------
    */

    let orderNumber =
      generateOrderNumber();

    /*
    |--------------------------------------------------------------------------
    | Very small collision protection
    |--------------------------------------------------------------------------
    */

    while (
      await Order.exists({
        orderNumber,
      })
    ) {
      orderNumber =
        generateOrderNumber();
    }

    /*
    |--------------------------------------------------------------------------
    | Create order
    |--------------------------------------------------------------------------
    */

    const order =
      await Order.create({
        orderNumber,

        user: userId,

        customer: {
          firstName:
            firstName.trim(),

          lastName:
            lastName.trim(),

          email:
            email
              .trim()
              .toLowerCase(),

          phone:
            phone.trim(),

          address:
            address.trim(),

          apartment:
            typeof apartment ===
              "string" &&
            apartment.trim()
              ? apartment.trim()
              : undefined,

          city:
            city.trim(),

          postalCode:
            typeof postalCode ===
              "string" &&
            postalCode.trim()
              ? postalCode.trim()
              : undefined,

          country:
            typeof country ===
              "string" &&
            country.trim()
              ? country.trim()
              : "Sri Lanka",
        },

        items:
          orderItems,

        subtotal,

        shippingFee,

        total,

        paymentMethod:
          paymentMethod as PaymentMethod,

        paymentStatus:
          "pending",

        orderStatus:
          "pending",

        inventoryDeducted:
          false,
      });

    // Clear user's database cart upon order creation
    await Cart.findOneAndUpdate({ user: userId }, { items: [] });

    /*
    |--------------------------------------------------------------------------
    | Response
    |--------------------------------------------------------------------------
    */

    res.status(201).json({
      success: true,

      message:
        "Order created successfully",

      order,
    });
  } catch (error) {
    console.error(
      "Create order error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Unable to create order",
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET MY ORDERS
|--------------------------------------------------------------------------
| Customer
|--------------------------------------------------------------------------
*/

export const getMyOrders = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId =
      req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message:
          "Authentication required",
      });

      return;
    }

    const orders =
      await Order.find({
        user: userId,
      })
        .sort({
          createdAt: -1,
        })
        .populate(
          "items.product",
          "name slug images"
        );

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error(
      "Get my orders error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Unable to get orders",
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET ONE ORDER
|--------------------------------------------------------------------------
| Owner or Admin
|--------------------------------------------------------------------------
*/

export const getOrderById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } =
      req.params;

    const userId =
     req.user?.userId;

    const role =
      req.user?.role;

    if (!userId) {
      res.status(401).json({
        success: false,
        message:
          "Authentication required",
      });

      return;
    }

    if (
      typeof id !== "string" ||
      !id.trim()
    ) {
      res.status(400).json({
        success: false,
        message:
          "Invalid order identifier",
      });

      return;
    }

    const isObjectId = mongoose.Types.ObjectId.isValid(id);
    const orderQuery = isObjectId ? { _id: id } : { orderNumber: id.trim() };

    const order =
      await Order.findOne(orderQuery)
        .populate(
          "items.product",
          "name slug images"
        )
        .populate(
          "user",
          "email role"
        );

    if (!order) {
      res.status(404).json({
        success: false,
        message:
          "Order not found",
      });

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | Owner OR admin
    |--------------------------------------------------------------------------
    */

    if (
      role !== "admin" &&
      order.user._id.toString() !==
        userId
    ) {
      res.status(403).json({
        success: false,
        message:
          "You are not allowed to view this order",
      });

      return;
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error(
      "Get order error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Unable to get order",
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET ALL ORDERS
|--------------------------------------------------------------------------
| Admin only
|--------------------------------------------------------------------------
*/

export const getAllOrders = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      status,
      paymentStatus,
      paymentMethod,
    } = req.query;

    const filter: Record<
      string,
      unknown
    > = {};

    /*
    |--------------------------------------------------------------------------
    | Order status filter
    |--------------------------------------------------------------------------
    */

    if (
      typeof status === "string" &&
      status.trim()
    ) {
      const allowedStatuses:
        OrderStatus[] = [
          "pending",
          "confirmed",
          "processing",
          "shipped",
          "delivered",
          "cancelled",
        ];

      if (
        !allowedStatuses.includes(
          status as OrderStatus
        )
      ) {
        res.status(400).json({
          success: false,
          message:
            "Invalid order status",
        });

        return;
      }

      filter.orderStatus =
        status;
    }

    /*
    |--------------------------------------------------------------------------
    | Payment status filter
    |--------------------------------------------------------------------------
    */

    if (
      typeof paymentStatus ===
        "string" &&
      paymentStatus.trim()
    ) {
      const allowed:
        PaymentStatus[] = [
          "pending",
          "paid",
          "failed",
          "refunded",
        ];

      if (
        !allowed.includes(
          paymentStatus as PaymentStatus
        )
      ) {
        res.status(400).json({
          success: false,
          message:
            "Invalid payment status",
        });

        return;
      }

      filter.paymentStatus =
        paymentStatus;
    }

    /*
    |--------------------------------------------------------------------------
    | Payment method filter
    |--------------------------------------------------------------------------
    */

    if (
      typeof paymentMethod ===
        "string" &&
      paymentMethod.trim()
    ) {
      const allowed:
        PaymentMethod[] = [
          "payhere",
          "whatsapp",
        ];

      if (
        !allowed.includes(
          paymentMethod as PaymentMethod
        )
      ) {
        res.status(400).json({
          success: false,
          message:
            "Invalid payment method",
        });

        return;
      }

      filter.paymentMethod =
        paymentMethod;
    }

    const orders =
      await Order.find(filter)
        .sort({
          createdAt: -1,
        })
        .populate(
          "user",
          "email role"
        )
        .populate(
          "items.product",
          "name slug images"
        );

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error(
      "Get all orders error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Unable to get orders",
    });
  }
};

/*
|--------------------------------------------------------------------------
| UPDATE ORDER STATUS
|--------------------------------------------------------------------------
| Admin only
|--------------------------------------------------------------------------
|
| IMPORTANT:
|
| pending -> confirmed
|
| will deduct inventory ONCE.
|--------------------------------------------------------------------------
*/

export const updateOrderStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } =
      req.params;

    if (
      typeof id !== "string" ||
      !mongoose.Types.ObjectId.isValid(
        id
      )
    ) {
      res.status(400).json({
        success: false,
        message:
          "Invalid order ID",
      });

      return;
    }

    const { orderStatus } =
      req.body;

    const allowedStatuses:
      OrderStatus[] = [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ];

    if (
      typeof orderStatus !==
        "string" ||
      !allowedStatuses.includes(
        orderStatus as OrderStatus
      )
    ) {
      res.status(400).json({
        success: false,
        message:
          "Invalid order status",
      });

      return;
    }

    const order =
      await Order.findById(id);

    if (!order) {
      res.status(404).json({
        success: false,
        message:
          "Order not found",
      });

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | Don't allow cancelled order to continue
    |--------------------------------------------------------------------------
    */

    if (
      order.orderStatus ===
        "cancelled" &&
      orderStatus !== "cancelled"
    ) {
      res.status(400).json({
        success: false,
        message:
          "A cancelled order cannot be moved to another status",
      });

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | Deduct inventory when confirmed
    |--------------------------------------------------------------------------
    */

    if (
      orderStatus ===
        "confirmed" &&
      !order.inventoryDeducted
    ) {
      /*
      |--------------------------------------------------------------------------
      | Check every product FIRST
      |--------------------------------------------------------------------------
      */

      for (
        const item of order.items
      ) {
        const product =
          await Product.findById(
            item.product
          );

        if (!product) {
          res.status(400).json({
            success: false,
            message:
              `Product no longer exists: ${item.name}`,
          });

          return;
        }

        if (
          product.stock <
          item.quantity
        ) {
          res.status(400).json({
            success: false,
            message:
              `Insufficient stock for ${item.name}. Available: ${product.stock}`,
          });

          return;
        }
      }

      /*
      |--------------------------------------------------------------------------
      | All products have sufficient stock
      |--------------------------------------------------------------------------
      */

      for (
        const item of order.items
      ) {
        await Product.findByIdAndUpdate(
          item.product,
          {
            $inc: {
              stock:
                -item.quantity,
            },
          }
        );
      }

      order.inventoryDeducted =
        true;
    }

    /*
    |--------------------------------------------------------------------------
    | Update status
    |--------------------------------------------------------------------------
    */

    order.orderStatus =
      orderStatus as OrderStatus;

    await order.save();

    res.status(200).json({
      success: true,

      message:
        "Order status updated successfully",

      order,
    });
  } catch (error) {
    console.error(
      "Update order status error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Unable to update order status",
    });
  }
};

/*
|--------------------------------------------------------------------------
| UPDATE PAYMENT STATUS
|--------------------------------------------------------------------------
| Admin only FOR NOW
|
| Later PayHere callback will update payment automatically.
|--------------------------------------------------------------------------
*/

export const updatePaymentStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } =
      req.params;

    if (
      typeof id !== "string" ||
      !mongoose.Types.ObjectId.isValid(
        id
      )
    ) {
      res.status(400).json({
        success: false,
        message:
          "Invalid order ID",
      });

      return;
    }

    const { paymentStatus } =
      req.body;

    const allowedStatuses:
      PaymentStatus[] = [
        "pending",
        "paid",
        "failed",
        "refunded",
      ];

    if (
      typeof paymentStatus !==
        "string" ||
      !allowedStatuses.includes(
        paymentStatus as PaymentStatus
      )
    ) {
      res.status(400).json({
        success: false,
        message:
          "Invalid payment status",
      });

      return;
    }

    const order =
      await Order.findById(id);

    if (!order) {
      res.status(404).json({
        success: false,
        message:
          "Order not found",
      });

      return;
    }

    order.paymentStatus =
      paymentStatus as PaymentStatus;

    await order.save();

    res.status(200).json({
      success: true,

      message:
        "Payment status updated successfully",

      order,
    });
  } catch (error) {
    console.error(
      "Update payment status error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Unable to update payment status",
    });
  }
};

/*
|--------------------------------------------------------------------------
| DELETE ORDER (ADMIN)
|--------------------------------------------------------------------------
*/

export const deleteOrder = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    if (
      typeof id !== "string" ||
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });

      return;
    }

    const order = await Order.findByIdAndDelete(id);

    if (!order) {
      res.status(404).json({
        success: false,
        message: "Order not found",
      });

      return;
    }

    res.status(200).json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (error) {
    console.error("Delete order error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete order",
    });
  }
};