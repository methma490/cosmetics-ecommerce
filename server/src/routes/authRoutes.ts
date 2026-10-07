import { Router } from "express";

import {
  getMe,
  login,
  logout,
  register,
  verifyEmail,
  resendVerificationCode,
} from "../controllers/authController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = Router();

/*
|--------------------------------------------------------------------------
| Public Authentication Routes
|--------------------------------------------------------------------------
*/

router.post("/register", register);

router.post("/login", login);

router.post("/verify-email", verifyEmail);

router.post("/resend-verification", resendVerificationCode);

/*
|--------------------------------------------------------------------------
| Logout
|--------------------------------------------------------------------------
*/

router.post("/logout", logout);

/*
|--------------------------------------------------------------------------
| Protected Routes
|--------------------------------------------------------------------------
*/

router.get(
  "/me",
  protect,
  getMe
);

export default router;