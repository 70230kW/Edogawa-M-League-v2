# MahjongLeague 🀄

仲間内のリーグ戦管理に特化した、麻雀成績管理Webアプリです。

## 機能

- Googleアカウントでログイン
- リーグ管理・招待コード共有
- 対局記録（Mリーグ公式ルール準拠のポイント自動計算）
- 役満・チョンボ記録（複合可否チェック付き）
- シーズン管理・成績統計
- タイムライン（日報自動生成・役満速報）
- トロフィー・実績システム
- ルール確認ページ（Mリーグ公式）

## セットアップ

### 1. 依存パッケージのインストール

```bash
npm install
```

### 2. Firebase プロジェクトの作成

1. [Firebase Console](https://console.firebase.google.com/) でプロジェクトを作成
2. Authentication → Google ログインを有効化
3. Firestore Database を作成（本番モードで開始）
4. Hosting を有効化

### 3. 環境変数の設定

```bash
cp .env.example .env.local
```

`.env.local` に Firebase の設定値を入力してください：

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

### 4. Firebase CLI のセットアップ

```bash
npm install -g firebase-tools
firebase login
firebase use --add  # プロジェクトを選択
```

### 5. Firestore セキュリティルールのデプロイ

```bash
firebase deploy --only firestore:rules
```

### 6. 開発サーバーの起動

```bash
npm run dev
```

### 7. デモデータの投入（任意）

```bash
# .env.local を設定後
npm run seed
```

## デプロイ

```bash
npm run deploy
```

または GitHub の `main` ブランチにプッシュすると自動デプロイ（GitHub Actions）。

GitHub Secrets に以下を設定してください：
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `FIREBASE_SERVICE_ACCOUNT`（Firebase Hosting GitHub Action 用）

## 技術スタック

- React 18 + TypeScript + Vite
- Tailwind CSS
- Framer Motion
- Recharts
- Zustand
- Firebase v10（Firestore + Authentication + Hosting）
- React Router v6
- date-fns
