---
name: firestore-patterns
description: Firebase/Firestoreの安全な書き込みパターン・型変換・認証の実装規則
triggers:
  - Firestore への読み書き実装
  - addDoc / setDoc / updateDoc を書く時
  - Timestamp や Date の変換
  - Firebase Authentication の操作
  - undefined エラー、toDate エラーの調査・修正
---

# Firestore 実装パターン スキル

## 必須ルール①：removeUndefined の適用

`addDoc` / `setDoc` の前に**必ず** `removeUndefined` を適用する。

```ts
import { removeUndefined } from '@/utils/firestore';

// NG
await addDoc(collection(db, 'leagues', leagueId, 'games'), data);

// OK
await addDoc(collection(db, 'leagues', leagueId, 'games'), removeUndefined(data));
```

**理由:** Firestore は undefined を受け付けず「Unsupported field value: undefined」エラーになる。
`updateDoc` は部分更新なので undefined が混在しにくいが、念のため適用推奨。

## 必須ルール②：Timestamp → Date 変換

直接 `.toDate()` を呼ばず、必ず `src/utils/dateUtils.ts` の `toDate()` を使う。

```ts
import { toDate } from '@/utils/dateUtils';

// NG
const d = snap.data().createdAt.toDate();

// OK
const d = toDate(snap.data().createdAt);
```

**理由:** Firestoreのデータが Timestamp / Date / string のどれかになる場合があり、直接 `.toDate()` を呼ぶと「toDate is not a function」エラーが発生する。

## コレクション構造

```
leagues/{leagueId}
  players/{playerId}
  seasons/{seasonId}
    sessions/{sessionId}
    games/{gameId}
    standings/{playerId}
  timeline/{postId}
    comments/{commentId}

leagues/{leagueId}/players/{playerId}/trophies/{trophyId}
```

## 認証

- `signInWithPopup` を使用（signInWithRedirect は使わない）
- Codespaces ではポップアップがブロックされるが本番では正常動作
- `useAuthStore` で user 状態を管理（`src/stores/useAuthStore.ts`）

## Store のパターン

```ts
// Zustand store での Firestore 操作パターン
someAction: async (leagueId, data) => {
  await addDoc(
    collection(db, 'leagues', leagueId, 'items'),
    removeUndefined(data)
  );
  await get().loadItems(leagueId); // ストア更新
},
```

loadXxx で再取得してストアを更新するのが標準パターン。
リアルタイム更新が必要な場合は `onSnapshot` を使い、unsubscribe を返す。

## セキュリティ

- `.env.local` に Firebase 認証情報を保存（.gitignore 済み）
- `VITE_FIREBASE_*` プレフィックスで Vite に公開
- ビルド時に環境変数が JS にインライン展開される

## よくある落とし穴

- `undefined` を含むオブジェクトをそのまま書き込まない
- `serverTimestamp()` は addDoc/setDoc 時のみ使用。updateDoc では FieldValue.serverTimestamp() が必要
- standings は `setDoc`（merge不要）でプレイヤーIDをドキュメントIDにして上書き
