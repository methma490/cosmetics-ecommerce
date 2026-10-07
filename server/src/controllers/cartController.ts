import type { Request, Response } from "express";
import mongoose from "mongoose";
import Cart from "../models/cart.js";
import Product from "../models/product.js";

/*
|--------------------------------------------------------------------------
| HELPER: Populate and Format Cart
|--------------------------------------------------------------------------
*/
const getPopulatedCartItems = async (userId: string) => {
  const cart = await Cart.findOne({ user: userId }).populate({
    path: "items.product",
    select: "name slug price images stock isActive category",
  });

  if (!cart) {
    return [];
  }

  // Filter out products that were deleted or deactivated
  const validItems = cart.items.filter(
    (item) => item.product && (item.product as any).isActive !== false
  );

  // If some items were cleaned up, save the updated cart
  if (validItems.length !== cart.items.length) {
    cart.items = validItems as any;
    await cart.save();
  }

  return validItems;
};

/*
|--------------------------------------------------------------------------
| GET CUSTOMER CART
|--------------------------------------------------------------------------
| Retrieves the authenticated customer's own cart from the database.
|--------------------------------------------------------------------------
*/
export const getCart = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    const items = await getPopulatedCartItems(userId);

    res.status(200).json({
      success: true,
      items,
    });
  } catch (error) {
    console.error("Get cart error:", error);
    res.status(500).json({ success: false, message: "Unable to retrieve cart" });
  }
};

/*
|--------------------------------------------------------------------------
| ADD ITEM TO CUSTOMER CART
|--------------------------------------------------------------------------
| Saves an item to the authenticated customer's cart in the database.
|--------------------------------------------------------------------------
*/
export const addToCart = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    const { productId, quantity = 1 } = req.body;

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      res.status(400).json({ success: false, message: "Valid Product ID is required" });
      return;
    }

    const qtyToAdd = Math.max(1, Number(quantity) || 1);

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      res.status(404).json({ success: false, message: "Product not found or inactive" });
      return;
    }

    if (product.stock <= 0) {
      res.status(400).json({ success: false, message: "This product is out of stock" });
      return;
    }

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    const existingIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (existingIndex > -1) {
      const currentQty = cart.items[existingIndex].quantity;
      const targetQty = currentQty + qtyToAdd;

      if (targetQty > product.stock) {
        res.status(400).json({
          success: false,
          message: `Only ${product.stock} units available in stock. You currently have ${currentQty} in your bag.`,
        });
        return;
      }

      cart.items[existingIndex].quantity = targetQty;
    } else {
      if (qtyToAdd > product.stock) {
        res.status(400).json({
          success: false,
          message: `Only ${product.stock} units available in stock.`,
        });
        return;
      }

      cart.items.push({
        product: new mongoose.Types.ObjectId(productId),
        quantity: qtyToAdd,
      });
    }

    await cart.save();

    const items = await getPopulatedCartItems(userId);

    res.status(200).json({
      success: true,
      message: "Product added to cart",
      items,
    });
  } catch (error) {
    console.error("Add to cart error:", error);
    res.status(500).json({ success: false, message: "Unable to add item to cart" });
  }
};

/*
|--------------------------------------------------------------------------
| UPDATE CART ITEM QUANTITY
|--------------------------------------------------------------------------
| Updates the quantity of a product in the customer's database cart.
|--------------------------------------------------------------------------
*/
export const updateCartItem = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    const rawProductId = req.params.productId;
    const productId = typeof rawProductId === "string" ? rawProductId : Array.isArray(rawProductId) ? rawProductId[0] : "";
    const { quantity } = req.body;

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      res.status(400).json({ success: false, message: "Valid Product ID is required" });
      return;
    }

    const newQty = Number(quantity);

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      res.status(404).json({ success: false, message: "Cart not found" });
      return;
    }

    if (newQty <= 0) {
      // Remove item if quantity is zero or negative
      cart.items = cart.items.filter(
        (item) => item.product.toString() !== productId
      );
    } else {
      const product = await Product.findById(productId);
      if (!product || !product.isActive) {
        res.status(404).json({ success: false, message: "Product no longer available" });
        return;
      }

      if (newQty > product.stock) {
        res.status(400).json({
          success: false,
          message: `Only ${product.stock} units available in stock.`,
        });
        return;
      }

      const itemIndex = cart.items.findIndex(
        (item) => item.product.toString() === productId
      );

      if (itemIndex > -1) {
        cart.items[itemIndex].quantity = newQty;
      } else {
        cart.items.push({
          product: new mongoose.Types.ObjectId(productId),
          quantity: newQty,
        });
      }
    }

    await cart.save();

    const items = await getPopulatedCartItems(userId);

    res.status(200).json({
      success: true,
      message: "Cart updated",
      items,
    });
  } catch (error) {
    console.error("Update cart item error:", error);
    res.status(500).json({ success: false, message: "Unable to update cart" });
  }
};

/*
|--------------------------------------------------------------------------
| REMOVE ITEM FROM CUSTOMER CART
|--------------------------------------------------------------------------
| Deletes a single item from the customer's cart in the database.
|--------------------------------------------------------------------------
*/
export const removeFromCart = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    const rawProductId = req.params.productId;
    const productId = typeof rawProductId === "string" ? rawProductId : Array.isArray(rawProductId) ? rawProductId[0] : "";

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      res.status(400).json({ success: false, message: "Valid Product ID is required" });
      return;
    }

    const cart = await Cart.findOne({ user: userId });
    if (cart) {
      cart.items = cart.items.filter(
        (item) => item.product.toString() !== productId
      );
      await cart.save();
    }

    const items = await getPopulatedCartItems(userId);

    res.status(200).json({
      success: true,
      message: "Item removed from cart",
      items,
    });
  } catch (error) {
    console.error("Remove from cart error:", error);
    res.status(500).json({ success: false, message: "Unable to remove item from cart" });
  }
};

/*
|--------------------------------------------------------------------------
| CLEAR CUSTOMER CART
|--------------------------------------------------------------------------
| Empties all items in the customer's cart in the database.
|--------------------------------------------------------------------------
*/
export const clearCart = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    await Cart.findOneAndUpdate({ user: userId }, { items: [] }, { upsert: true });

    res.status(200).json({
      success: true,
      message: "Cart emptied successfully",
      items: [],
    });
  } catch (error) {
    console.error("Clear cart error:", error);
    res.status(500).json({ success: false, message: "Unable to clear cart" });
  }
};

/*
|--------------------------------------------------------------------------
| MERGE GUEST CART INTO CUSTOMER CART
|--------------------------------------------------------------------------
| When a customer logs in, this merges any guest items into their DB cart.
|--------------------------------------------------------------------------
*/
export const mergeCart = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    const { items: incomingItems } = req.body;

    if (!Array.isArray(incomingItems) || incomingItems.length === 0) {
      const currentItems = await getPopulatedCartItems(userId);
      res.status(200).json({ success: true, items: currentItems });
      return;
    }

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    for (const inc of incomingItems) {
      const pId = inc.productId || inc.product?._id || inc.product;
      const qty = Math.max(1, Number(inc.quantity) || 1);

      if (!pId || !mongoose.Types.ObjectId.isValid(pId)) continue;

      const product = await Product.findById(pId);
      if (!product || !product.isActive || product.stock <= 0) continue;

      const existingIndex = cart.items.findIndex(
        (item) => item.product.toString() === pId.toString()
      );

      if (existingIndex > -1) {
        const combined = cart.items[existingIndex].quantity + qty;
        cart.items[existingIndex].quantity = Math.min(combined, product.stock);
      } else {
        cart.items.push({
          product: new mongoose.Types.ObjectId(pId),
          quantity: Math.min(qty, product.stock),
        });
      }
    }

    await cart.save();

    const items = await getPopulatedCartItems(userId);

    res.status(200).json({
      success: true,
      message: "Cart merged successfully",
      items,
    });
  } catch (error) {
    console.error("Merge cart error:", error);
    res.status(500).json({ success: false, message: "Unable to merge cart" });
  }
};
