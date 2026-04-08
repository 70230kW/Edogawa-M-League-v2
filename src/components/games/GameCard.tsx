import React, { useState } from 'react';
import { Trophy, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { GameRecord, Player } from '@/types';
import { formatDateJa, formatPoint } from '@/utils/pointCalc';

interface GameCardProps {
  game: GameRecord;
  players: Player[];
  onDelete?: (gameId: string) => void;
}

export const GameCard: React.FC<GameCardProps> = ({ game, players, onDelete }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const sorted = [...game.players].sort((a, b) => a.rank - b.rank);
  const rankColors = ['text-yellow-400', 'text-gray-300', 'text-amber-600', 'text-red-400'];
  const hasYakuman = game.events?.some((e) => e.type === 'yakuman');

  const playerMap = new Map(players.map((p) => [p.id, p]));

  return (
    <div className="relative overflow-hidden rounded-2xl">
      {/* Delete background */}
      {onDelete && (
        <div className="absolute inset-y-0 right-0 bg-danger flex items-center px-6 rounded-2xl">
          <span className="text-white text-sm font-bold">削除</span>
        </div>
      )}

      <motion.div
        drag={onDelete ? 'x' : false}
        dragConstraints={{ left: -80, right: 0 }}
        onDragEnd={(_, info) => {
          if (info.offset.x < -60) {
            setShowDeleteConfirm(true);
          }
        }}
        className={`relative bg-bg-card border rounded-2xl p-4 ${
          hasYakuman ? 'border-accent/30' : 'border-white/10'
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <p className="text-sm text-white/60">{formatDateJa(game.date)}</p>
            <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full text-white/60">
              {game.gameType === 'south' ? '半荘' : '東風'}
            </span>
            {hasYakuman && (
              <span className="text-xs bg-accent/20 border border-accent/40 px-2 py-0.5 rounded-full text-accent flex items-center gap-1">
                <Trophy className="w-3 h-3" />役満
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-1">
          {sorted.map((gp) => {
            const player = playerMap.get(gp.playerId);
            if (!player) return null;
            return (
              <div key={gp.playerId} className="text-center">
                <p className={`text-xs font-bold ${rankColors[gp.rank - 1]}`}>{gp.rank}位</p>
                <div
                  className="w-2 h-2 rounded-full mx-auto my-1"
                  style={{ backgroundColor: player.color }}
                />
                <p className="text-xs text-white/80 truncate">{player.name}</p>
                <p className="text-xs font-bold">
                  <span className={gp.point >= 0 ? 'text-green-400' : 'text-red-400'}>
                    {formatPoint(gp.point)}
                  </span>
                </p>
              </div>
            );
          })}
        </div>

        {game.notes && (
          <p className="text-xs text-white/40 mt-2 border-t border-white/10 pt-2 truncate flex items-center gap-1">
            <FileText className="w-3 h-3 flex-shrink-0" />{game.notes}
          </p>
        )}
      </motion.div>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && onDelete && (
        <div className="absolute inset-0 bg-bg-card/95 flex items-center justify-center gap-3 rounded-2xl border border-danger/30">
          <p className="text-sm text-white">削除しますか？</p>
          <button
            onClick={() => onDelete(game.id)}
            className="px-3 py-1.5 bg-danger rounded-lg text-white text-sm font-bold"
          >
            削除
          </button>
          <button
            onClick={() => setShowDeleteConfirm(false)}
            className="px-3 py-1.5 bg-white/10 rounded-lg text-white text-sm"
          >
            キャンセル
          </button>
        </div>
      )}
    </div>
  );
};
