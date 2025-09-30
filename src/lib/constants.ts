export type Category = 'OMEN' | 'VINYL';
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
  { id: 'omen-1', name: 'うさぎ', category: 'OMEN', salePrice: 500, rentalAllowed: true },
  { id: 'omen-2', name: 'ちいかわ', category: 'OMEN', salePrice: 500, rentalAllowed: true },
  { id: 'omen-3', name: 'ハチワレ', category: 'OMEN', salePrice: 500, rentalAllowed: true },
  { id: 'omen-4', name: 'ドラえもん', category: 'OMEN', salePrice: 500, rentalAllowed: true },
  { id: 'omen-5', name: 'マリオ', category: 'OMEN', salePrice: 500, rentalAllowed: true },
  { id: 'omen-6', name: 'ピカチュウ', category: 'OMEN', salePrice: 500, rentalAllowed: true },
  { id: 'omen-7', name: 'アンパンマン', category: 'OMEN', salePrice: 500, rentalAllowed: true },
  { id: 'omen-8', name: 'シナモロール', category: 'OMEN', salePrice: 500, rentalAllowed: true },
  { id: 'omen-9', name: '猫半面(緑)', category: 'OMEN', salePrice: 1000, rentalAllowed: true },
  { id: 'omen-10', name: '猫半面(金)', category: 'OMEN', salePrice: 1000, rentalAllowed: true },
  { id: 'omen-11', name: '黒狐', category: 'OMEN', salePrice: 1000, rentalAllowed: true },
  // ビニール玩具 (VINYL) - 2種類（レンタル不可）
  { id: 'vinyl-1', name: 'マイクラツール', category: 'VINYL', salePrice: 300, rentalAllowed: false },
  { id: 'vinyl-2', name: 'ミニオンのハンマー', category: 'VINYL', salePrice: 300, rentalAllowed: false },
];

export const CATEGORY_LABELS = {
  OMEN: 'お面',
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