// Google Apps Script 経由でレンタルデータを検索するAPI
// 番号または名前でレンタルデータを検索し、未返却のもののみを返す

import type { NextApiRequest, NextApiResponse } from 'next';
import { getRentalsFromGAS, getRentalByNoFromGAS } from '@/lib/gasClient';

// レンタル行の型定義
export interface RentalRow {
  RentalNo: string;
  Name: string;
  ProductName: string;
  Category: string;
  Date: string;
  StartTime: string;
  EndTime: string;
  UsedMinutes: string;
  Plan: string;
  Amount: string;
  Deposit: string;
  Refund: string;
  Returnable: string;
  Staff: string;
  Note: string;
}

type QueryRequest = {
  type: 'rental';
  q: {
    rentalNo?: string;
    name?: string;
  };
};

type QueryResponse = {
  success: boolean;
  rows?: RentalRow[];
  count?: number;
  message?: string;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<QueryResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed. Use POST.',
    });
  }

  try {
    const { type, q }: QueryRequest = req.body;

    // バリデーション
    if (!type || type !== 'rental') {
      return res.status(400).json({
        success: false,
        error: 'Invalid type. Must be "rental"',
      });
    }

    if (!q || (!q.rentalNo && !q.name)) {
      return res.status(400).json({
        success: false,
        error: 'rentalNo または name のいずれかが必要です',
      });
    }

    console.log(`[API] Querying rentals via GAS:`, q);

    let filteredRentals: RentalRow[];

    if (q.rentalNo) {
      // レンタル番号での検索（1件取得）
      const rental = await getRentalByNoFromGAS(q.rentalNo.trim());
      if (rental && (!rental.EndTime || rental.EndTime.trim() === '')) {
        filteredRentals = [rental];
      } else {
        filteredRentals = [];
      }
    } else if (q.name) {
      // 名前での検索（部分一致、未返却のみ）
      filteredRentals = await getRentalsFromGAS({
        unreturnedOnly: true,
        name: q.name.trim(),
      });
    } else {
      filteredRentals = [];
    }

    console.log(`[API] Found ${filteredRentals.length} unreturned rentals`);

    return res.status(200).json({
      success: true,
      rows: filteredRentals,
      count: filteredRentals.length,
      message: `${filteredRentals.length}件の未返却データが見つかりました`,
    });

  } catch (error) {
    console.error('[API] Error in /api/sheets/query:', error);

    return res.status(500).json({
      success: false,
      error: (error as Error).message || 'Internal server error',
    });
  }
}