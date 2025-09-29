// Google Sheets API実装
// 返却機能対応のため読み取り・更新機能を追加

import { google } from 'googleapis';
import type { SheetsInterface, RentalRow } from './index';

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

  async getRentals(): Promise<RentalRow[]> {
    console.log('[googleSheets] getRentals');

    try {
      const sheets = await getGoogleSheetsClient();
      const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID!;
      const sheetName = process.env.SHEET_NAME_RENTALS || 'Rentals';

      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${sheetName}!A:O`, // A-O列（15列）全件取得
      });

      const rows = response.data.values;
      if (!rows || rows.length <= 1) {
        // ヘッダー行のみ、またはデータなし
        return [];
      }

      // ヘッダー行を除いてオブジェクトに変換
      const rentalRows: RentalRow[] = rows.slice(1).map(row => ({
        rentalNo: row[0] || '',
        name: row[1] || '',
        productName: row[2] || '',
        category: row[3] || '',
        date: row[4] || '',
        startTime: row[5] || '',
        endTime: row[6] || '',
        usedMinutes: row[7] || '',
        plan: row[8] || '',
        amount: row[9] || '',
        deposit: row[10] || '',
        refund: row[11] || '',
        returnable: row[12] || '',
        staff: row[13] || '',
        note: row[14] || '',
      }));

      console.log('[googleSheets] Rentals retrieved:', rentalRows.length);
      return rentalRows;
    } catch (error) {
      console.error('[googleSheets] Error getting rentals:', error);
      throw new Error('レンタルデータの取得に失敗しました: ' + (error as Error).message);
    }
  },

  async getRentalByNo(no: string): Promise<RentalRow | null> {
    console.log('[googleSheets] getRentalByNo:', no);

    try {
      const allRentals = await this.getRentals();
      const rental = allRentals.find(rental => rental.rentalNo === no);

      console.log('[googleSheets] Rental found:', !!rental);
      return rental || null;
    } catch (error) {
      console.error('[googleSheets] Error getting rental by no:', error);
      throw new Error('レンタルデータの取得に失敗しました: ' + (error as Error).message);
    }
  },

  async finishRental(input: {
    rentalNo: string;
    endTime: string;
    usedMinutes: number;
    plan: string;
    amount: number;
    refund: number;
    returnable: 'OK' | 'NG';
  }): Promise<void> {
    console.log('[googleSheets] finishRental:', input);

    try {
      const sheets = await getGoogleSheetsClient();
      const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID!;
      const sheetName = process.env.SHEET_NAME_RENTALS || 'Rentals';

      // 全データを取得
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${sheetName}!A:O`,
      });

      const rows = response.data.values;
      if (!rows || rows.length <= 1) {
        throw new Error('レンタルデータが見つかりません');
      }

      // 該当するレンタル番号の行を見つける
      let targetRowIndex = -1;
      for (let i = 1; i < rows.length; i++) {
        if (rows[i][0] === input.rentalNo) {
          targetRowIndex = i;
          break;
        }
      }

      if (targetRowIndex === -1) {
        throw new Error(`レンタル番号 ${input.rentalNo} が見つかりません`);
      }

      // 該当行の特定セルを更新
      const rowNumber = targetRowIndex + 1; // 1ベースの行番号
      const updateRequests = [
        {
          range: `${sheetName}!G${rowNumber}`, // EndTime
          values: [[input.endTime]],
        },
        {
          range: `${sheetName}!H${rowNumber}`, // UsedMinutes
          values: [[input.usedMinutes.toString()]],
        },
        {
          range: `${sheetName}!I${rowNumber}`, // Plan
          values: [[input.plan]],
        },
        {
          range: `${sheetName}!J${rowNumber}`, // Amount
          values: [[input.amount.toString()]],
        },
        {
          range: `${sheetName}!L${rowNumber}`, // Refund
          values: [[input.refund.toString()]],
        },
        {
          range: `${sheetName}!M${rowNumber}`, // Returnable
          values: [[input.returnable]],
        },
      ];

      // 複数のセルを一括更新
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId,
        requestBody: {
          valueInputOption: 'RAW',
          data: updateRequests,
        },
      });

      console.log('[googleSheets] Rental finished:', input.rentalNo);
    } catch (error) {
      console.error('[googleSheets] Error finishing rental:', error);
      throw new Error('レンタル返却データの更新に失敗しました: ' + (error as Error).message);
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