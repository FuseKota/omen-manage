// モック版のスプレッドシート連携
// localStorageにデータを保存する
// 返却機能対応のため読み取り・更新機能を追加

import type { SheetsInterface, RentalRow } from './index';

const SALES_KEY = 'omen_sales_data';
const RENTALS_KEY = 'omen_rentals_data';

// レンタルデータのカラム順序
// RentalNo, Name, ProductName, Category, Date, StartTime,
// EndTime, UsedMinutes, Plan, Amount, Deposit, Refund,
// Returnable, Staff, Note

// サーバーサイドでの localStorage チェック
function isLocalStorageAvailable(): boolean {
  try {
    return typeof window !== 'undefined' && window.localStorage !== undefined;
  } catch {
    return false;
  }
}

// サーバーサイド用のダミーストレージ
let serverSideStorage: { [key: string]: string } = {};

function getStorageItem(key: string): string | null {
  if (isLocalStorageAvailable()) {
    return localStorage.getItem(key);
  } else {
    return serverSideStorage[key] || null;
  }
}

function setStorageItem(key: string, value: string): void {
  if (isLocalStorageAvailable()) {
    localStorage.setItem(key, value);
  } else {
    serverSideStorage[key] = value;
  }
}

export const mockSheets: SheetsInterface = {
  async appendToSales(rows: string[][]): Promise<void> {
    console.log('[mockSheets] appendToSales:', rows);

    try {
      const existingData = JSON.parse(getStorageItem(SALES_KEY) || '[]');
      const newData = [...existingData, ...rows];
      setStorageItem(SALES_KEY, JSON.stringify(newData));

      // デバッグログ
      console.log('[mockSheets] Sales data saved:', newData);
    } catch (error) {
      console.error('[mockSheets] Error saving sales data:', error);
      throw new Error('販売データの保存に失敗しました');
    }
  },

  async appendToRentals(rows: string[][]): Promise<void> {
    console.log('[mockSheets] appendToRentals:', rows);

    try {
      const existingData = JSON.parse(getStorageItem(RENTALS_KEY) || '[]');
      const newData = [...existingData, ...rows];
      setStorageItem(RENTALS_KEY, JSON.stringify(newData));

      // デバッグログ
      console.log('[mockSheets] Rentals data saved:', newData);
    } catch (error) {
      console.error('[mockSheets] Error saving rentals data:', error);
      throw new Error('レンタルデータの保存に失敗しました');
    }
  },

  async getMaxRentalNumber(): Promise<number> {
    try {
      const rentalsData = JSON.parse(getStorageItem(RENTALS_KEY) || '[]');

      if (rentalsData.length === 0) {
        return 0;
      }

      // レンタル番号は1列目にある想定
      const rentalNumbers = rentalsData
        .map((row: string[]) => parseInt(row[0], 10))
        .filter((num: number) => !isNaN(num));

      const maxNumber = Math.max(...rentalNumbers);
      console.log('[mockSheets] Max rental number:', maxNumber);

      return maxNumber;
    } catch (error) {
      console.error('[mockSheets] Error getting max rental number:', error);
      return 0;
    }
  },

  async getRentals(): Promise<RentalRow[]> {
    console.log('[mockSheets] getRentals');

    try {
      const rentalsData = JSON.parse(getStorageItem(RENTALS_KEY) || '[]');

      // 配列をオブジェクトに変換
      const rentalRows: RentalRow[] = rentalsData.map((row: string[]) => ({
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

      console.log('[mockSheets] Rentals retrieved:', rentalRows);
      return rentalRows;
    } catch (error) {
      console.error('[mockSheets] Error getting rentals:', error);
      throw new Error('レンタルデータの取得に失敗しました');
    }
  },

  async getRentalByNo(no: string): Promise<RentalRow | null> {
    console.log('[mockSheets] getRentalByNo:', no);

    try {
      const allRentals = await this.getRentals();
      const rental = allRentals.find(rental => rental.rentalNo === no);

      console.log('[mockSheets] Rental found:', rental);
      return rental || null;
    } catch (error) {
      console.error('[mockSheets] Error getting rental by no:', error);
      throw new Error('レンタルデータの取得に失敗しました');
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
    console.log('[mockSheets] finishRental:', input);

    try {
      const rentalsData = JSON.parse(getStorageItem(RENTALS_KEY) || '[]');

      // 該当するレンタル番号の行を見つけて更新
      const updatedData = rentalsData.map((row: string[]) => {
        if (row[0] === input.rentalNo) {
          // 該当行を更新
          const updatedRow = [...row];
          updatedRow[6] = input.endTime;          // EndTime
          updatedRow[7] = input.usedMinutes.toString(); // UsedMinutes
          updatedRow[8] = input.plan;             // Plan
          updatedRow[9] = input.amount.toString(); // Amount
          updatedRow[11] = input.refund.toString(); // Refund
          updatedRow[12] = input.returnable;      // Returnable
          return updatedRow;
        }
        return row;
      });

      setStorageItem(RENTALS_KEY, JSON.stringify(updatedData));
      console.log('[mockSheets] Rental finished:', input.rentalNo);
    } catch (error) {
      console.error('[mockSheets] Error finishing rental:', error);
      throw new Error('レンタル返却データの更新に失敗しました');
    }
  },
};

// デバッグ用のヘルパー関数
export function clearMockData(): void {
  if (isLocalStorageAvailable()) {
    localStorage.removeItem(SALES_KEY);
    localStorage.removeItem(RENTALS_KEY);
  } else {
    delete serverSideStorage[SALES_KEY];
    delete serverSideStorage[RENTALS_KEY];
  }
  console.log('[mockSheets] Mock data cleared');
}

export function getMockData(): { sales: string[][], rentals: string[][] } {
  const sales = JSON.parse(getStorageItem(SALES_KEY) || '[]');
  const rentals = JSON.parse(getStorageItem(RENTALS_KEY) || '[]');
  return { sales, rentals };
}