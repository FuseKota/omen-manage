import { create } from 'zustand';
import { CartItem, Mode, Product, RentalPlan } from '@/lib/constants';

interface CartStore {
  mode: Mode;
  items: CartItem[];

  // アクション
  setMode: (mode: Mode) => void;
  addToCart: (product: Product, quantity: number, rentalPlan?: RentalPlan) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  updateRentalPlan: (productId: string, rentalPlan: RentalPlan) => void;
  clearCart: () => void;

  // 計算系
  getTotalPrice: () => number;
  getTotalQuantity: () => number;
  getDepositAmount: () => number; // レンタル時の預かり金（販売価格の合計）
}

export const useCartStore = create<CartStore>((set, get) => ({
  mode: 'sale',
  items: [],

  setMode: (mode: Mode) => {
    set({ mode });
    // モード変更時にカートをクリア（レンタル不可の商品などがあるため）
    get().clearCart();
  },

  addToCart: (product: Product, quantity: number, rentalPlan?: RentalPlan) => {
    const { mode, items } = get();

    // レンタルモードでレンタル不可商品は追加しない
    if (mode === 'rental' && !product.rentalAllowed) {
      return;
    }

    // 既存の商品があるかチェック
    const existingItemIndex = items.findIndex(item =>
      item.product.id === product.id &&
      (mode === 'sale' || item.rentalPlan === rentalPlan)
    );

    if (existingItemIndex >= 0) {
      // 既存の商品の数量を更新
      const updatedItems = [...items];
      updatedItems[existingItemIndex].quantity += quantity;
      set({ items: updatedItems });
    } else {
      // 新しい商品を追加
      const newItem: CartItem = {
        product,
        quantity,
        rentalPlan: mode === 'rental' ? rentalPlan : undefined,
      };
      set({ items: [...items, newItem] });
    }
  },

  removeFromCart: (productId: string) => {
    const { items } = get();
    const updatedItems = items.filter(item => item.product.id !== productId);
    set({ items: updatedItems });
  },

  updateQuantity: (productId: string, quantity: number) => {
    const { items } = get();
    if (quantity <= 0) {
      get().removeFromCart(productId);
      return;
    }

    const updatedItems = items.map(item =>
      item.product.id === productId
        ? { ...item, quantity }
        : item
    );
    set({ items: updatedItems });
  },

  updateRentalPlan: (productId: string, rentalPlan: RentalPlan) => {
    const { mode, items } = get();
    if (mode !== 'rental') return;

    const updatedItems = items.map(item =>
      item.product.id === productId
        ? { ...item, rentalPlan }
        : item
    );
    set({ items: updatedItems });
  },

  clearCart: () => {
    set({ items: [] });
  },

  getTotalPrice: () => {
    const { mode, items } = get();

    return items.reduce((total, item) => {
      if (mode === 'sale') {
        return total + (item.product.salePrice * item.quantity);
      } else {
        // レンタルの場合は目安料金
        // 実際の料金計算はpricing.tsのgetRentalAmountを使用
        const baseAmounts = { '1h': 100, '3h': 200, '6h': 300, 'allday': 400 };
        const baseAmount = baseAmounts[item.rentalPlan || '1h'];
        return total + (baseAmount * item.quantity);
      }
    }, 0);
  },

  getTotalQuantity: () => {
    const { items } = get();
    return items.reduce((total, item) => total + item.quantity, 0);
  },

  getDepositAmount: () => {
    const { items } = get();
    return items.reduce((total, item) => {
      return total + (item.product.salePrice * item.quantity);
    }, 0);
  },
}));