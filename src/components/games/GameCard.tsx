import React, { useState, useRef, useEffect } from 'react';
import { Trophy, FileText, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { GameRecord, Player } from '@/types';
import { formatDateJa, formatPoint } from '@/utils/pointCalc';
import { PlayerAvatar } from '@/components/players/PlayerAvatar';

interface GameCardProps {
  game: GameRecord;
  players: Player[];
  onDelete?: (gameId: string) => void;
  onEdit?: (game: GameRecord) => void;
}

export const GameCard: React.FC<GameCardProps> = ({ game, players, onDelete, onEdit }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  const sorted = [...game.players].sort((a, b) => a.rank - b.rank);
  const rankColors = ['text-yellow-400', 'text-gray-300', 'text-amber-600', 'text-red-400'];
  const hasYakuman = game.events?.some((e) => e.type === 'yakuman');
  const playerMap = new Map(players.map((p) => [p.id, p]));

  return (
    <div className="relative rounded-2xl overflow-hidden">
      <div
        className={`relative bg-bg-card border rounded-2xl p-4 ${
          hasYakuman ? 'border-accent/30' : 'border-white/10'
        }`}
      >
        {/* Header row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 flex-wrap">
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

          {/* Three-dot menu */}
          {(onEdit || onDelete) && (
            <div className="relative flex-shrink-0" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-white/40 hover:text-white/70 hover:bg-white/10 transition-colors"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-8 bg-bg-elevated border border-white/15 rounded-xl shadow-xl z-20 overflow-hidden min-w-[110px]">
                  {onEdit && (
                    <button
                      onClick={() => { setMenuOpen(false); onEdit(game); }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-white/80 hover:bg-white/10 transition-colors text-left"
                    >
                      <Pencil className="w-3.5 h-3.5" />編集
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => { setMenuOpen(false); setShowDeleteConfirm(true); }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors text-left"
                    >
                      <Trash2 className="w-3.5 h-3.5" />削除
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Player grid */}
        <div className="grid grid-cols-4 gap-1">
          {sorted.map((gp) => {
            const player = playerMap.get(gp.playerId);
            if (!player) return null;
            return (
              <div key={gp.playerId} className="text-center">
                <p className={`text-xs font-bold ${rankColors[gp.rank - 1]}`}>{gp.rank}位</p>
                <div className="flex justify-center my-1">
                  <PlayerAvatar player={player} size={20} />
                </div>
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
      </div>

      {/* Delete confirmation overlay */}
      {showDeleteConfirm && onDelete && (
        <div className="absolute inset-0 bg-bg-card/95 flex flex-col items-center justify-center gap-3 rounded-2xl border border-danger/30 p-4">
          <p className="text-sm text-white text-center">
            この対局を削除しますか？<br />
            <span className="text-xs text-white/50">この操作は元に戻せません</span>
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="px-4 py-2 bg-white/10 rounded-xl text-white text-sm"
            >
              キャンセル
            </button>
            <button
              onClick={() => onDelete(game.id)}
              className="px-4 py-2 bg-danger rounded-xl text-white text-sm font-bold"
            >
              削除する
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
