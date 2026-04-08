import React from 'react';
import { Link } from 'react-router-dom';
import { Medal } from 'lucide-react';
import { Player, Standing } from '@/types';
import { formatPoint } from '@/utils/pointCalc';

interface PlayerCardProps {
  player: Player;
  standing?: Standing;
  rank?: number;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({ player, standing, rank }) => {
  return (
    <Link
      to={`/players/${player.id}`}
      className="flex items-center gap-4 p-4 bg-bg-card border border-white/10 rounded-2xl hover:border-white/20 transition-colors active:scale-[0.98]"
    >
      {rank !== undefined && (
        <div className="w-8 text-center">
          {rank <= 2 ? (
            <Medal
              className="w-5 h-5 mx-auto"
              style={{ color: rank === 0 ? '#ffd700' : rank === 1 ? '#c0c0c0' : '#cd7f32' }}
            />
          ) : (
            <span className="text-sm font-bold text-white/50">{rank + 1}</span>
          )}
        </div>
      )}

      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
        style={{ backgroundColor: player.color }}
      >
        {player.name[0]}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-bold text-white">{player.name}</p>
        {standing && (
          <p className="text-xs text-white/40">
            {standing.totalGames}試合 | 平均{standing.avgRank.toFixed(2)}位
          </p>
        )}
      </div>

      {standing && (
        <div className="text-right">
          <p className={`text-lg font-bold ${standing.totalPoint >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {formatPoint(standing.totalPoint)}
          </p>
          <p className="text-xs text-white/40">
            1位 {standing.top1Rate.toFixed(0)}%
          </p>
        </div>
      )}
    </Link>
  );
};
