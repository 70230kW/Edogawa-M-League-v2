---
name: react-component
description: このプロジェクトのReact/TypeScriptコンポーネント設計・スタイリング規則
triggers:
  - 新しいページ・コンポーネントの作成
  - Tailwind CSS のスタイリング
  - Modal / Button / Toast などの UI 部品の利用
  - ボトムナビ・タブ・レイアウトの修正
---

# React コンポーネント設計スキル

## ディレクトリ構成

```
src/
  pages/          # ルートレベルのページコンポーネント
  components/
    layout/       # AppLayout, BottomNav, Header
    ui/           # 共通UI: Button, Card, Modal, Toast, Skeleton
    games/        # GameForm, ScoreInput, YakumanSelector, ChonboSelector
    players/      # PlayerCard, PlayerAvatar, TrophyShelf
    stats/        # LineChart, RadarChart, HeatmapCalendar
    timeline/     # TimelineFeed, TimelinePostCard, ReactionBar, CommentSection
    trophies/     # TrophyBadge, AchievementToast
    dashboard/    # RankingTable, RecentGames, SeasonSwitcher
  stores/         # Zustand stores
  utils/          # ユーティリティ関数
  types/          # TypeScript 型定義
```

## デザインシステム（Tailwind カスタムカラー）

| クラス | 色 | 用途 |
|--------|----|------|
| `bg-bg` | #000000 | ページ背景 |
| `bg-bg-card` | #00050f | カード背景 |
| `bg-bg-elevated` | #000d1a | 浮き上がった要素 |
| `text-accent` / `border-accent` | #00d4ff | 強調・アクティブ状態 |
| `text-primary` | #0066ff | ボタン・リンク |
| `text-danger` | #ff3366 | エラー・危険操作 |
| `text-gold` | #ffd700 | 1位・トロフィー |

## 共通 UI コンポーネントの使い方

### Button
```tsx
<Button variant="gold" size="sm" onClick={...} loading={loading} disabled={!valid}>
  保存する
</Button>
```
- variant: `'gold' | 'primary' | 'secondary' | 'ghost' | 'danger'`
- size: `'sm' | 'md' | 'lg'`

### Modal
```tsx
<Modal isOpen={show} onClose={() => setShow(false)} title="タイトル">
  {/* 中身 */}
</Modal>
```

### Toast
```tsx
const { toast, showToast, hideToast } = useToast();
<Toast message={toast.message} type={toast.type} isVisible={toast.visible} onClose={hideToast} />
showToast('保存しました', 'success'); // type: 'success' | 'error' | 'info'
```

## カード・リストの標準スタイル

```tsx
// 標準カード
<div className="bg-bg-card border border-white/10 rounded-2xl p-4">

// セクションヘッダー
<h2 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">

// 入力フィールド
<input className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-accent" />
```

## ボトムナビ（7タブ）

`src/components/layout/BottomNav.tsx` で管理。
タブを追加する場合はここを修正する。
現在: ホーム / 対局 / タイムライン / 統計 / メンバー / ランキング / 設定

## ページの基本構造

```tsx
export const MyPage: React.FC = () => {
  const { league } = useLeagueStore();
  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold text-white">ページタイトル</h1>
      {/* コンテンツ */}
    </div>
  );
};
```

## 状態管理（Zustand Stores）

| Store | 管理する状態 |
|-------|------------|
| `useAuthStore` | ユーザー認証状態 |
| `useLeagueStore` | リーグ・プレイヤー・シーズン・standings |
| `useGameStore` | 対局記録 |
| `useSessionStore` | セッション管理 |
| `useTimelineStore` | タイムライン投稿 |
| `useAchievementStore` | トロフィートースト |

## アニメーション

`framer-motion` を使用。ページ遷移・モーダル・トーストに適用済み。
新規コンポーネントでも必要に応じて `motion.div` を使用。

## スマホ対応

- `viewport-fit=cover` 設定済み（ノッチ対応）
- Safe Area: `pb-safe` クラスをボトムに追加
- タッチフィードバック: `active:scale-[0.98]` を interactive 要素に付与
