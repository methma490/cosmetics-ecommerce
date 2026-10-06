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

const app = express();

app.use(
  cors({
    origin:
      process.env.CLIENT_URL ||
      "http://localhost:5173",

    credentials: true,
  })
);

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(cookieParser());

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

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/categories",
  categoryRoutes
);

app.use(
  "/api/products",
  productRoutes
);

app.use(
  "/api/orders",
  orderRoutes
);

app.use(
  (_req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      message: "Route not found",
    });
  }
);

app.use(
  (
    error: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
  ) => {
    console.error(error);

    res.status(500).json({
      success: false,
      message:
        "Internal server error",
    });
  }
);

export default app;