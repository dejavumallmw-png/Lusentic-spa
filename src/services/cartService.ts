import { CartData, CartItem } from '../types';
import { treatmentService } from './treatmentService';

// In-memory runtime cart state (zero localStorage)
let memoryCart: CartData = { items: [], total: 0, count: 0 };

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
    return memoryCart;
  },

  async addItem(itemOrId: number | CartItem): Promise<CartData> {
    let newItem: CartItem | null = null;

    if (typeof itemOrId === 'number') {
      const treatments = await treatmentService.getAll();
      const treatment = treatments.find((t) => t.id === itemOrId);
      if (!treatment) return memoryCart;
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

    const nextItems = [...memoryCart.items, newItem];
    memoryCart = calculateCartData(nextItems);
    return memoryCart;
  },

  async removeItem(index: number): Promise<CartData> {
    const nextItems = memoryCart.items.filter((_, i) => i !== index);
    memoryCart = calculateCartData(nextItems);
    return memoryCart;
  },

  async clearCart(): Promise<CartData> {
    memoryCart = { items: [], total: 0, count: 0 };
    return memoryCart;
  },
};
