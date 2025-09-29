import type { NextApiRequest, NextApiResponse } from 'next';
import { sheets } from '@/lib/sheets';

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

    // 各行の形式をチェック
    for (const row of rows) {
      if (!Array.isArray(row)) {
        return res.status(400).json({
          success: false,
          error: 'Each row must be an array of strings',
        });
      }
    }

    console.log(`[API] Appending ${type} data:`, rows);

    // sheets ライブラリを使ってデータを追加
    if (type === 'sale') {
      await sheets.appendToSales(rows);
    } else {
      await sheets.appendToRentals(rows);
    }

    return res.status(200).json({
      success: true,
      message: `${type} data appended successfully`,
    });

  } catch (error) {
    console.error('[API] Error in /api/sheets/append:', error);

    return res.status(500).json({
      success: false,
      error: (error as Error).message || 'Internal server error',
    });
  }
}