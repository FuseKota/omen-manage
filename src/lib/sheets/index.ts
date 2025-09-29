// Sheets クライアントの統一インターフェース
// 返却機能追加に伴い、読み取り・更新機能を拡張

export interface RentalRow {
  rentalNo: string;
  name: string;
  productName: string;
  category: string;
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

export interface SheetsInterface {
  // 既存の書き込み機能
  appendToSales: (rows: string[][]) => Promise<void>;
  appendToRentals: (rows: string[][]) => Promise<void>;
  getMaxRentalNumber: () => Promise<number>;

  // 返却機能のための読み取り・更新機能
  getRentals: () => Promise<RentalRow[]>;
  getRentalByNo: (no: string) => Promise<RentalRow | null>;
  finishRental: (input: {
    rentalNo: string;
    endTime: string;
    usedMinutes: number;
    plan: string;
    amount: number;
    refund: number;
    returnable: 'OK' | 'NG';
  }) => Promise<void>;
}

// 環境変数によってmockまたは実接続を切り替え
function createSheetsClient(): SheetsInterface {
  const hasGoogleCreds = process.env.GOOGLE_SERVICE_ACCOUNT_BASE64 &&
                        process.env.GOOGLE_SHEETS_SPREADSHEET_ID;

  if (hasGoogleCreds) {
    console.log('[sheets] Using Google Sheets connection');
    // 動的インポートでgoogleSheetsを読み込み
    const { googleSheets } = require('./googleSheets');
    return googleSheets;
  } else {
    console.log('[sheets] Using mock sheets (localStorage)');
    // 動的インポートでmockSheetsを読み込み
    const { mockSheets } = require('./mockSheets');
    return mockSheets;
  }
}

export const sheets: SheetsInterface = createSheetsClient();

// デバッグ用のヘルパー
export function getSheetsMode(): 'google' | 'mock' {
  const hasGoogleCreds = process.env.GOOGLE_SERVICE_ACCOUNT_BASE64 &&
                        process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  return hasGoogleCreds ? 'google' : 'mock';
}