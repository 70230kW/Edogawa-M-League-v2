---
name: timeline-system
description: タイムライン投稿の自動生成・手動投稿・リアクション・コメントの実装規則
triggers:
  - タイムライン投稿の追加・修正
  - 日報・役満速報・セッション結果の自動投稿
  - timelineGenerator / TimelineFeed の修正
  - リアクション・コメント機能の変更
---

# タイムラインシステム スキル

## 投稿タイプ

| type | 生成タイミング | 内容 |
|------|--------------|------|
| `daily_report` | 対局記録時（自動） | 日次成績サマリー |
| `yakuman_flash` | 役満記録時（自動） | 役満速報 |
| `chonbo_flash` | チョンボ記録時（自動） | チョンボ速報 |
| `session_report` | セッション終了時（自動） | セッション結果 |
| `manual` | ユーザー手動投稿 | マークダウン自由記述 |

## 関連ファイル

| ファイル | 役割 |
|---------|------|
| `src/utils/timelineGenerator.ts` | 自動投稿文の生成ロジック |
| `src/stores/useTimelineStore.ts` | 投稿・リアクション・コメントの状態管理 |
| `src/components/timeline/TimelineFeed.tsx` | フィード全体 |
| `src/components/timeline/TimelinePostCard.tsx` | 1投稿のカード表示 |
| `src/components/timeline/ReactionBar.tsx` | リアクション（絵文字） |
| `src/components/timeline/CommentSection.tsx` | コメント |
| `src/components/timeline/DailyReportModal.tsx` | 日報投稿モーダル |
| `src/components/timeline/SessionReportModal.tsx` | セッション結果モーダル |

## Firestore 構造

```
leagues/{leagueId}/timeline/{postId}
  type: 'daily_report' | 'yakuman_flash' | 'chonbo_flash' | 'session_report' | 'manual'
  content: string          // 表示テキスト（マークダウン可）
  createdAt: Timestamp
  triggeredBy: 'system' | userId
  meta: DailyReportMeta | YakumanFlashMeta | ChonboFlashMeta | SessionReportMeta | ManualMeta
  reactions: { [emoji]: userId[] }

leagues/{leagueId}/timeline/{postId}/comments/{commentId}
  authorId: string
  authorName: string
  content: string
  createdAt: Timestamp
```

## 自動投稿のトリガー

自動投稿は `src/stores/useGameStore.ts` の `addGame` / `editGame` 内で発火:

```ts
// 対局記録後
await postDailyReport(leagueId, seasonId, date, players, playerNames);
// 役満があれば
await postYakumanFlash(leagueId, gameId, playerId, yakumanList, playerName);
// チョンボがあれば
await postChonboFlash(leagueId, gameId, playerId, chonboType, playerName);
```

セッション終了時は `useSessionStore.ts` の `closeSession` から `postSessionReport` を呼ぶ。

## マークダウン投稿

手動投稿は `content` フィールドにマークダウン記法で保存。
表示時に `TimelinePostCard` 内でパース・レンダリング。

対応記法:
- `**太字**`、`*斜体*`
- `# 見出し`
- ` ```コードブロック``` `
- 絵文字（そのまま表示）

## リアクション

```ts
// reactions: { '👍': ['userId1', 'userId2'], '🀄': ['userId3'] }
// トグル動作（押すと追加、もう一度押すと削除）
```

「誰がリアクションしたか」はプレイヤー名で表示（userId → playerName変換済み）。

## よくある落とし穴

- `daily_report` は日付単位で1件のみ（同じ日に複数対局があっても1件に集約）
- `session_report` はセッション単位
- `triggeredBy: 'system'` の投稿はユーザーが削除できないよう UI 上で制御
- reactions はオブジェクト型のため、`removeUndefined` で undefined userId が混入しないよう注意
