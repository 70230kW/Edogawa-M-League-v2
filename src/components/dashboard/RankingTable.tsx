import React from 'react';
import { motion } from 'framer-motion';
import { Standing, Player } from '@/types';
import { formatPoint } from '@/utils/pointCalc';

interface RankingTableProps {
  standings: Standing[];
  players: Player[];
}

const RANK_STYLES = [
  {
    badge: '🥇',
    border: 'rgba(255,215,0,0.5)',
    shadow: '0 0 20px rgba(255,215,0,0.25), inset 0 0 20px rgba(255,215,0,0.03)',
    textColor: '#ffd700',
    labelColor: 'rgba(255,215,0,0.7)',
  },
  {
    badge: '🥈',
    border: 'rgba(192,192,192,0.4)',
    shadow: '0 0 15px rgba(192,192,192,0.15)',
    textColor: '#c0c0c0',
    labelColor: 'rgba(192,192,192,0.6)',
  },
  {
    badge: '🥉',
    border: 'rgba(205,127,50,0.4)',
    shadow: '0 0 15px rgba(205,127,50,0.15)',
    textColor: '#cd7f32',
    labelColor: 'rgba(205,127,50,0.6)',
  },
];

const DEFAULT_RANK_STYLE = {
  badge: null,
  border: 'rgba(0, 212, 255, 0.1)',
  shadow: 'none',
  textColor: '#e0e0e0',
  labelColor: 'rgba(255,255,255,0.35)',
};

export const RankingTable: React.FC<RankingTableProps> = ({ standings, players }) => {
  const sorted = [...standings].sort((a, b) => b.totalPoint - a.totalPoint);
  const playerMap = new Map(players.map((p) => [p.id, p]));

  if (sorted.length === 0) {
    return (
      <div className="text-center py-8" style={{ color: 'rgba(0,212,255,0.3)' }}>
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
        const style = RANK_STYLES[i] ?? DEFAULT_RANK_STYLE;
        const isPositive = standing.totalPoint >= 0;

        return (
          <motion.div
            key={standing.playerId}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-3 p-3 rounded-xl"
            style={{
              background: 'rgba(0, 5, 20, 0.8)',
              border: `1px solid ${style.border}`,
              boxShadow: style.shadow,
            }}
          >
            {/* Rank badge */}
            <div className="w-8 text-center flex-shrink-0">
              {style.badge ? (
                <span className="text-xl">{style.badge}</span>
              ) : (
                <span
                  className="text-sm font-bold"
                  style={{ fontFamily: 'Rajdhani, sans-serif', color: style.textColor }}
                >
                  {i + 1}
                </span>
              )}
            </div>

            {/* Player color dot */}
            <div
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{
                backgroundColor: player.color,
                boxShadow: `0 0 6px ${player.color}`,
              }}
            />

            {/* Player info */}
            <div className="flex-1 min-w-0">
              <p className="font-bold text-white truncate text-sm">{player.name}</p>
              <p className="text-[10px]" style={{ color: style.labelColor }}>
                {standing.totalGames}試合 &nbsp;|&nbsp; 平均{standing.avgRank.toFixed(2)}位
              </p>
            </div>

            {/* Points */}
            <div className="text-right flex-shrink-0">
              <p
                className="text-lg font-bold leading-tight"
                style={{
                  fontFamily: 'Rajdhani, sans-serif',
                  color: i < 3 ? style.textColor : (isPositive ? '#00ffcc' : '#ff3366'),
                  textShadow: i === 0 ? '0 0 10px rgba(255,215,0,0.5)' : 'none',
                }}
              >
                {formatPoint(standing.totalPoint)}
              </p>
              <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                1位{standing.top1Rate.toFixed(0)}% | 4位{standing.lastRate.toFixed(0)}%
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
