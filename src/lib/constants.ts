export type Category = 'OMEN' | 'MINGEI' | 'VINYL';
export type Mode = 'sale' | 'rental';
export type RentalPlan = '1h' | '3h' | '6h' | 'allday';

export interface Product {
  id: string;
  name: string;
  category: Category;
  salePrice: number;
  rentalAllowed: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  rentalPlan?: RentalPlan;
}

export interface SalesRow {
  date: string;
  time: string;
  category: Category;
  productName: string;
  quantity: string;
  unitPrice: string;
  subtotal: string;
  staff: string;
  note: string;
}

export interface RentalsRow {
  rentalNo: string;
  name: string;
  productName: string;
  category: Category;
  date: string;
  startTime: string;
  endTime: string;
  usedMinutes: string;
  plan: string;
  amount: string;
  deposit: string;
  refund: string;
  returnable: string;
  staff: string;
  note: string;
}

export const PRODUCTS: Product[] = [
  // お面 (OMEN) - 11種類
  { id: 'omen-1', name: '狐面ホワイト', category: 'OMEN', salePrice: 500, rentalAllowed: true },
  { id: 'omen-2', name: '狐面レッド', category: 'OMEN', salePrice: 500, rentalAllowed: true },
  { id: 'omen-3', name: '天狗面', category: 'OMEN', salePrice: 500, rentalAllowed: true },
  { id: 'omen-4', name: '般若面', category: 'OMEN', salePrice: 500, rentalAllowed: true },
  { id: 'omen-5', name: 'ひょっとこ面', category: 'OMEN', salePrice: 500, rentalAllowed: true },
  { id: 'omen-6', name: 'おかめ面', category: 'OMEN', salePrice: 500, rentalAllowed: true },
  { id: 'omen-7', name: '鬼面青', category: 'OMEN', salePrice: 500, rentalAllowed: true },
  { id: 'omen-8', name: '鬼面赤', category: 'OMEN', salePrice: 500, rentalAllowed: true },
  { id: 'omen-9', name: '猫面', category: 'OMEN', salePrice: 500, rentalAllowed: true },
  { id: 'omen-10', name: '犬面', category: 'OMEN', salePrice: 500, rentalAllowed: true },
  { id: 'omen-11', name: '龍面', category: 'OMEN', salePrice: 500, rentalAllowed: true },

  // 民芸お面 (MINGEI) - 複数種類
  { id: 'mingei-1', name: '伝統狐面（金）', category: 'MINGEI', salePrice: 1000, rentalAllowed: true },
  { id: 'mingei-2', name: '伝統天狗面（朱）', category: 'MINGEI', salePrice: 1000, rentalAllowed: true },
  { id: 'mingei-3', name: '手彫り般若面', category: 'MINGEI', salePrice: 1000, rentalAllowed: true },
  { id: 'mingei-4', name: '古典ひょっとこ面', category: 'MINGEI', salePrice: 1000, rentalAllowed: true },

  // ビニール玩具 (VINYL) - 2種類（レンタル不可）
  { id: 'vinyl-1', name: 'アニマル仮面セット', category: 'VINYL', salePrice: 300, rentalAllowed: false },
  { id: 'vinyl-2', name: 'キャラクター仮面セット', category: 'VINYL', salePrice: 300, rentalAllowed: false },
];

export const CATEGORY_LABELS = {
  OMEN: 'お面',
  MINGEI: '民芸お面',
  VINYL: 'ビニール玩具',
} as const;

export const STAFF_NAME = 'staffA'; // 固定スタッフ名

export const RENTAL_PLANS: RentalPlan[] = ['1h', '3h', '6h', 'allday'];

export const RENTAL_PLAN_LABELS = {
  '1h': '1時間',
  '3h': '3時間',
  '6h': '6時間',
  'allday': '終日',
} as const;