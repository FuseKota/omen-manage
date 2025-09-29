/**
 * お面販売・レンタル管理システム - Google Apps Script API
 * Next.js アプリからのリクエストを受け取り、スプレッドシートにデータを保存・更新する
 */

// 設定（必要に応じてScript Propertiesに移行可能）
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE'; // ここに実際のスプレッドシートIDを設定
const API_KEY = 'gas-api-key-2025'; // ここに実際のAPIキーを設定

/**
 * メインエントリーポイント（POST のみ）
 */
function doPost(e) {
  try {
    // CORS対応
    const response = {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type, x-api-key, x-timestamp, x-sign',
        'Vary': 'Origin'
      }
    };

    // APIキー認証
    const apiKey = e.parameter['x-api-key'] || e.postData?.headers?.['x-api-key'];
    if (!apiKey || apiKey !== API_KEY) {
      return ContentService.createTextOutput(JSON.stringify({
        error: 'Unauthorized: Invalid API key',
        code: 401
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // リクエストボディの解析
    let requestData;
    try {
      requestData = JSON.parse(e.postData.contents);
    } catch (parseError) {
      return ContentService.createTextOutput(JSON.stringify({
        error: 'Invalid JSON in request body',
        code: 400
      })).setMimeType(ContentService.MimeType.JSON);
    }

    const { action } = requestData;
    if (!action) {
      return ContentService.createTextOutput(JSON.stringify({
        error: 'Missing required parameter: action',
        code: 400
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // アクション別処理
    let result;
    switch (action) {
      case 'appendSales':
        result = handleAppendSales_(requestData);
        break;
      case 'appendRentals':
        result = handleAppendRentals_(requestData);
        break;
      case 'getRentals':
        result = handleGetRentals_(requestData);
        break;
      case 'getRentalByNo':
        result = handleGetRentalByNo_(requestData);
        break;
      case 'finishRental':
        result = handleFinishRental_(requestData);
        break;
      default:
        return ContentService.createTextOutput(JSON.stringify({
          error: `Unknown action: ${action}`,
          code: 400
        })).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    console.error('doPost error:', error);
    return ContentService.createTextOutput(JSON.stringify({
      error: 'Internal server error: ' + error.message,
      code: 500
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * OPTIONS リクエスト対応（プリフライト）
 */
function doOptions(e) {
  return ContentService.createTextOutput('')
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-api-key, x-timestamp, x-sign',
      'Access-Control-Max-Age': '86400'
    });
}

// ============================================================================
// アクションハンドラー
// ============================================================================

/**
 * Sales シートに販売データを追加
 */
function handleAppendSales_(data) {
  const { rows } = data;
  if (!rows || !Array.isArray(rows)) {
    return { error: 'Missing or invalid rows parameter', code: 400 };
  }

  try {
    const sheet = getSheetByName_('Sales');
    const rowArrays = rows.map(row => [
      row.Date || '',
      row.Time || '',
      row.Category || '',
      row.ProductName || '',
      row.Quantity || '',
      row.UnitPrice || '',
      row.Subtotal || '',
      row.Staff || '',
      row.Note || ''
    ]);

    appendRows_(sheet, rowArrays);

    return {
      ok: true,
      message: `${rows.length} sales records added successfully`
    };
  } catch (error) {
    console.error('handleAppendSales error:', error);
    return { error: 'Failed to append sales data: ' + error.message, code: 500 };
  }
}

/**
 * Rentals シートにレンタルデータを追加
 */
function handleAppendRentals_(data) {
  const { rows } = data;
  if (!rows || !Array.isArray(rows)) {
    return { error: 'Missing or invalid rows parameter', code: 400 };
  }

  try {
    const sheet = getSheetByName_('Rentals');
    const rowArrays = rows.map(row => [
      row.RentalNo || '',
      row.Name || '',
      row.ProductName || '',
      row.Category || '',
      row.Date || '',
      row.StartTime || '',
      row.EndTime || '',
      row.UsedMinutes || '',
      row.Plan || '',
      row.Amount || '',
      row.Deposit || '',
      row.Refund || '',
      row.Returnable || '',
      row.Staff || '',
      row.Note || ''
    ]);

    appendRows_(sheet, rowArrays);

    return {
      ok: true,
      message: `${rows.length} rental records added successfully`
    };
  } catch (error) {
    console.error('handleAppendRentals error:', error);
    return { error: 'Failed to append rental data: ' + error.message, code: 500 };
  }
}

/**
 * Rentals シートからデータを取得
 */
function handleGetRentals_(data) {
  const { unreturnedOnly = false, rentalNo, name } = data;

  try {
    const sheet = getSheetByName_('Rentals');
    const allData = readAll_(sheet);

    let filteredData = allData;

    // 未返却のみフィルタ
    if (unreturnedOnly) {
      filteredData = filteredData.filter(row => !row.EndTime || row.EndTime.trim() === '');
    }

    // レンタル番号での検索
    if (rentalNo) {
      filteredData = filteredData.filter(row => row.RentalNo === rentalNo.toString());
    }

    // 名前での検索（部分一致）
    if (name) {
      const searchName = name.toLowerCase();
      filteredData = filteredData.filter(row =>
        row.Name.toLowerCase().includes(searchName)
      );
    }

    return {
      ok: true,
      data: filteredData,
      count: filteredData.length
    };
  } catch (error) {
    console.error('handleGetRentals error:', error);
    return { error: 'Failed to get rental data: ' + error.message, code: 500 };
  }
}

/**
 * レンタル番号で1件取得
 */
function handleGetRentalByNo_(data) {
  const { rentalNo } = data;
  if (!rentalNo) {
    return { error: 'Missing required parameter: rentalNo', code: 400 };
  }

  try {
    const sheet = getSheetByName_('Rentals');
    const allData = readAll_(sheet);

    const rental = allData.find(row => row.RentalNo === rentalNo.toString());

    if (!rental) {
      return { ok: true, data: null };
    }

    return { ok: true, data: rental };
  } catch (error) {
    console.error('handleGetRentalByNo error:', error);
    return { error: 'Failed to get rental by number: ' + error.message, code: 500 };
  }
}

/**
 * レンタル返却処理（行更新）
 */
function handleFinishRental_(data) {
  const { rentalNo, endTime, returnable } = data;

  if (!rentalNo || !endTime || !returnable) {
    return {
      error: 'Missing required parameters: rentalNo, endTime, returnable',
      code: 400
    };
  }

  if (returnable !== 'OK' && returnable !== 'NG') {
    return {
      error: 'returnable must be "OK" or "NG"',
      code: 400
    };
  }

  try {
    const sheet = getSheetByName_('Rentals');
    const rowIndex = findRowIndexByValue_(sheet, 'RentalNo', rentalNo.toString());

    if (rowIndex === -1) {
      return { error: `Rental not found: ${rentalNo}`, code: 404 };
    }

    // 既存データの取得
    const existingData = sheet.getRange(rowIndex + 1, 1, 1, 15).getValues()[0];
    const currentRental = {
      RentalNo: existingData[0],
      Name: existingData[1],
      ProductName: existingData[2],
      Category: existingData[3],
      Date: existingData[4],
      StartTime: existingData[5],
      EndTime: existingData[6],
      UsedMinutes: existingData[7],
      Plan: existingData[8],
      Amount: existingData[9],
      Deposit: existingData[10],
      Refund: existingData[11],
      Returnable: existingData[12],
      Staff: existingData[13],
      Note: existingData[14]
    };

    // 既に返却済みかチェック
    if (currentRental.EndTime && currentRental.EndTime.toString().trim() !== '') {
      return { error: `Rental ${rentalNo} is already returned`, code: 400 };
    }

    // 使用時間計算
    const usedMinutes = calculateUsedMinutes_(currentRental.Date, currentRental.StartTime, endTime);

    let plan, amount, refund;

    if (returnable === 'NG') {
      plan = '返却不可';
      amount = 0;
      refund = 0;
    } else {
      const calc = calcPlanAndAmount_(currentRental.Category, usedMinutes);
      plan = calc.plan;
      amount = calc.amount;
      refund = Math.max(0, parseInt(currentRental.Deposit || 0) - amount);
    }

    // 行更新
    const updateData = {
      EndTime: endTime,
      UsedMinutes: usedMinutes.toString(),
      Plan: plan,
      Amount: amount.toString(),
      Refund: refund.toString(),
      Returnable: returnable
    };

    updateRow_(sheet, rowIndex, updateData);

    return {
      ok: true,
      data: {
        usedMinutes,
        plan,
        amount,
        deposit: parseInt(currentRental.Deposit || 0),
        refund
      }
    };
  } catch (error) {
    console.error('handleFinishRental error:', error);
    return { error: 'Failed to finish rental: ' + error.message, code: 500 };
  }
}

// ============================================================================
// ユーティリティ関数
// ============================================================================

/**
 * シート名でシートを取得
 */
function getSheetByName_(name) {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = spreadsheet.getSheetByName(name);
  if (!sheet) {
    throw new Error(`Sheet not found: ${name}`);
  }
  return sheet;
}

/**
 * シート全体を読み取り、オブジェクト配列として返す
 */
function readAll_(sheet) {
  const values = sheet.getDataRange().getValues();
  if (values.length === 0) return [];

  const headers = values[0];
  const data = values.slice(1);

  return data.map(row => {
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = row[index] || '';
    });
    return obj;
  });
}

/**
 * シートに複数行を追加
 */
function appendRows_(sheet, rows) {
  if (rows.length === 0) return;

  const lastRow = sheet.getLastRow();
  const range = sheet.getRange(lastRow + 1, 1, rows.length, rows[0].length);
  range.setValues(rows);
}

/**
 * 指定した列の値で行を検索し、行インデックス（0ベース）を返す
 */
function findRowIndexByValue_(sheet, headerName, searchValue) {
  const values = sheet.getDataRange().getValues();
  if (values.length === 0) return -1;

  const headers = values[0];
  const columnIndex = headers.indexOf(headerName);
  if (columnIndex === -1) return -1;

  for (let i = 1; i < values.length; i++) {
    if (values[i][columnIndex] === searchValue) {
      return i; // 1行目はヘッダーなので、実際のデータ行の0ベースインデックス
    }
  }

  return -1;
}

/**
 * 指定行の特定列を更新
 */
function updateRow_(sheet, rowIndex, updateData) {
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  Object.keys(updateData).forEach(key => {
    const columnIndex = headers.indexOf(key);
    if (columnIndex !== -1) {
      sheet.getRange(rowIndex + 1, columnIndex + 1).setValue(updateData[key]);
    }
  });
}

/**
 * 使用時間（分）を計算
 */
function calculateUsedMinutes_(startDate, startTime, endTime) {
  try {
    // 日付文字列と時刻文字列を組み合わせて Date オブジェクトを作成
    const startDateTime = new Date(`${startDate} ${startTime}`);
    const endDateTime = new Date(`${startDate} ${endTime}`);

    // 分単位の差分を計算
    const diffMs = endDateTime.getTime() - startDateTime.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    return Math.max(0, diffMinutes);
  } catch (error) {
    console.error('calculateUsedMinutes error:', error);
    return 0;
  }
}

/**
 * 料金計算（猶予15分込み）
 */
function calcPlanAndAmount_(category, usedMinutes) {
  const hours = usedMinutes / 60;

  let plan;
  let baseAmount;

  // 猶予15分を考慮してプランを決定
  if (hours <= 1.25) { // 1時間15分まで
    plan = '1h';
    baseAmount = 100;
  } else if (hours <= 3.25) { // 3時間15分まで
    plan = '3h';
    baseAmount = 200;
  } else if (hours <= 6.25) { // 6時間15分まで
    plan = '6h';
    baseAmount = 300;
  } else { // 6時間15分超
    plan = 'allday';
    baseAmount = 400;
  }

  // 民芸お面は2倍
  const amount = category === 'MINGEI' ? baseAmount * 2 : baseAmount;

  return { plan, amount };
}