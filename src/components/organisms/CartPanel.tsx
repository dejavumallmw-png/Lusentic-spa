import React from 'react';
import { X, ShoppingBag, Trash2, Clock, ArrowRight } from 'lucide-react';
import { useCart } from '../../app/providers/CartProvider';
import { Button } from '../atoms/Button';

interface CartPanelProps {
  onCheckout: () => void;
  onBrowseTreatments: () => void;
}

export const CartPanel: React.FC<CartPanelProps> = ({ onCheckout, onBrowseTreatments }) => {
  const { cart, isOpen, closeCart, removeItem, clearCart } = useCart();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex justify-end animate-in fade-in duration-300">
      {/* Backdrop */}
      <div
        onClick={closeCart}
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
      />

      {/* Slide-out Panel */}
      <div className="relative w-full sm:w-[400px] h-full bg-[#1a1418] text-white flex flex-col z-10 shadow-2xl border-l border-white/10 animate-in slide-in-from-right duration-300">
        
        {/* Header (PDF Spec: H2 "Your Cart" with Cart in Dust Pink, Clear All text button, Close "×") */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
            Your <span className="text-[#e8b4b8] font-serif-luxury text-2xl italic">Cart</span>
            {cart.count > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-[#e8b4b8]">
                {cart.count}
              </span>
            )}
          </h2>

          <div className="flex items-center gap-3">
            {cart.items.length > 0 && (
              <button
                onClick={clearCart}
                className="text-xs text-white/60 hover:text-[#dc3545] transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear All</span>
              </button>
            )}
            <button
              onClick={closeCart}
              className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/80 hover:text-white transition-colors cursor-pointer text-xl"
              aria-label="Close Cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {cart.items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-white/50">
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4 text-[#e8b4b8]/40">
                <ShoppingBag className="w-10 h-10" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">Your cart is empty</h3>
              <p className="text-xs text-white/60 max-w-xs mb-6">
                Explore our relaxing massages, facials, and couples therapies to add to your wellness session.
              </p>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  closeCart();
                  onBrowseTreatments();
                }}
              >
                Browse Treatments
              </Button>
            </div>
          ) : (
            cart.items.map((item, index) => (
              <div
                key={`${item.id}-${index}`}
                className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-3 group hover:border-[#e8b4b8]/30 transition-colors"
              >
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-14 h-14 rounded-xl object-cover shrink-0"
                  />
                )}
                
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-white truncate">
                    {item.name}
                  </h4>
                  <p className="text-xs text-white/50 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3 text-[#e8b4b8]" />
                    <span>{item.duration} min</span>
                  </p>
                  <p className="text-sm font-bold text-[#e8b4b8] mt-1">
                    R{item.price}
                  </p>
                </div>

                <button
                  onClick={() => removeItem(index)}
                  className="w-8 h-8 rounded-full text-white/40 hover:text-[#dc3545] hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer"
                  title="Remove from cart"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cart.items.length > 0 && (
          <div className="p-5 border-t border-white/10 bg-[#120e10]/80 space-y-4">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-white/70">Estimated Total:</span>
              <span className="text-2xl font-bold font-serif-luxury text-[#e8b4b8]">
                R{cart.total.toFixed(2)}
              </span>
            </div>

            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={() => {
                closeCart();
                onCheckout();
              }}
              icon={<ArrowRight className="w-4 h-4" />}
              iconPosition="right"
              className="text-base font-bold shadow-lg"
            >
              Proceed to Book Session
            </Button>

            <p className="text-[11px] text-center text-white/40">
              Zero upfront booking fee • Free cancellation up to 4 hours before
            </p>
          </div>
        )}

      </div>
    </div>
  );
};
