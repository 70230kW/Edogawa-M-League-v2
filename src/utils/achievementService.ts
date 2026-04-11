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

/**
 * 新規対局保存後に全プレイヤーの実績をチェックし、
 * 新たに解除された実績を Firestore に保存してトーストを出す。
 */
export async function checkAndUnlockAchievements(
  leagueId: string,
  playerIds: string[],
  allLeagueGames: GameRecord[],  // 新対局を含む全対局（日付昇順）
  triggerGameId: string,
  playerNames: Map<string, string>,
  currentLinkedPlayerId?: string
): Promise<void> {
  for (const playerId of playerIds) {
    try {
      // 既存トロフィーを取得
      const trophiesSnap = await getDocs(
        collection(db, 'leagues', leagueId, 'players', playerId, 'trophies')
      );
      const existingIds = new Set(trophiesSnap.docs.map((d) => d.id));

      // 新たに解除される実績を判定
      const newTrophies = checkAchievementsForPlayer(
        playerId,
        allLeagueGames,
        existingIds,
        triggerGameId
      );

      for (const { trophyId, gameId } of newTrophies) {
        // Firestore に保存
        await setDoc(
          doc(db, 'leagues', leagueId, 'players', playerId, 'trophies', trophyId),
          {
            trophyId,
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
