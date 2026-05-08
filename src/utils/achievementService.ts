import {
  collection,
  doc,
  getDocs,
  setDoc,
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
