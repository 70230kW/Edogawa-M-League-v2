import React from 'react';
import { motion } from 'framer-motion';
import { Standing, Player } from '@/types';
import { formatPoint } from '@/utils/pointCalc';

interface RankingTableProps {
  standings: Standing[];
  players: Player[];
}

export const RankingTable: React.FC<RankingTableProps> = ({ standings, players }) => {
  const sorted = [...standings].sort((a, b) => b.totalPoint - a.totalPoint);
  const playerMap = new Map(players.map((p) => [p.id, p]));

  const rankGlow = [
    'border-yellow-400/40 shadow-[0_0_15px_rgba(212,175,55,0.2)]',
    'border-gray-400/30 shadow-[0_0_10px_rgba(192,192,192,0.15)]',
    'border-amber-600/30 shadow-[0_0_10px_rgba(205,127,50,0.15)]',
    'border-white/10',
  ];

  const rankBadge = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];

  if (sorted.length === 0) {
    return (
      <div className="text-center py-8 text-white/40">
        <p className="text-4xl mb-2">🀄</p>
        <p className="text-sm">まだ対局記録がありません</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {sorted.map((standing, i) => {
        const player = playerMap.get(standing.playerId);
        if (!player) return null;

        return (
          <motion.div
            key={standing.playerId}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`flex items-center gap-3 p-3 rounded-xl border bg-bg-card ${rankGlow[i] ?? rankGlow[3]}`}
          >
            <span className="text-xl w-8 text-center">{rankBadge[i] ?? `${i + 1}`}</span>

            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: player.color }}
            />

            <div className="flex-1 min-w-0">
              <p className="font-bold text-white truncate">{player.name}</p>
              <p className="text-xs text-white/40">
                {standing.totalGames}試合 | 平均{standing.avgRank.toFixed(2)}位
              </p>
            </div>

            <div className="text-right flex-shrink-0">
              <p
                className={`text-lg font-bold ${
                  standing.totalPoint >= 0 ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {formatPoint(standing.totalPoint)}
              </p>
              <p className="text-xs text-white/40">
                1位{standing.top1Rate.toFixed(0)}% | 4位{standing.lastRate.toFixed(0)}%
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
