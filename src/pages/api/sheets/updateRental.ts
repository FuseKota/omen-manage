// Google Apps Script 経由でレンタル返却処理を行うAPI
// 使用時間計算、料金確定、返金額計算はGAS側で実行

import type { NextApiRequest, NextApiResponse } from 'next';
import { finishRentalInGAS } from '@/lib/gasClient';
import { formatTime, getCurrentJapanTime } from '@/lib/rental';

type UpdateRequest = {
  rentalNo: string;
  endTime: string; // "HH:mm:ss" または ISO
  returnable: 'OK' | 'NG';
};

type UpdateResponse = {
  ok: boolean;
  usedMinutes?: number;
  plan?: string;
  amount?: number;
  deposit?: number;
  refund?: number;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UpdateResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      ok: false,
      error: 'Method not allowed. Use POST.',
    });
  }

  try {
    const { rentalNo, endTime, returnable }: UpdateRequest = req.body;

    // バリデーション
    if (!rentalNo || !endTime || !returnable) {
      return res.status(400).json({
        ok: false,
        error: 'rentalNo, endTime, returnable は必須です',
      });
    }

    if (returnable !== 'OK' && returnable !== 'NG') {
      return res.status(400).json({
        ok: false,
        error: 'returnable は "OK" または "NG" である必要があります',
      });
    }

    console.log(`[API] Updating rental via GAS:`, { rentalNo, endTime, returnable });

    // 時刻の正規化（HH:mm:ss 形式に統一）
    const normalizedEndTime = normalizeTimeString(endTime);

    // GAS経由でレンタル返却処理を実行
    // 使用時間計算、料金計算、返金計算はすべてGAS側で行われる
    const result = await finishRentalInGAS({
      rentalNo,
      endTime: normalizedEndTime,
      returnable,
    });

    console.log(`[API] Rental updated successfully via GAS:`, {
      rentalNo,
      ...result,
    });

    return res.status(200).json({
      ok: true,
      ...result,
    });

  } catch (error) {
    console.error('[API] Error in /api/sheets/updateRental:', error);

    return res.status(500).json({
      ok: false,
      error: (error as Error).message || 'Internal server error',
    });
  }
}

// 時刻文字列を HH:mm:ss 形式に正規化
function normalizeTimeString(timeInput: string): string {
  try {
    // ISO形式の場合
    if (timeInput.includes('T') || timeInput.includes('Z')) {
      const date = new Date(timeInput);
      return formatTime(date);
    }

    // HH:mm または HH:mm:ss 形式の場合
    if (timeInput.match(/^\d{1,2}:\d{2}(:\d{2})?$/)) {
      if (!timeInput.includes(':', timeInput.lastIndexOf(':'))) {
        // HH:mm 形式の場合、秒を追加
        return `${timeInput}:00`;
      }
      return timeInput; // 既に HH:mm:ss 形式
    }

    // 現在時刻をデフォルトとして使用
    console.warn('[normalizeTimeString] Invalid time format, using current time:', timeInput);
    return formatTime(getCurrentJapanTime());
  } catch (error) {
    console.error('[normalizeTimeString] Error normalizing time:', error);
    return formatTime(getCurrentJapanTime());
  }
}