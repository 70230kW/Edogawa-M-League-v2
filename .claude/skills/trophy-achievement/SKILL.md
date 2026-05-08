---
name: trophy-achievement
description: トロフィー・実績システムの定義・解除ロジック・表示の実装規則
triggers:
  - トロフィー・実績の追加・修正
  - achievementService / achievements.ts の変更
  - TrophyBadge / Trophies ページの修正
  - トロフィーの解除条件に関する質問
---

# トロフィー・実績システム スキル

## 概要

- 38種類のトロフィー、6ランク（bronze / silver / gold / platinum / special / underground）
- 対局記録時に自動解除チェック（`checkAndUnlockAchievements`）
- 自分に連携されたプレイヤーのみトースト通知

## 関連ファイル

| ファイル | 役割 |
|---------|------|
| `src/utils/achievements.ts` | トロフィー定義一覧（TROPHY_DEFINITIONS） |
| `src/utils/achievementService.ts` | 解除チェックロジック（checkAndUnlockAchievements） |
| `src/stores/useAchievementStore.ts` | トースト通知の状態管理 |
| `src/components/trophies/TrophyBadge.tsx` | トロフィーバッジ表示 |
| `src/components/trophies/AchievementToast.tsx` | 解除時のトースト通知 |
| `src/pages/Trophies.tsx` | トロフィー一覧ページ（/trophies） |

## Firestore 構造

```
leagues/{leagueId}/players/{playerId}/trophies/{trophyId}
  trophyId: string
  unlockedAt: Timestamp
  gameId?: string
```

## トロフィー追加手順

1. `src/utils/achievements.ts` の `TROPHY_DEFINITIONS` 配列に追加:
```ts
{
  id: 'unique_id',
  name: 'トロフィー名',
  description: '解除条件の説明',
  comment: 'フレーバーテキスト',
  rank: 'bronze', // bronze | silver | gold | platinum | special | underground
  icon: '🏆',    // 絵文字
  manual: false, // true = 自己申告のみ（自動検出なし）
}
```

2. `src/utils/achievementService.ts` の `checkAndUnlockAchievements` に解除条件を追加:
```ts
case 'unique_id': {
  // playerStats, allGames などを使って条件判定
  unlocked = someCondition;
  break;
}
```

## checkAndUnlockAchievements の引数

```ts
checkAndUnlockAchievements(
  leagueId: string,
  playerIds: string[],        // 今回の対局参加者
  allLeagueGames: GameRecord[], // 新対局を含む全対局（日付昇順）
  triggerGameId: string,       // トリガーとなった対局ID
  playerNames: Map<string, string>,
  currentLinkedPlayerId?: string // 通知する自分のプレイヤーID
)
```

## トースト通知

解除は `currentLinkedPlayerId` と一致するプレイヤーのみ通知される。
（他プレイヤーの解除はサイレント）

```ts
// useAchievementStore
addToast(def: TrophyDefinition, playerName: string)
```

## ランクの色設定

| ランク | 色 |
|--------|----|
| bronze | `text-bronze` / `#cd7f32` |
| silver | `text-silver` / `#c0c0c0` |
| gold | `text-gold` / `#ffd700` |
| platinum | `text-accent` / `#00d4ff` |
| special | `text-purple-400` |
| underground | `text-danger` / `#ff3366` |

## よくある落とし穴

- 解除済みチェックを忘れると同じトロフィーが重複解除される（`existingTrophyIds` で確認済み）
- `allLeagueGames` は新対局を含む全対局なので、トリガー対局も含まれる
- `manual: true` のトロフィーは `achievementService` で処理しない
