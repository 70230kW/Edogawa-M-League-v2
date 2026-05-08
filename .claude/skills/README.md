# 江戸川Mリーグ — Claude Skills

このプロジェクト専用のスキル集。Claudeが特定タスクで自動参照する専門知識ドキュメント。

## スキル一覧

| スキル | フォルダ | 担当領域 |
|--------|---------|---------|
| Mリーグ スコア計算 | `mahjong-scoring/` | 点数計算・対局記録ロジック |
| Firestore パターン | `firestore-patterns/` | DB書き込み・型変換・認証 |
| デプロイ手順 | `deploy/` | ビルド・Firebase Hosting デプロイ |
| React コンポーネント | `react-component/` | UI設計・Tailwind・Store |
| トロフィー・実績 | `trophy-achievement/` | トロフィー定義・解除ロジック |
| タイムラインシステム | `timeline-system/` | 自動投稿・リアクション・コメント |

## 麻雀アプリ観点のスキル

- **mahjong-scoring** — Mリーグ公式ルール・計算式・チョンボ・役満・飛び判定
- **trophy-achievement** — 38種類のトロフィー定義・自動解除の仕組み
- **timeline-system** — 日報・役満速報などの自動投稿の仕組み

## Webアプリ開発観点のスキル

- **firestore-patterns** — removeUndefined・Timestamp変換など安全な書き込みルール
- **react-component** — デザインシステム・共通UI・Zustand Store の使い方
- **deploy** — Codespaces 環境でのビルド・デプロイ手順・白い画面の診断
