import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import { GameRecord } from '@/types';
import { checkAchievementsForPlayer, TROPHY_DEFINITIONS } from './achievements';
import { useAchievementStore } from '@/stores/useAchievementStore';

export async function checkAndUnlockAchievements(
  leagueId: string,
  seasonId: string,
  playerIds: string[],
  allSeasonGames: GameRecord[],
  triggerGameId: string,
  playerNames: Map<string, string>,
  currentLinkedPlayerId?: string
): Promise<void> {
  for (const playerId of playerIds) {
    try {
      // このシーズンで既に解除済みのトロフィーIDを取得
      const trophiesSnap = await getDocs(
        collection(db, 'leagues', leagueId, 'players', playerId, 'trophies')
      );
      const existingIds = new Set(
        trophiesSnap.docs
          .filter((d) => d.data().seasonId === seasonId)
          .map((d) => d.data().trophyId as string)
      );

      const newTrophies = checkAchievementsForPlayer(
        playerId,
        allSeasonGames,
        existingIds,
        triggerGameId
      );

      for (const { trophyId, gameId } of newTrophies) {
        // ドキュメントID = {seasonId}_{trophyId}（シーズンをまたいで同じトロフィーを取得可能）
        await setDoc(
          doc(db, 'leagues', leagueId, 'players', playerId, 'trophies', `${seasonId}_${trophyId}`),
          {
            trophyId,
            seasonId,
            unlockedAt: serverTimestamp(),
            gameId: gameId ?? null,
          }
        );

        // トースト通知（自分に連携されたプレイヤーのみ）
        const def = TROPHY_DEFINITIONS[trophyId];
        if (def && playerId === currentLinkedPlayerId) {
          const name = playerNames.get(playerId) ?? '？';
          useAchievementStore.getState().addToast(def, name);
        }
      }
    } catch (err) {
      console.error(`Achievement check failed for player ${playerId}:`, err);
    }
  }
}

// 削除後のゲームで各プレイヤーが条件を満たすtrophyId → 最初にトリガーとなったgameIdのMap
function computeEligibleMap(playerId: string, games: GameRecord[]): Map<string, string> {
  const eligible = new Map<string, string>();
  if (games.length === 0) return eligible;

  const dates = [...new Set(games.map((g) => g.date))].sort();
  for (const date of dates) {
    const dateGames = games.filter((g) => g.date === date);
    const triggerGame = dateGames[dateGames.length - 1];
    const qualified = checkAchievementsForPlayer(playerId, games, new Set(), triggerGame.id);
    for (const { trophyId, gameId } of qualified) {
      if (!eligible.has(trophyId)) {
        eligible.set(trophyId, gameId);
      }
    }
  }
  return eligible;
}

// ゲーム削除後にシーズントロフィーを完全同期（削除・gameId更新・付与漏れ補填）
export async function recheckAndRevokeAchievements(
  leagueId: string,
  seasonId: string,
  playerIds: string[],
  remainingGames: GameRecord[]
): Promise<void> {
  for (const playerId of playerIds) {
    try {
      const trophiesSnap = await getDocs(
        collection(db, 'leagues', leagueId, 'players', playerId, 'trophies')
      );
      const seasonTrophies = trophiesSnap.docs.filter((d) => d.data().seasonId === seasonId);
      const eligibleMap = computeEligibleMap(playerId, remainingGames);

      for (const d of seasonTrophies) {
        const data = d.data() as { trophyId: string; gameId: string | null };
        const def = TROPHY_DEFINITIONS[data.trophyId];
        if (!def || def.manual) continue;

        if (!eligibleMap.has(data.trophyId)) {
          // 条件を満たさなくなったので削除
          await deleteDoc(d.ref);
        } else if (data.gameId && !remainingGames.some((g) => g.id === data.gameId)) {
          // gameIdが指す対局が削除されたので、別のトリガーgameIdに更新
          await updateDoc(d.ref, { gameId: eligibleMap.get(data.trophyId) ?? null });
        }
      }

      // 付与漏れ補填（条件を満たすが存在しないトロフィーを付与）
      const existingIds = new Set(seasonTrophies.map((d) => d.data().trophyId as string));
      for (const [trophyId, triggerGameId] of eligibleMap) {
        if (!existingIds.has(trophyId)) {
          await setDoc(
            doc(db, 'leagues', leagueId, 'players', playerId, 'trophies', `${seasonId}_${trophyId}`),
            { trophyId, seasonId, unlockedAt: serverTimestamp(), gameId: triggerGameId }
          );
        }
      }
    } catch (err) {
      console.error(`Trophy sync failed for player ${playerId}:`, err);
    }
  }
}

// Settingsから呼ぶ全プレイヤー一括整合（任意シーズンの全ゲームで再評価）
export async function syncAllTrophiesForSeason(
  leagueId: string,
  seasonId: string,
  playerIds: string[],
  allGames: GameRecord[]
): Promise<void> {
  await recheckAndRevokeAchievements(leagueId, seasonId, playerIds, allGames);
}
