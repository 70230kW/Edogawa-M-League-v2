---
name: mahjong-scoring
description: Mリーグ公式ルールに基づくスコア計算・対局記録ロジックの専門知識
triggers:
  - スコア計算、ポイント計算、順位点、チョンボ、飛び、オカ に関する実装や質問
  - pointCalc.ts / GameForm / ScoreInput の修正
  - 対局記録の追加・変更
---

# Mリーグ スコア計算スキル

## 基本設定値（M_LEAGUE_SETTINGS）

| 項目 | 値 |
|------|----|
| 原点 (startPoints) | 25,000点 |
| 返し点 (returnPoints) | 30,000点 |
| 順位点 | 1位:+50 / 2位:+10 / 3位:−10 / 4位:−30 |
| オカ | 20pt（1位に加算） |
| チョンボペナルティ | −20pt |
| 赤ドラ | あり |
| 裏ドラ | あり |
| 競技形式 | 半荘戦（東南戦） |

## ポイント計算式

```
素点換算 = (素点 − 30,000) ÷ 1,000
最終ポイント = 素点換算 + 順位点 + オカ（1位のみ）
オカ = (返し点 − 原点) × 人数 ÷ 1,000 = 20pt
```

実装は `src/utils/pointCalc.ts` の `calcPoint(score, rank, settings)` を必ず使う。直接計算しない。

## 4人目の素点自動計算

```
player4.score = 100,000 - (p1.score + p2.score + p3.score)
```

`src/components/games/ScoreInput.tsx` で実装済み。

## 飛び（トビ）判定

`isFly = score <= 0`

飛んだプレイヤーの素点は 0 として扱う（マイナスでも 0 点換算）。
飛ばしたプレイヤーは自動的に1位候補。

## チョンボ

- 対局の `events` 配列に `{ type: 'chonbo', playerId, chonboType }` を追加
- ポイント計算後に `-20pt` を加算（`src/utils/pointCalc.ts` の `applyChonbo`）
- チョンボ種別: `'誤ロン' | 'ノーテンリーチ' | 'リーチ後不正カン' | '牌山崩し' | 'その他'`

## 役満

- `events` 配列に `{ type: 'yakuman', playerId, yakumanList: YakumanType[] }` を追加
- ダブル役満は同じプレイヤーに複数エントリ or yakumanList に複数要素
- タイムラインへ自動投稿（`yakuman_flash`）

## 5人以上の交代制

- `playerCount` が 5 以上の場合、各対局に4人のプレイヤーを選択
- standings は全プレイヤーを対象に集計

## Firestoreのgames構造

```
games/{gameId}
  date: string (YYYY-MM-DD)
  gameType: 'east' | 'south'
  players: GamePlayer[]  // 必ず4要素
  events?: GameEvent[]
  notes?: string
  createdAt: Timestamp
  createdBy: string (userId)
```

## よくある落とし穴

- 素点の合計は必ず 100,000 点になる（4人分）
- 同点は起家（oya フィールド）から時計回りで上位
- `removeUndefined` を必ず addDoc/setDoc 前に適用すること
