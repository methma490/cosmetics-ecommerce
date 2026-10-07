import { Router } from "express";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  mergeCart,
} from "../controllers/cartController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

// All cart endpoints require user authentication so data is strictly isolated per customer
router.use(protect);

router.get("/", getCart);
router.post("/items", addToCart);
router.put("/items/:productId", updateCartItem);
router.delete("/items/:productId", removeFromCart);
router.delete("/", clearCart);
router.post("/merge", mergeCart);

export default router;
