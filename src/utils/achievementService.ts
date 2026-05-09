import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
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

function computeEligibleTrophies(playerId: string, games: GameRecord[]): Set<string> {
  if (games.length === 0) return new Set();

  const eligible = new Set<string>();
  const dates = [...new Set(games.map((g) => g.date))].sort();

  for (const date of dates) {
    const dateGames = games.filter((g) => g.date === date);
    const triggerGame = dateGames[dateGames.length - 1];
    const qualified = checkAchievementsForPlayer(playerId, games, new Set(), triggerGame.id);
    for (const { trophyId } of qualified) {
      eligible.add(trophyId);
    }
  }

  return eligible;
}

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
      const eligibleIds = computeEligibleTrophies(playerId, remainingGames);

      await Promise.all(
        seasonTrophies
          .filter((d) => {
            const { trophyId } = d.data() as { trophyId: string };
            const def = TROPHY_DEFINITIONS[trophyId];
            return def && !def.manual && !eligibleIds.has(trophyId);
          })
          .map((d) => deleteDoc(d.ref))
      );
    } catch (err) {
      console.error(`Trophy revocation failed for player ${playerId}:`, err);
    }
  }
}
