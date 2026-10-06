import type { UserRole } from "../models/user.js";

export interface JwtPayload {
  userId: string;
  role: UserRole;
}