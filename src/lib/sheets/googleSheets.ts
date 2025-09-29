import { google } from 'googleapis';
import type { SheetsInterface } from './mockSheets';

export const googleSheets: SheetsInterface = {
  async appendToSales(rows: string[][]): Promise<void> {
    console.log('[googleSheets] appendToSales:', rows);

    try {
      const sheets = await getGoogleSheetsClient();
      const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID!;
      const sheetName = process.env.SHEET_NAME_SALES || 'Sales';

      const response = await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `${sheetName}!A:I`, // A-I列（9列）
        valueInputOption: 'RAW',
        requestBody: {
          values: rows,
        },
      });

      console.log('[googleSheets] Sales data appended:', response.data);
    } catch (error) {
      console.error('[googleSheets] Error appending sales data:', error);
      throw new Error('販売データの保存に失敗しました: ' + (error as Error).message);
    }
  },

  async appendToRentals(rows: string[][]): Promise<void> {
    console.log('[googleSheets] appendToRentals:', rows);

    try {
      const sheets = await getGoogleSheetsClient();
      const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID!;
      const sheetName = process.env.SHEET_NAME_RENTALS || 'Rentals';

      const response = await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `${sheetName}!A:O`, // A-O列（15列）
        valueInputOption: 'RAW',
        requestBody: {
          values: rows,
        },
      });

      console.log('[googleSheets] Rentals data appended:', response.data);
    } catch (error) {
      console.error('[googleSheets] Error appending rentals data:', error);
      throw new Error('レンタルデータの保存に失敗しました: ' + (error as Error).message);
    }
  },

  async getMaxRentalNumber(): Promise<number> {
    console.log('[googleSheets] Getting max rental number');

    try {
      const sheets = await getGoogleSheetsClient();
      const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID!;
      const sheetName = process.env.SHEET_NAME_RENTALS || 'Rentals';

      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${sheetName}!A:A`, // A列のレンタル番号だけ取得
      });

      const rows = response.data.values;
      if (!rows || rows.length <= 1) {
        // ヘッダー行のみ、またはデータなし
        return 0;
      }

      // ヘッダー行を除いてレンタル番号を解析
      const rentalNumbers = rows
        .slice(1) // ヘッダー行を除外
        .map(row => parseInt(row[0], 10))
        .filter(num => !isNaN(num));

      if (rentalNumbers.length === 0) {
        return 0;
      }

      const maxNumber = Math.max(...rentalNumbers);
      console.log('[googleSheets] Max rental number:', maxNumber);

      return maxNumber;
    } catch (error) {
      console.error('[googleSheets] Error getting max rental number:', error);
      // エラーの場合はモック動作にフォールバック
      const mockSheets = await import('./mockSheets');
      return mockSheets.mockSheets.getMaxRentalNumber();
    }
  },
};

async function getGoogleSheetsClient() {
  const serviceAccountBase64 = process.env.GOOGLE_SERVICE_ACCOUNT_BASE64;

  if (!serviceAccountBase64) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_BASE64 environment variable not set');
  }

  try {
    // Base64デコードしてService Account情報を取得
    const serviceAccountJson = Buffer.from(serviceAccountBase64, 'base64').toString('utf8');
    const serviceAccount = JSON.parse(serviceAccountJson);

    // JWT認証を使用
    const auth = new google.auth.JWT({
      email: serviceAccount.client_email,
      key: serviceAccount.private_key,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    return sheets;
  } catch (error) {
    console.error('[googleSheets] Error creating Google Sheets client:', error);
    throw new Error('Google Sheets認証に失敗しました: ' + (error as Error).message);
  }
}