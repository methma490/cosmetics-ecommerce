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
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  openCart: () => void;
  closeCart: () => void;
}

const CART_STORAGE_KEY = "aura_cosmetics_cart_v1";
const BASE_SHIPPING_FEE = 500;
const FREE_SHIPPING_THRESHOLD = 15000;

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
      toast.error("This product is currently out of stock.");
      return false;
    }

    let success = true;

    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex(
        (i) => i.product._id === product._id
      );

      if (existingIndex > -1) {
        const existingItem = prevItems[existingIndex];
        const newQuantity = existingItem.quantity + quantity;

        if (newQuantity > product.stock) {
          toast.error(
            `Cannot add more. Only ${product.stock} items available in stock.`
          );
          success = false;
          return prevItems;
        }

        const updated = [...prevItems];
        updated[existingIndex] = {
          ...existingItem,
          quantity: newQuantity,
        };
        toast.success(`Updated "${product.name}" in your bag.`);
        return updated;
      } else {
        if (quantity > product.stock) {
          toast.error(`Only ${product.stock} items available in stock.`);
          success = false;
          return prevItems;
        }

        toast.success(`Added "${product.name}" to your bag.`);
        return [...prevItems, { product, quantity }];
      }
    });

    if (success) {
      setIsCartOpen(true);
    }

    return success;
  };

  const removeFromCart = (productId: string) => {
    setItems((prev) => {
      const item = prev.find((i) => i.product._id === productId);
      if (item) {
        toast.success(`Removed "${item.product.name}" from bag.`);
      }
      return prev.filter((i) => i.product._id !== productId);
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setItems((prev) =>
      prev.map((item) => {
        if (item.product._id === productId) {
          if (quantity > item.product.stock) {
            toast.error(
              `Maximum available stock is ${item.product.stock} units.`
            );
            return { ...item, quantity: item.product.stock };
          }
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
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
