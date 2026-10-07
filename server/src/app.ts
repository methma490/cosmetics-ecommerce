import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";

import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/authRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import errorHandler from "./middleware/errorHandler.js";

const app = express();

/**
 * =========================================================
 * CORS
 * =========================================================
 */
const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5174",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, Postman)
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
      ) {
        return callback(null, origin);
      }
      return callback(null, origin);
    },
    credentials: true,
  })
);

/**
 * =========================================================
 * BODY PARSERS
 * =========================================================
 */

// Parse JSON requests
app.use(express.json());

// IMPORTANT:
// PayHere notify callback sends
// application/x-www-form-urlencoded data
app.use(
  express.urlencoded({
    extended: true,
  })
);

/**
 * =========================================================
 * COOKIE PARSER
 * =========================================================
 */

app.use(cookieParser());

/**
 * =========================================================
 * BASIC ROUTES
 * =========================================================
 */

app.get(
  "/",
  (_req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      message:
        "Cosmetics E-Commerce API is running",
    });
  }
);

app.get(
  "/api/health",
  (_req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      message: "Server is healthy",
    });
  }
);

/**
 * =========================================================
 * API ROUTES
 * =========================================================
 */

// Authentication
app.use(
  "/api/auth",
  authRoutes
);

// Categories
app.use(
  "/api/categories",
  categoryRoutes
);

// Products
app.use(
  "/api/products",
  productRoutes
);

// Orders
app.use(
  "/api/orders",
  orderRoutes
);

// PayHere payments
// IMPORTANT:
// This MUST be before the 404 handler.
app.use(
  "/api/payments",
  paymentRoutes
);

// File / Image Uploads (Cloudinary)
app.use(
  "/api/upload",
  uploadRoutes
);

/**
 * =========================================================
 * 404 - ROUTE NOT FOUND
 * =========================================================
 *
 * IMPORTANT:
 * Keep this AFTER all API routes.
 */

app.use(
  (_req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      message: "Route not found",
    });
  }
);

/**
 * =========================================================
 * GLOBAL ERROR HANDLER
 * =========================================================
 *
 * Keep this LAST.
 */

app.use(errorHandler);

export default app;