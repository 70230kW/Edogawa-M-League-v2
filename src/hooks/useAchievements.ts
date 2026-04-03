import { useEffect, useState } from 'react';
import { GameRecord, TrophyId } from '@/types';
import { checkNewTrophies, TROPHY_DEFINITIONS } from '@/utils/achievements';

export function useAchievements(
  games: GameRecord[],
  playerId: string,
  existingTrophyIds: TrophyId[]
) {
  const [newTrophies, setNewTrophies] = useState<TrophyId[]>([]);

  useEffect(() => {
    if (!playerId || games.length === 0) return;
    const earned = checkNewTrophies(games, playerId, existingTrophyIds);
    if (earned.length > 0) {
      setNewTrophies(earned);
    }
  }, [games, playerId]);

  const clearNewTrophies = () => setNewTrophies([]);

  return {
    newTrophies: newTrophies.map((id) => TROPHY_DEFINITIONS[id]),
    clearNewTrophies,
  };
}
