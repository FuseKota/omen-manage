import { format } from 'date-fns';

export function getCurrentJapanTime(): Date {
  // 日本時間での現在時刻を取得（簡易実装）
  const now = new Date();
  const japanOffset = 9 * 60; // JST = UTC+9
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  return new Date(utc + (japanOffset * 60000));
}

export function formatDate(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function formatTime(date: Date): string {
  return format(date, 'HH:mm:ss');
}

export function formatDateTime(date: Date): string {
  return format(date, 'yyyy-MM-dd HH:mm:ss');
}

export function getNextRentalNumber(): Promise<string> {
  // この関数は sheets のモックまたは実接続から最大番号を取得して+1する
  // ここでは暫定的にlocalStorageから取得する実装にしておく
  return new Promise((resolve) => {
    const currentMax = localStorage.getItem('lastRentalNumber');
    const nextNumber = currentMax ? parseInt(currentMax) + 1 : 1;
    localStorage.setItem('lastRentalNumber', nextNumber.toString());
    resolve(nextNumber.toString());
  });
}

export function getRentalTicketData(rentalNo: string, customerName: string, productNames: string[], startTime: Date) {
  return {
    rentalNo,
    customerName: customerName || '（お名前なし）',
    productNames,
    startTime: formatDateTime(startTime),
    instructions: [
      '返却時にこの番号をお伝えください',
      'お面は大切に扱ってください',
      '破損・紛失の場合は実費をいただきます',
      '営業終了30分前までに返却してください',
    ],
  };
}