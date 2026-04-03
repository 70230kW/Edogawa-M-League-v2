import React from 'react';
import { GameRecord, Player } from '@/types';
import { GameCard } from '@/components/games/GameCard';
import { useGameStore } from '@/stores/useGameStore';

interface RecentGamesProps {
  games: GameRecord[];
  players: Player[];
  leagueId: string;
  seasonId: string;
}

export const RecentGames: React.FC<RecentGamesProps> = ({
  games,
  players,
  leagueId,
  seasonId,
}) => {
  const { deleteGame } = useGameStore();
  const recent = games.slice(0, 5);

  if (recent.length === 0) {
    return (
      <div className="text-center py-6 text-white/40 text-sm">
        まだ対局が記録されていません
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {recent.map((game) => (
        <GameCard
          key={game.id}
          game={game}
          players={players}
          onDelete={(id) => deleteGame(leagueId, seasonId, id)}
        />
      ))}
    </div>
  );
};
