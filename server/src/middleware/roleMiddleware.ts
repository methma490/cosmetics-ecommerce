import type {
  NextFunction,
  Request,
  Response,
} from "express";

import type { UserRole } from "../models/user.js";

export const authorizeRoles = (
  ...roles: UserRole[]
) => {
  return (
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });

      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: "You do not have permission to access this resource",
      });

      return;
    }

    next();
  };
};