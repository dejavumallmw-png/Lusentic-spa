import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CartData, CartItem } from '../../types';
import { cartService } from '../../services/cartService';

interface CartContextValue {
  cart: CartData;
  addItem: (itemOrId: number | CartItem) => Promise<void>;
  removeItem: (index: number) => Promise<void>;
  clearCart: () => Promise<void>;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartData>({ items: [], total: 0, count: 0 });
  const [isOpen, setIsOpen] = useState(false);

  const refresh = useCallback(async () => {
    const data = await cartService.getCart();
    setCart(data);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addItem = async (itemOrId: number | CartItem) => {
    const updated = await cartService.addItem(itemOrId);
    setCart(updated);
    setIsOpen(true);
  };

  const removeItem = async (index: number) => {
    const updated = await cartService.removeItem(index);
    setCart(updated);
  };

  const clearCart = async () => {
    const updated = await cartService.clearCart();
    setCart(updated);
  };

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);
  const toggleCart = () => setIsOpen((prev) => !prev);

  return (
    <CartContext.Provider
      value={{
        cart,
        addItem,
        removeItem,
        clearCart,
        isOpen,
        openCart,
        closeCart,
        toggleCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
};
