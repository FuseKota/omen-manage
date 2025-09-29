// Google Apps Script クライアント
// Next.js API ルートからGASへのリクエストを行うユーティリティ

export interface GASRequest {
  action: string;
  [key: string]: any;
}

export interface GASResponse<T = any> {
  ok?: boolean;
  error?: string;
  code?: number;
  data?: T;
  message?: string;
  count?: number;
}

/**
 * GAS API への HTTP リクエストを実行
 */
export async function callGAS<T = any>(payload: GASRequest): Promise<GASResponse<T>> {
  const gasBaseUrl = process.env.GAS_BASE_URL;
  const gasApiKey = process.env.GAS_API_KEY;

  if (!gasBaseUrl || !gasApiKey) {
    throw new Error('GAS_BASE_URL or GAS_API_KEY is not configured');
  }

  try {
    console.log('[GAS Client] Request:', { action: payload.action, ...payload });

    const response = await fetch(gasBaseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...payload,
        apiKey: gasApiKey
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[GAS Client] HTTP Error:', response.status, data);
      throw new Error(data.error || `HTTP ${response.status}`);
    }

    if (data.error) {
      console.error('[GAS Client] GAS Error:', data);
      throw new Error(data.error);
    }

    console.log('[GAS Client] Success:', { action: payload.action, hasData: !!data.data });
    return data;
  } catch (error) {
    console.error('[GAS Client] Request failed:', error);
    throw error;
  }
}

/**
 * Sales データを GAS に送信
 */
export async function appendSalesToGAS(rows: any[]): Promise<void> {
  const response = await callGAS({
    action: 'appendSales',
    rows,
  });

  if (!response.ok) {
    throw new Error(response.error || 'Failed to append sales data');
  }
}

/**
 * Rentals データを GAS に送信
 */
export async function appendRentalsToGAS(rows: any[]): Promise<void> {
  const response = await callGAS({
    action: 'appendRentals',
    rows,
  });

  if (!response.ok) {
    throw new Error(response.error || 'Failed to append rental data');
  }
}

/**
 * レンタルデータを GAS から取得
 */
export async function getRentalsFromGAS(params: {
  unreturnedOnly?: boolean;
  rentalNo?: string;
  name?: string;
}): Promise<any[]> {
  const response = await callGAS({
    action: 'getRentals',
    ...params,
  });

  if (!response.ok) {
    throw new Error(response.error || 'Failed to get rental data');
  }

  return response.data || [];
}

/**
 * レンタル番号で1件取得
 */
export async function getRentalByNoFromGAS(rentalNo: string): Promise<any | null> {
  const response = await callGAS({
    action: 'getRentalByNo',
    rentalNo,
  });

  if (!response.ok) {
    throw new Error(response.error || 'Failed to get rental by number');
  }

  return response.data || null;
}

/**
 * レンタル返却処理
 */
export async function finishRentalInGAS(params: {
  rentalNo: string;
  endTime: string;
  returnable: 'OK' | 'NG';
}): Promise<{
  usedMinutes: number;
  plan: string;
  amount: number;
  deposit: number;
  refund: number;
}> {
  const response = await callGAS({
    action: 'finishRental',
    ...params,
  });

  if (!response.ok) {
    throw new Error(response.error || 'Failed to finish rental');
  }

  return response.data;
}