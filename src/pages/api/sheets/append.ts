// Google Apps Script 経由でスプレッドシートにデータを追加するAPI
// 既存のmockSheets/googleSheetsから GAS に移行

import type { NextApiRequest, NextApiResponse } from 'next';
import { appendSalesToGAS, appendRentalsToGAS } from '@/lib/gasClient';

type AppendRequest = {
  type: 'sale' | 'rental';
  rows: string[][];
};

type AppendResponse = {
  success: boolean;
  message?: string;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AppendResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed. Use POST.',
    });
  }

  try {
    const { type, rows }: AppendRequest = req.body;

    // バリデーション
    if (!type || !rows) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: type, rows',
      });
    }

    if (type !== 'sale' && type !== 'rental') {
      return res.status(400).json({
        success: false,
        error: 'Invalid type. Must be "sale" or "rental"',
      });
    }

    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'rows must be a non-empty array',
      });
    }

    console.log(`[API] Appending ${type} data via GAS:`, rows.length, 'rows');

    // データを適切な形式に変換してGASに送信
    if (type === 'sale') {
      // Sales 形式: [Date, Time, Category, ProductName, Quantity, UnitPrice, Subtotal, Staff, Note]
      const salesRows = rows.map(row => ({
        Date: row[0] || '',
        Time: row[1] || '',
        Category: row[2] || '',
        ProductName: row[3] || '',
        Quantity: row[4] || '',
        UnitPrice: row[5] || '',
        Subtotal: row[6] || '',
        Staff: row[7] || '',
        Note: row[8] || '',
      }));

      await appendSalesToGAS(salesRows);
    } else {
      // Rentals 形式: [RentalNo, Name, ProductName, Category, Date, StartTime, EndTime, UsedMinutes, Plan, Amount, Deposit, Refund, Returnable, Staff, Note]
      const rentalRows = rows.map(row => ({
        RentalNo: row[0] || '',
        Name: row[1] || '',
        ProductName: row[2] || '',
        Category: row[3] || '',
        Date: row[4] || '',
        StartTime: row[5] || '',
        EndTime: row[6] || '',
        UsedMinutes: row[7] || '',
        Plan: row[8] || '',
        Amount: row[9] || '',
        Deposit: row[10] || '',
        Refund: row[11] || '',
        Returnable: row[12] || '',
        Staff: row[13] || '',
        Note: row[14] || '',
      }));

      await appendRentalsToGAS(rentalRows);
    }

    return res.status(200).json({
      success: true,
      message: `${type} data appended successfully via GAS`,
    });

  } catch (error) {
    console.error('[API] Error in /api/sheets/append:', error);

    return res.status(500).json({
      success: false,
      error: (error as Error).message || 'Internal server error',
    });
  }
}