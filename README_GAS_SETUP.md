# Google Apps Script 連携セットアップガイド

このガイドでは、お面販売・レンタル管理システムを Google Apps Script（GAS）経由でGoogleスプレッドシートと連携するための設定手順を説明します。

## 📋 セットアップ手順

### 1. Google スプレッドシートの作成

#### 1-1. 新しいスプレッドシートを作成
1. [Google Sheets](https://sheets.google.com/) にアクセス
2. 「空白」で新しいスプレッドシートを作成
3. ファイル名を「お面管理システム」に変更

#### 1-2. シートの構成
以下の2つのシートを作成し、1行目にヘッダーを設定：

**Sales シート（販売管理）**:
```
A1: Date        B1: Time        C1: Category    D1: ProductName
E1: Quantity    F1: UnitPrice   G1: Subtotal    H1: Staff       I1: Note
```

**Rentals シート（レンタル管理）**:
```
A1: RentalNo    B1: Name        C1: ProductName D1: Category    E1: Date
F1: StartTime   G1: EndTime     H1: UsedMinutes I1: Plan        J1: Amount
K1: Deposit     L1: Refund      M1: Returnable  N1: Staff       O1: Note
```

#### 1-3. スプレッドシートIDを取得
URLから ID を控えておく：
```
https://docs.google.com/spreadsheets/d/【この部分がID】/edit
```

### 2. Google Apps Script（GAS）プロジェクトの作成

#### 2-1. 新しいGASプロジェクトを作成
1. [Google Apps Script](https://script.google.com/) にアクセス
2. 「新しいプロジェクト」をクリック
3. プロジェクト名を「お面管理システム API」に変更

#### 2-2. Code.gs ファイルの実装
1. デフォルトの `Code.gs` の内容を削除
2. プロジェクトルートの `gas/Code.gs` の内容をコピー
3. 以下の設定値を実際の値に変更：
   ```javascript
   const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE'; // 手順1-3で取得したID
   const API_KEY = 'gas-api-key-2025'; // お好みの秘密キー（例：gas-api-key-2024）
   ```

#### 2-3. ウェブアプリとしてデプロイ
1. 「デプロイ」→「新しいデプロイ」をクリック
2. 種類：「ウェブアプリ」を選択
3. 設定：
   - **実行者**: 自分
   - **アクセスできるユーザー**: 全員（リンクを知っている人）
4. 「デプロイ」をクリック
5. **ウェブアプリのURL**を控える（例：`https://script.google.com/macros/s/XXXXX/exec`）

### 3. Next.js プロジェクトの環境変数設定

#### 3-1. .env.local ファイルの更新
```env
# Google Apps Script 連携設定
GAS_BASE_URL="https://script.google.com/macros/s/XXXXX/exec"  # 手順2-3で取得したURL
GAS_API_KEY="gas-api-key-2024"  # 手順2-2で設定したAPIキー

# シート名
SHEET_NAME_SALES="Sales"
SHEET_NAME_RENTALS="Rentals"

# タイムゾーン
TZ="Asia/Tokyo"
```

#### 3-2. 開発サーバーの再起動
```bash
npm run dev
```

## ✅ 動作確認手順

### 基本動作テスト

#### 1. 販売フローのテスト
1. `http://localhost:3000` でアプリにアクセス
2. 「購入」を選択
3. 商品をカートに追加
4. 確認画面で「現金を受け取った」をクリック
5. **確認**: Google Sheets の Sales シートにデータが追加される

#### 2. レンタル開始のテスト
1. 「レンタル」を選択
2. お面または民芸お面を選択（ビニール玩具は選択不可）
3. レンタルプランを選択してカートに追加
4. 確認画面で名前入力・注意事項同意
5. 「現金を受け取った」をクリック
6. **確認**:
   - レンタル番号が発行される
   - 貸出票が表示される
   - Google Sheets の Rentals シートにデータが追加される

#### 3. 返却フローのテスト
1. `/return` で返却画面にアクセス
2. レンタル番号で検索（上記で発行された番号）
3. 該当するレンタルが表示されることを確認
4. 返却時刻を調整（必要に応じて）
5. 「返却確定」をクリック
6. **確認**:
   - 使用時間・プラン・料金・返金額が表示される
   - Google Sheets の該当行に EndTime, UsedMinutes, Plan, Amount, Refund, Returnable が更新される

### 料金計算の境界値テスト

#### 4. 猶予時間（15分）のテスト
開始時刻を調整して以下をテスト：
- **1時間14分59秒使用**: 1時間プラン（¥100）
- **1時間15分01秒使用**: 3時間プラン（¥200）
- **3時間15分01秒使用**: 6時間プラン（¥300）
- **6時間15分01秒使用**: 終日プラン（¥400）

#### 5. 民芸お面の料金2倍テスト
- 民芸お面をレンタル・返却して料金が通常の2倍になることを確認

#### 6. 返却不可（NG）の動作テスト
- 返却状態を「返却不可」で処理して返金額が0円になることを確認

## 🔧 トラブルシューティング

### よくあるエラーと解決方法

#### `Unauthorized: Invalid API key`
- `.env.local` の `GAS_API_KEY` と GAS の `API_KEY` が一致しているか確認
- 開発サーバーを再起動

#### `Sheet not found: Sales` または `Rentals`
- スプレッドシートにSalesとRentalsシートが作成されているか確認
- シート名が正確に入力されているか確認

#### `Spreadsheet not found`
- GAS の `SPREADSHEET_ID` が正しく設定されているか確認
- スプレッドシートが削除されていないか確認

#### `Script not found`
- GAS のウェブアプリURLが正しく `.env.local` に設定されているか確認
- GASが正しくデプロイされているか確認

### デバッグ方法

#### GAS側のログ確認
1. Google Apps Script の実行ページでログを確認
2. `console.log` の出力を確認

#### Next.js側のログ確認
1. ターミナルでサーバーログを確認
2. ブラウザの開発者ツールでネットワークタブを確認

## 🔒 セキュリティ注意事項

1. **APIキー**:
   - 推測しにくい値を設定する
   - 本番環境では環境変数で管理する

2. **アクセス権限**:
   - GASのアクセス権は「リンクを知っている人」に限定
   - 必要に応じてより厳しい制限を設ける

3. **データ保護**:
   - スプレッドシートの共有設定を適切に管理
   - 機密データは暗号化を検討

## 📈 本番運用時の考慮事項

1. **パフォーマンス**:
   - データ量が多い場合はページネーション実装を検討
   - 定期的なデータアーカイブ

2. **バックアップ**:
   - スプレッドシートの定期バックアップ
   - GASコードのバージョン管理

3. **監視**:
   - エラー通知の設定
   - アクセスログの監視

---

このセットアップガイドに従って設定すれば、Google Apps Script を経由したスプレッドシート連携が完了します。