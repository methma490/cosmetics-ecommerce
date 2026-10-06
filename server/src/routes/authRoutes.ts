import { Router } from "express";

import {
  getMe,
  login,
  logout,
  register,
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