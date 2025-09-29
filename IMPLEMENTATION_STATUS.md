# お面販売・レンタル管理システム - 実装状況

## 🎯 プロジェクト概要
Next.js 15.5.2 で構築された学園祭向けのお面販売・レンタル管理システム

## ✅ 実装済み機能

### 1. 基本構造・設定
- **フレームワーク**: Next.js + TypeScript + Material-UI
- **状態管理**: Zustand によるグローバル状態管理
- **データ保存**: Google Sheets API または localStorage による模擬データ保存

### 2. 商品管理
**商品データ**: `src/lib/constants.ts:49-72`
- **お面（11種類）**: ¥500、レンタル可
  - 狐面ホワイト/レッド、天狗面、般若面、ひょっとこ面、おかめ面、鬼面青/赤、猫面、犬面、龍面
- **民芸お面（4種類）**: ¥1,000、レンタル可（料金2倍）
  - 伝統狐面（金）、伝統天狗面（朱）、手彫り般若面、古典ひょっとこ面
- **ビニール玩具（2種類）**: ¥300、レンタル不可
  - アニマル仮面セット、キャラクター仮面セット

### 3. 販売フロー（完全実装 ✅）
- **トップページ**: `src/pages/index.tsx` - モード選択画面
- **商品選択**: `src/pages/select.tsx` - カテゴリ別商品一覧
- **購入確認**: `src/pages/confirm.tsx` - 注文内容確認・決済
- **完了画面**: `src/pages/done.tsx` - 処理完了通知

### 4. レンタルフロー（85% 完成 🟡）
- **商品選択**: レンタルプラン選択機能付き
- **確認画面**: 注意事項同意・お名前入力・レンタル番号生成
- **貸出票**: レンタル開始時の票券表示機能
- **データ保存**: レンタル開始データのスプレッドシート記録

### 5. 料金計算システム
**料金計算**: `src/lib/pricing.ts`
- **販売価格**: `3-14行` - カテゴリ別固定価格
- **レンタル料金**: `16-41行` - 時間ベース料金計算
  - 1時間: ¥100、3時間: ¥200、6時間: ¥300、終日: ¥400
  - 民芸お面は料金2倍
  - 15分の猶予時間設定

### 6. データ保存機能
- **API**: `src/pages/api/sheets/append.ts` - スプレッドシート書き込み
- **モック**: `src/lib/sheets/mockSheets.ts` - localStorage保存
- **実接続**: `src/lib/sheets/googleSheets.ts` - Google Sheets API

### 7. UI コンポーネント
- **Header**: `src/components/Header.tsx` - 共通ヘッダー
- **ProductCard**: `src/components/ProductCard.tsx` - 商品カード
- **CartDrawer**: `src/components/CartDrawer.tsx` - カートサイドバー
- **QtyPicker**: `src/components/QtyPicker.tsx` - 数量選択
- **NoticeBlock**: `src/components/NoticeBlock.tsx` - 注意事項表示

## ❌ 未実装部分

### 1. 返却フロー（主要な未実装機能 🔴）
**場所**: `src/pages/return.tsx:23` - プレースホルダー実装のみ

**必要な実装**:
- [ ] レンタル番号・名前検索機能
- [ ] 返却時刻入力・使用時間自動計算
- [ ] 料金確定・返金額計算
- [ ] レンタルデータ更新（EndTime, UsedMinutes, Amount, Refund等）
- [ ] 返却完了処理

### 2. データ読み取り機能
- [ ] スプレッドシートからのデータ取得API
- [ ] レンタル中商品の一覧表示
- [ ] 売上・レンタル状況の集計機能

### 3. エラー処理・認証
現在のエラー（CLAUDE指示より）:
- [ ] JWT_SESSION_ERROR: データベース接続エラー
- [ ] 複合化操作失敗エラー

### 4. 細かな改善点
- [ ] 在庫管理機能（現在はダミー表示）
- [ ] 商品画像表示
- [ ] より詳細なエラーハンドリング
- [ ] レスポンシブデザインの最適化

## 📊 実装進捗

| 機能 | 進捗 | 状態 |
|------|------|------|
| 販売機能 | 100% | ✅ 完成 |
| レンタル開始 | 85% | 🟡 ほぼ完成 |
| 返却機能 | 10% | 🔴 未実装 |
| データ管理 | 70% | 🟡 部分実装 |

## 🎯 次の優先タスク

1. **返却フロー機能の実装** (`src/pages/return.tsx`)
   - レンタル検索API の実装
   - 返却処理ロジックの実装
   - 料金計算・返金処理

2. **データ読み取りAPI の実装**
   - レンタル中データ取得
   - 検索機能の実装

3. **認証エラーの解決**
   - JWT/データベース接続問題の修正

## 📁 主要ファイル構成

```
src/
├── pages/
│   ├── index.tsx          # トップページ（完成）
│   ├── select.tsx         # 商品選択（完成）
│   ├── confirm.tsx        # 確認画面（完成）
│   ├── done.tsx           # 完了画面（完成）
│   ├── return.tsx         # 返却画面（未実装）
│   └── api/sheets/append.ts # データ保存API（完成）
├── components/            # UIコンポーネント（完成）
├── lib/
│   ├── constants.ts       # 商品データ定義（完成）
│   ├── pricing.ts         # 料金計算（完成）
│   ├── rental.ts          # レンタル関連（完成）
│   └── sheets/            # データ保存（完成）
└── store/
    └── cartStore.ts       # 状態管理（完成）
```

## 🔧 技術スタック

- **Frontend**: Next.js 15.5.2, React 18, TypeScript
- **UI**: Material-UI (MUI) 5.15.15
- **State Management**: Zustand 4.5.2
- **Data Storage**: Google Sheets API / localStorage
- **Date Handling**: date-fns 3.6.0

---

*最終更新: 2025年09月29日*