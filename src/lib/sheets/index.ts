import type { SheetsInterface } from './mockSheets';

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