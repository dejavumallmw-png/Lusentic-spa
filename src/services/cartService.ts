import { CartData, CartItem } from '../types';
import { INITIAL_TREATMENTS } from '../data/initialData';

const CART_KEY = 'lusentic_spa_cart';

function getStoredCart(): CartData {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) {
      const initial: CartData = { items: [], total: 0, count: 0 };
      localStorage.setItem(CART_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return { items: [], total: 0, count: 0 };
  }
}

function saveCart(cart: CartData): void {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function calculateCartData(items: CartItem[]): CartData {
  const total = items.reduce((sum, item) => sum + item.price, 0);
  return {
    items,
    total,
    count: items.length,
  };
}

export const cartService = {
  async getCart(): Promise<CartData> {
    return getStoredCart();
  },

  async addItem(itemOrId: number | CartItem): Promise<CartData> {
    const current = getStoredCart();
    let newItem: CartItem | null = null;

    if (typeof itemOrId === 'number') {
      const treatment = INITIAL_TREATMENTS.find((t) => t.id === itemOrId);
      if (!treatment) return current;
      newItem = {
        id: treatment.id,
        name: treatment.name,
        price: treatment.price,
        duration: treatment.duration,
        image: treatment.imageUrl,
      };
    } else {
      newItem = itemOrId;
    }

    const nextItems = [...current.items, newItem];
    const updated = calculateCartData(nextItems);
    saveCart(updated);
    return updated;
  },

  async removeItem(index: number): Promise<CartData> {
    const current = getStoredCart();
    const nextItems = current.items.filter((_, i) => i !== index);
    const updated = calculateCartData(nextItems);
    saveCart(updated);
    return updated;
  },

  async clearCart(): Promise<CartData> {
    const empty: CartData = { items: [], total: 0, count: 0 };
    saveCart(empty);
    return empty;
  },
};
