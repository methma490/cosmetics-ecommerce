import type { Request, Response, NextFunction } from "express";
import AppError from "../utils/AppError.js";

export const errorHandler = (
  error: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error("Global error caught:", error);

  const statusCode =
    error instanceof AppError && error.statusCode
      ? error.statusCode
      : 500;

  const message =
    error.message && error instanceof AppError
      ? error.message
      : "Internal server error";

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  });
};

export default errorHandler;
