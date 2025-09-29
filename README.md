# 🎭 お面販売・レンタル管理システム

学園祭向けのお面販売・レンタル管理システムです。お面の販売とレンタルの両方に対応し、Google Sheets による簡単なデータ管理機能を提供します。

## 🚀 機能概要

### ✅ 実装済み機能
- **販売機能**: お面の購入フロー（完全実装）
- **レンタル開始**: お面のレンタル開始フロー（85%完成）
- **商品管理**: 3カテゴリ17種類の商品データ
- **料金計算**: 販売・レンタル料金の自動計算
- **データ保存**: Google Sheets / localStorage による記録

### 🚧 開発中機能
- **返却機能**: レンタル商品の返却処理（開発中）
- **データ読み取り**: レンタル状況の検索・一覧表示

## 📱 スクリーンショット

### メイン画面
- **トップページ**: 販売・レンタルモード選択
- **商品選択**: カテゴリ別商品一覧とカート機能
- **確認画面**: 注文内容確認と決済処理
- **完了画面**: 処理完了とレシート表示

## 🛠️ 技術スタック

- **Frontend**: Next.js 15.5.2, React 18, TypeScript
- **UI Framework**: Material-UI (MUI) 5.15.15
- **State Management**: Zustand 4.5.2
- **Data Storage**: Google Sheets API / localStorage fallback
- **Styling**: Emotion (CSS-in-JS)
- **Date Handling**: date-fns 3.6.0

## 📦 インストール・セットアップ

### 1. リポジトリのクローン
```bash
git clone https://github.com/your-username/omen-manage.git
cd omen-manage
```

### 2. 依存関係のインストール
```bash
npm install
```

### 3. 環境変数の設定（オプション）
Google Sheets連携を使用する場合：

```bash
cp .env.local.example .env.local
```

`.env.local` を編集：
```env
GOOGLE_SERVICE_ACCOUNT_BASE64=your_service_account_base64
GOOGLE_SHEETS_SPREADSHEET_ID=your_spreadsheet_id
```

### 4. 開発サーバーの起動
```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開く

## 🎯 使用方法

### 販売フロー
1. トップページで「購入」を選択
2. カテゴリから商品を選択してカートに追加
3. 確認画面で注文内容を確認
4. 「現金を受け取った」ボタンで決済完了

### レンタルフロー
1. トップページで「レンタル」を選択
2. 商品選択時にレンタルプランを指定
3. 注意事項に同意し、お名前を入力（任意）
4. レンタル番号が発行され、貸出票を表示
5. 預かり金（販売価格）を受け取り

### 商品カテゴリ
- **お面** (¥500): 狐面、天狗面、般若面など11種類
- **民芸お面** (¥1,000): 伝統的な手作りお面4種類
- **ビニール玩具** (¥300): アニマル・キャラクター仮面2種類（販売のみ）

### レンタル料金
- **1時間**: ¥100
- **3時間**: ¥200
- **6時間**: ¥300
- **終日**: ¥400

※ 民芸お面は料金2倍、15分の猶予時間あり

## 📁 プロジェクト構成

```
src/
├── pages/
│   ├── index.tsx          # トップページ
│   ├── select.tsx         # 商品選択
│   ├── confirm.tsx        # 確認画面
│   ├── done.tsx           # 完了画面
│   ├── return.tsx         # 返却画面（開発中）
│   └── api/sheets/append.ts # データ保存API
├── components/
│   ├── Header.tsx         # 共通ヘッダー
│   ├── ProductCard.tsx    # 商品カード
│   ├── CartDrawer.tsx     # カートサイドバー
│   ├── QtyPicker.tsx      # 数量選択
│   └── NoticeBlock.tsx    # 注意事項
├── lib/
│   ├── constants.ts       # 商品データ定義
│   ├── pricing.ts         # 料金計算
│   ├── rental.ts          # レンタル関連
│   └── sheets/            # データ保存
├── store/
│   └── cartStore.ts       # 状態管理
└── styles/
    └── theme.ts           # MUIテーマ
```

## 🔧 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# プロダクションビルド
npm run build

# プロダクションサーバー起動
npm start

# ESLint実行
npm run lint
```

## 📊 データ管理

### Google Sheets 連携
- **Sales シート**: 販売データの記録
- **Rentals シート**: レンタルデータの記録

### localStorage フォールバック
Google Sheets が利用できない場合、ブラウザの localStorage にデータを保存

## 🚧 今後の開発予定

### 優先度：高
- [ ] **返却機能の実装**: レンタル商品の返却処理
- [ ] **レンタル検索**: 番号・名前による検索機能
- [ ] **料金計算**: 返却時の自動料金計算

### 優先度：中
- [ ] **データ読み取りAPI**: レンタル状況の取得
- [ ] **管理画面**: 売上・レンタル状況の確認
- [ ] **在庫管理**: リアルタイム在庫表示

### 優先度：低
- [ ] **商品画像**: 商品写真の表示
- [ ] **印刷機能**: レシート・貸出票の印刷
- [ ] **統計機能**: 売上分析・レポート

## 🤝 コントリビューション

1. このリポジトリをフォーク
2. フィーチャーブランチを作成 (`git checkout -b feature/AmazingFeature`)
3. 変更をコミット (`git commit -m 'Add some AmazingFeature'`)
4. ブランチにプッシュ (`git push origin feature/AmazingFeature`)
5. プルリクエストを作成

## 📄 ライセンス

このプロジェクトは MIT ライセンスの下で公開されています。詳細は [LICENSE](LICENSE) ファイルを参照してください。

## 📞 サポート

問題やご質問がある場合は、[Issues](https://github.com/your-username/omen-manage/issues) でお知らせください。

---

**学園祭お面ショップ** - お面で笑顔をお届けします 🎭✨