---
name: deploy
description: Firebase Hosting へのビルド・デプロイ手順（Codespaces環境）
triggers:
  - デプロイ、本番反映、firebase deploy に関する作業
  - ビルドエラーの調査
  - 白い画面（ブランクページ）の調査
---

# デプロイ手順スキル

## 環境

- **コード編集:** GitHub Codespaces（このターミナル）
- **ローカルPC:** Windows（PowerShell）—Node.js実行不可、git操作のみ
- **本番URL:** https://edogawa-m-league-v2.web.app
- **Firebase プロジェクトID:** edogawa-m-league-v2

## Codespaces でのデプロイ手順

```bash
# 1. 最新コードを取得（必要な場合）
git fetch origin
git reset --hard origin/master

# 2. 依存関係インストール（package.json 変更時のみ）
npm install

# 3. ビルド
npm run build

# 4. .firebaserc の作成（毎回必要！）
cat > .firebaserc << 'EOF'
{
  "projects": {
    "default": "edogawa-m-league-v2"
  }
}
EOF

# 5. デプロイ
firebase deploy --only hosting
```

## ⚠️ 注意事項

### .firebaserc は毎回作成が必要
`.gitignore` に含まれているため git に保存されない。
Codespaces セッションをまたぐたびに手順4を実行する。

### PowerShell では `&&` が使えない
Windows の PowerShell でコマンドを実行する場合は1行ずつ実行すること。

### firebase-tools が消える場合
Codespaces を再起動した場合は再インストールが必要なことがある:
```bash
npm install -g firebase-tools
firebase login --no-localhost
```

## ビルドチェック

- `npm run build` でエラーがなければ基本OK
- TypeScript エラーは `tsc` で検出される（build に含まれる）
- チャンクサイズ警告（500KB超）は無視してよい

## 白い画面になった場合の診断

1. `npm run build` を実行してビルドエラーがないか確認
2. `dist/assets/*.js` に Firebase APIキーが含まれているか確認:
   ```bash
   grep -c "edogawa-m-league-v2" dist/assets/*.js
   ```
3. `.env.local` の環境変数が正しいか確認
4. 古いバージョンがデプロイされている可能性 → 再デプロイで解決

## 環境変数（.env.local）

```
VITE_FIREBASE_API_KEY=AIzaSyCscNzymOeTCHXxp2A-ERtC36ejai76RDs
VITE_FIREBASE_AUTH_DOMAIN=edogawa-m-league-v2.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=edogawa-m-league-v2
VITE_FIREBASE_STORAGE_BUCKET=edogawa-m-league-v2.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=1028830191484
VITE_FIREBASE_APP_ID=1:1028830191484:web:f62175c940ee128a8ecef9
```

これらはビルド時に JS にインライン展開される。
