import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { UnlockedTrophy } from '@/types';
import { toDate } from '@/utils/dateUtils';

export function usePlayerTrophies(leagueId: string, playerId: string, seasonId: string) {
  const [trophies, setTrophies] = useState<UnlockedTrophy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!leagueId || !playerId || !seasonId) {
      setTrophies([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    getDocs(collection(db, 'leagues', leagueId, 'players', playerId, 'trophies'))
      .then((snap) => {
        const data: UnlockedTrophy[] = snap.docs
          .filter((d) => d.data().seasonId === seasonId)
          .map((d) => ({
            trophyId: d.data().trophyId as string,
            unlockedAt: toDate(d.data().unlockedAt),
            gameId: d.data().gameId ?? undefined,
          }));
        setTrophies(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [leagueId, playerId, seasonId]);

  return { trophies, loading };
}
