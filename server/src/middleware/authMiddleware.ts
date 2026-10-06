import type {
  NextFunction,
  Request,
  Response,
} from "express";

import jwt from "jsonwebtoken";

import User from "../models/user.js";
import type { JwtPayload } from "../types/auth.js";
import { AUTH_COOKIE_NAME } from "../utils/authCookie.js";

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.cookies?.[AUTH_COOKIE_NAME] as
      | string
      | undefined;

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });

      return;
    }

    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      throw new Error("JWT_SECRET is not defined");
    }

    const decoded = jwt.verify(
      token,
      jwtSecret
    ) as JwtPayload;

    const user = await User.findById(decoded.userId);

    if (!user) {
      res.status(401).json({
        success: false,
        message: "User no longer exists",
      });

      return;
    }

    if (!user.isActive) {
      res.status(403).json({
        success: false,
        message: "Account is disabled",
      });

      return;
    }

    req.user = {
      userId: user._id.toString(),
      role: user.role,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        message: "Session expired. Please login again.",
      });

      return;
    }

    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        message: "Invalid authentication token",
      });

      return;
    }

    next(error);
  }
};