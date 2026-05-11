"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";

export interface CartProduct {
  id: number | string;
  name: string;
  price: number | string;
  image?: string | null;
  image_url?: string | null;
  description?: string;
  category?: string;
  stock?: number;
  slug?: string;
  old_price?: string | number | null;
}

export interface CartItem extends CartProduct {
  quantity: number;
  price: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: CartProduct) => void;
  removeFromCart: (productId: number | string) => void;
  updateQuantity: (productId: number | string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  isLoaded: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function normalizeProduct(product: CartProduct): CartItem {
  return {
    ...product,
    id: product.id,
    name: product.name,
    price: Number(product.price),
    image: product.image_url || product.image || "",
    quantity: 1,
  };
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem("sarn_cart");

    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (error) {
        console.error("Failed to parse cart:", error);
      }
    }

    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("sarn_cart", JSON.stringify(cart));
    }
  }, [cart, isLoaded]);

  const addToCart = (product: CartProduct) => {
    const normalizedProduct = normalizeProduct(product);

    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (item) => String(item.id) === String(normalizedProduct.id)
      );

      if (existingItem) {
        return prevCart.map((item) =>
          String(item.id) === String(normalizedProduct.id)
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...prevCart, normalizedProduct];
    });
  };

  const removeFromCart = (productId: number | string) => {
    setCart((prevCart) =>
      prevCart.filter((item) => String(item.id) !== String(productId))
    );
  };

  const updateQuantity = (productId: number | string, quantity: number) => {
    if (quantity < 1) return;

    setCart((prevCart) =>
      prevCart.map((item) =>
        String(item.id) === String(productId) ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotal = cart.reduce(
    (total, item) => total + Number(item.price) * item.quantity,
    0
  );

  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartCount,
        isLoaded,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }

  return context;
}