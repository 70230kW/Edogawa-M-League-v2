import { useMemo } from 'react';
import { LeagueSettings } from '@/types';
import { calcPoint } from '@/utils/pointCalc';

interface PlayerInput {
  playerId: string;
  score: number;
  rank: number;
}

export function useUmaCalc(players: PlayerInput[], settings: LeagueSettings) {
  return useMemo(() => {
    return players.map((p) => ({
      ...p,
      point: p.score > 0 || p.rank > 0 ? calcPoint(p.score, p.rank, settings) : 0,
    }));
  }, [players, settings]);
}
