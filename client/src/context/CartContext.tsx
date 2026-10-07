import React, {
  useEffect,
  useState,
  useMemo,
  useRef,
  useCallback,
} from "react";
import type { Product } from "../types/product";
import { useAuth } from "./AuthContext";
import cartService from "../services/cartService";
import toast from "react-hot-toast";
import {
  CartContext,
  type CartItem,
} from "./CartContextDefinition";

export const BASE_SHIPPING_FEE = 500;
export const FREE_SHIPPING_THRESHOLD = 8000;
const GUEST_STORAGE_KEY = "aura_guest_cart_v1";


export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const userId = user?.id || user?._id;

  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  // Keep track of the active user to handle transitions cleanly
  const prevUserIdRef = useRef<string | undefined>(userId);

  /*
  |--------------------------------------------------------------------------
  | SYNC CART ON USER AUTH CHANGE
  |--------------------------------------------------------------------------
  | - When a customer logs in: retrieves THEIR specific cart from the database.
  | - Merges any guest cart items created before login into their database cart.
  | - When a customer logs out: immediately purges in-memory cart so no one
  |   else can ever see this customer's cart data.
  |--------------------------------------------------------------------------
  */
  useEffect(() => {
    let isCancelled = false;

    const syncUserCart = async () => {
      // 1. If customer just logged in or switched
      if (userId) {
        setLoading(true);

        // Check if there are local guest items from this browser session to merge
        let guestItemsToMerge: Array<{ productId: string; quantity: number }> = [];
        try {
          const guestRaw = localStorage.getItem(GUEST_STORAGE_KEY);
          if (guestRaw) {
            const parsed = JSON.parse(guestRaw);
            if (Array.isArray(parsed) && parsed.length > 0) {
              guestItemsToMerge = parsed.map((item: CartItem) => ({
                productId: item.product._id,
                quantity: item.quantity,
              }));
            }
          }
        } catch {
          // Ignore parse errors
        }

        try {
          let backendItems: CartItem[] = [];

          if (guestItemsToMerge.length > 0) {
            // Merge guest cart items into customer's database cart
            const mergeRes = await cartService.mergeCart(guestItemsToMerge);
            backendItems = mergeRes.items;
            localStorage.removeItem(GUEST_STORAGE_KEY);
          } else {
            // Fetch the customer's isolated database cart
            const res = await cartService.getCart();
            backendItems = res.items;
          }

          if (!isCancelled) {
            setItems(backendItems);
            // Cache per-user locally
            try {
              localStorage.setItem(`aura_cart_${userId}`, JSON.stringify(backendItems));
            } catch {
              // Ignore quota
            }
          }
        } catch (err) {
          console.error("Failed to load customer database cart:", err);
          // Fallback to customer's cached cart if offline
          if (!isCancelled) {
            try {
              const cached = localStorage.getItem(`aura_cart_${userId}`);
              if (cached) setItems(JSON.parse(cached));
              else setItems([]);
            } catch {
              setItems([]);
            }
          }
        } finally {
          if (!isCancelled) setLoading(false);
        }
      } else {
        // 2. User is logged out (guest)
        // If transitioning from logged in to logged out, immediately clear items
        if (prevUserIdRef.current) {
          setItems([]);
        } else {
          // Initial guest load
          try {
            const guestRaw = localStorage.getItem(GUEST_STORAGE_KEY);
            if (guestRaw) {
              setItems(JSON.parse(guestRaw));
            } else {
              setItems([]);
            }
          } catch {
            setItems([]);
          }
        }
      }

      prevUserIdRef.current = userId;
    };

    void syncUserCart();

    return () => {
      isCancelled = true;
    };
  }, [userId]);

  /*
  |--------------------------------------------------------------------------
  | PERSIST CART UPDATES
  |--------------------------------------------------------------------------
  */
  useEffect(() => {
    try {
      if (userId) {
        localStorage.setItem(`aura_cart_${userId}`, JSON.stringify(items));
      } else {
        localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(items));
      }
    } catch {
      // Ignore quota errors
    }
  }, [items, userId]);

  /*
  |--------------------------------------------------------------------------
  | ADD TO CART
  |--------------------------------------------------------------------------
  */
  const addToCart = useCallback(
    (product: Product, quantity = 1): boolean => {
      if (product.stock <= 0) {
        toast.error("This product is currently out of stock.", {
          id: `cart-stock-${product._id}`,
        });
        return false;
      }

      const existingItem = items.find((i) => i.product._id === product._id);
      const currentQty = existingItem ? existingItem.quantity : 0;
      const targetQuantity = currentQty + quantity;

      if (targetQuantity > product.stock) {
        toast.error(
          existingItem
            ? `Cannot add more. Only ${product.stock} units available in stock.`
            : `Only ${product.stock} units available in stock.`,
          { id: `cart-stock-${product._id}` }
        );
        return false;
      }

      // Optimistic update
      setItems((prevItems) => {
        const existingIndex = prevItems.findIndex(
          (i) => i.product._id === product._id
        );

        if (existingIndex > -1) {
          const updated = [...prevItems];
          updated[existingIndex] = {
            ...prevItems[existingIndex],
            quantity: targetQuantity,
          };
          return updated;
        }

        return [...prevItems, { product, quantity }];
      });

      // If customer is logged in, sync directly to their database cart
      if (userId) {
        cartService
          .addToCart(product._id, quantity)
          .then((res) => {
            if (res.items) setItems(res.items);
          })
          .catch((err) => {
            console.error("Failed to sync add to cart with database:", err);
          });
      }

      if (existingItem) {
        toast.success(`Updated "${product.name}" in your bag.`, {
          id: `cart-add-${product._id}`,
        });
      } else {
        toast.success(`Added "${product.name}" to your bag.`, {
          id: `cart-add-${product._id}`,
        });
      }

      setIsCartOpen(true);
      return true;
    },
    [items, userId]
  );

  /*
  |--------------------------------------------------------------------------
  | REMOVE FROM CART
  |--------------------------------------------------------------------------
  */
  const removeFromCart = useCallback(
    (productId: string) => {
      const item = items.find((i) => i.product._id === productId);

      // Optimistic update
      setItems((prev) => prev.filter((i) => i.product._id !== productId));

      if (item) {
        toast.success(`Removed "${item.product.name}" from bag.`, {
          id: `cart-remove-${productId}`,
        });
      }

      // If customer is logged in, sync directly to database
      if (userId) {
        cartService
          .removeFromCart(productId)
          .then((res) => {
            if (res.items) setItems(res.items);
          })
          .catch((err) => {
            console.error("Failed to remove item from database cart:", err);
          });
      }
    },
    [items, userId]
  );

  /*
  |--------------------------------------------------------------------------
  | UPDATE QUANTITY
  |--------------------------------------------------------------------------
  */
  const updateQuantity = useCallback(
    (productId: string, quantity: number) => {
      if (quantity <= 0) {
        removeFromCart(productId);
        return;
      }

      const item = items.find((i) => i.product._id === productId);
      if (!item) return;

      if (quantity > item.product.stock) {
        toast.error(`Maximum available stock is ${item.product.stock} units.`, {
          id: `cart-stock-${productId}`,
        });
        setItems((prev) =>
          prev.map((i) =>
            i.product._id === productId
              ? { ...i, quantity: item.product.stock }
              : i
          )
        );

        if (userId) {
          void cartService.updateQuantity(productId, item.product.stock);
        }
        return;
      }

      // Optimistic update
      setItems((prev) =>
        prev.map((i) =>
          i.product._id === productId ? { ...i, quantity } : i
        )
      );

      // If customer is logged in, sync directly to database
      if (userId) {
        cartService
          .updateQuantity(productId, quantity)
          .then((res) => {
            if (res.items) setItems(res.items);
          })
          .catch((err) => {
            console.error("Failed to update item quantity in database:", err);
          });
      }
    },
    [items, userId, removeFromCart]
  );

  /*
  |--------------------------------------------------------------------------
  | CLEAR CART
  |--------------------------------------------------------------------------
  */
  const clearCart = useCallback(() => {
    setItems([]);
    if (userId) {
      void cartService.clearCart();
      try {
        localStorage.removeItem(`aura_cart_${userId}`);
      } catch {
        // Ignore
      }
    } else {
      try {
        localStorage.removeItem(GUEST_STORAGE_KEY);
      } catch {
        // Ignore
      }
    }
    toast.success("Shopping bag cleared.", { id: "cart-clear" });
  }, [userId]);

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const subtotal = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + (item.product?.price || 0) * item.quantity,
        0
      ),
    [items]
  );

  const shippingFee = useMemo(() => {
    if (items.length === 0) return 0;
    if (subtotal >= FREE_SHIPPING_THRESHOLD) return 0;
    return BASE_SHIPPING_FEE;
  }, [items.length, subtotal]);

  const total = useMemo(
    () => subtotal + shippingFee,
    [subtotal, shippingFee]
  );

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        itemCount,
        subtotal,
        shippingFee,
        total,
        freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
        baseShippingFee: BASE_SHIPPING_FEE,
        isCartOpen,
        setIsCartOpen,
        openCart,
        closeCart,
        loading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;
