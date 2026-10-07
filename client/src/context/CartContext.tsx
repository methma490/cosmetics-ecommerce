import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
} from "react";
import type { Product } from "../types/product";
import toast from "react-hot-toast";

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => boolean;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  shippingFee: number;
  total: number;
  freeShippingThreshold: number;
  baseShippingFee: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  openCart: () => void;
  closeCart: () => void;
}

const CART_STORAGE_KEY = "aura_cosmetics_cart_v1";
export const BASE_SHIPPING_FEE = 500;
export const FREE_SHIPPING_THRESHOLD = 8000;

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Ignore localStorage parse errors
    }
    return [];
  });

  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore quota errors
    }
  }, [items]);

  const addToCart = (product: Product, quantity = 1): boolean => {
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
  };

  const removeFromCart = (productId: string) => {
    const item = items.find((i) => i.product._id === productId);
    setItems((prev) => prev.filter((i) => i.product._id !== productId));
    if (item) {
      toast.success(`Removed "${item.product.name}" from bag.`, {
        id: `cart-remove-${productId}`,
      });
    }
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const item = items.find((i) => i.product._id === productId);
    if (!item) return;

    if (quantity > item.product.stock) {
      toast.error(
        `Maximum available stock is ${item.product.stock} units.`,
        { id: `cart-stock-${productId}` }
      );
      setItems((prev) =>
        prev.map((i) =>
          i.product._id === productId
            ? { ...i, quantity: item.product.stock }
            : i
        )
      );
      return;
    }

    setItems((prev) =>
      prev.map((i) =>
        i.product._id === productId ? { ...i, quantity } : i
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    toast.success("Shopping bag cleared.", { id: "cart-clear" });
  };

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const subtotal = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
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
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

export default CartContext;
