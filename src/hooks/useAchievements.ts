import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { UnlockedTrophy } from '@/types';
import { toDate } from '@/utils/dateUtils';

/**
 * 指定プレイヤーのトロフィー一覧を Firestore から読み込む
 */
export function usePlayerTrophies(leagueId: string, playerId: string) {
  const [trophies, setTrophies] = useState<UnlockedTrophy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!leagueId || !playerId) {
      setLoading(false);
      return;
    }

    getDocs(collection(db, 'leagues', leagueId, 'players', playerId, 'trophies'))
      .then((snap) => {
        const data: UnlockedTrophy[] = snap.docs.map((d) => ({
          trophyId: d.id,
          unlockedAt: toDate(d.data().unlockedAt),
          gameId: d.data().gameId ?? undefined,
        }));
        setTrophies(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [leagueId, playerId]);

  return { trophies, loading };
}
