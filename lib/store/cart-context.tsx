"use client";

import { createContext, useCallback, useContext, useState, useEffect, ReactNode } from "react";

export interface CartItem {
  id: string;
  slug: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  stock?: number;
  variant?: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (id: string) => void;
  updateItemStock: (id: string, stock: number) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function limitQuantityByStock(quantity: number, stock?: number) {
  const safeQuantity = Math.max(1, quantity);
  return typeof stock === "number" ? Math.min(stock, safeQuantity) : safeQuantity;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch {
        console.error("Failed to parse cart from localStorage");
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items));
  }, [items]);

  const addItem = useCallback((newItem: Omit<CartItem, "quantity">, quantity = 1) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === newItem.id);
      const nextQuantity = limitQuantityByStock(quantity, newItem.stock);
      if (nextQuantity <= 0) {
        return prevItems;
      }

      if (existingItem) {
        return prevItems.map((item) =>
          item.id === newItem.id
            ? {
                ...item,
                ...newItem,
                quantity: limitQuantityByStock(item.quantity + quantity, newItem.stock),
              }
            : item
        );
      }
      return [...prevItems, { ...newItem, quantity: nextQuantity }];
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
  }, []);

  const updateItemStock = useCallback((id: string, stock: number) => {
    setItems((prevItems) => {
      if (stock <= 0) {
        return prevItems.some((item) => item.id === id)
          ? prevItems.filter((item) => item.id !== id)
          : prevItems;
      }

      let hasChanges = false;
      const nextItems = prevItems.map((item) => {
        if (item.id !== id) {
          return item;
        }

        const nextQuantity = limitQuantityByStock(item.quantity, stock);
        if (item.stock !== stock || item.quantity !== nextQuantity) {
          hasChanges = true;
        }

        return {
          ...item,
          stock,
          quantity: nextQuantity,
        };
      });

      return hasChanges ? nextItems : prevItems;
    });
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, quantity: limitQuantityByStock(quantity, item.stock) } : item
      )
    );
  }, [removeItem]);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateItemStock,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
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
