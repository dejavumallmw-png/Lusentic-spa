import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../../app/providers/CartProvider';

export const FloatingCart: React.FC = () => {
  const { cart, toggleCart, isOpen } = useCart();

  if (isOpen) return null;

  return (
    <button
      onClick={toggleCart}
      aria-label="Open shopping cart"
      className="fixed bottom-5 right-5 sm:bottom-7 sm:right-7 z-40 w-[50px] h-[50px] sm:w-[60px] sm:h-[60px] rounded-full bg-[#e8b4b8] hover:bg-[#d49a9e] text-[#1a1418] flex items-center justify-center shadow-[0_8px_30px_rgba(232,180,184,0.45)] hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
    >
      <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-[#1a1418]" />
      
      {cart.count > 0 && (
        <span className="absolute -top-1.5 -right-1.5 w-[22px] h-[22px] rounded-full bg-[#dc3545] border-2 border-[#e8b4b8] text-white text-[10px] font-bold flex items-center justify-center shadow-md animate-pulse">
          {cart.count}
        </span>
      )}
    </button>
  );
};
