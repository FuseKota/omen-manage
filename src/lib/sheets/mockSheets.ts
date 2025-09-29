// モック版のスプレッドシート連携
// localStorageにデータを保存する

export interface SheetsInterface {
  appendToSales: (rows: string[][]) => Promise<void>;
  appendToRentals: (rows: string[][]) => Promise<void>;
  getMaxRentalNumber: () => Promise<number>;
}

const SALES_KEY = 'omen_sales_data';
const RENTALS_KEY = 'omen_rentals_data';

export const mockSheets: SheetsInterface = {
  async appendToSales(rows: string[][]): Promise<void> {
    console.log('[mockSheets] appendToSales:', rows);

    try {
      const existingData = JSON.parse(localStorage.getItem(SALES_KEY) || '[]');
      const newData = [...existingData, ...rows];
      localStorage.setItem(SALES_KEY, JSON.stringify(newData));

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
      const existingData = JSON.parse(localStorage.getItem(RENTALS_KEY) || '[]');
      const newData = [...existingData, ...rows];
      localStorage.setItem(RENTALS_KEY, JSON.stringify(newData));

      // デバッグログ
      console.log('[mockSheets] Rentals data saved:', newData);
    } catch (error) {
      console.error('[mockSheets] Error saving rentals data:', error);
      throw new Error('レンタルデータの保存に失敗しました');
    }
  },

  async getMaxRentalNumber(): Promise<number> {
    try {
      const rentalsData = JSON.parse(localStorage.getItem(RENTALS_KEY) || '[]');

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
};

// デバッグ用のヘルパー関数
export function clearMockData(): void {
  localStorage.removeItem(SALES_KEY);
  localStorage.removeItem(RENTALS_KEY);
  console.log('[mockSheets] Mock data cleared');
}

export function getMockData(): { sales: string[][], rentals: string[][] } {
  const sales = JSON.parse(localStorage.getItem(SALES_KEY) || '[]');
  const rentals = JSON.parse(localStorage.getItem(RENTALS_KEY) || '[]');
  return { sales, rentals };
}