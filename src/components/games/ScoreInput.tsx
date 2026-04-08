import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Player } from '@/types';
import { formatPoint } from '@/utils/pointCalc';

interface ScoreEntry {
  playerId: string;
  score: number;
  rank: number;
  isFly: boolean;
}

interface ScoreInputProps {
  players: Player[];
  scores: ScoreEntry[];
  points: number[];
  onChange: (scores: ScoreEntry[]) => void;
  totalScore: number;
  isValid: boolean;
}

export const ScoreInput: React.FC<ScoreInputProps> = ({
  players,
  scores,
  points,
  onChange,
  totalScore,
  isValid,
}) => {
  const updateScore = (index: number, updates: Partial<ScoreEntry>) => {
    const newScores = scores.map((s, i) => (i === index ? { ...s, ...updates } : s));
    // Auto-calculate ranks by score
    const sorted = [...newScores]
      .sort((a, b) => b.score - a.score)
      .map((s, rank) => ({ ...s, rank: rank + 1 }));
    // Restore original order
    const reordered = newScores.map((s) =>
      sorted.find((ss) => ss.playerId === s.playerId)!
    );
    onChange({ ...reordered, ...newScores.map((s, i) => ({ ...s, ...updates, rank: reordered[i].rank })) } as any);
    onChange(newScores.map((s, i) => (i === index ? { ...s, ...updates } : s)));
  };

  const recalcRanks = () => {
    const sorted = [...scores]
      .sort((a, b) => b.score - a.score)
      .map((s, rank) => ({ ...s, rank: rank + 1 }));
    const reordered = scores.map((s) =>
      sorted.find((ss) => ss.playerId === s.playerId)!
    );
    onChange(reordered);
  };

  return (
    <div className="space-y-3">
      {scores.map((entry, i) => {
        const player = players.find((p) => p.id === entry.playerId);
        if (!player) return null;
        const point = points[i];
        const rankColors = ['text-yellow-400', 'text-gray-300', 'text-amber-600', 'text-red-400'];

        return (
          <div
            key={entry.playerId}
            className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-3"
          >
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: player.color }}
            />
            <p className="font-medium text-sm w-16 truncate">{player.name}</p>

            <div className="flex-1">
              <input
                type="number"
                value={entry.score || ''}
                onChange={(e) => updateScore(i, { score: parseInt(e.target.value) || 0 })}
                onBlur={recalcRanks}
                placeholder="点数"
                step={100}
                className="w-full bg-transparent border-b border-white/20 text-white text-right text-lg font-bold focus:outline-none focus:border-accent pb-1"
              />
            </div>

            <div className="text-right min-w-[60px]">
              <p className={`text-xs font-bold ${rankColors[entry.rank - 1] ?? 'text-white'}`}>
                {entry.rank}位
              </p>
              <p className={`text-sm font-bold ${point >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {isNaN(point) ? '-' : formatPoint(point)}
              </p>
            </div>

            <button
              onClick={() => updateScore(i, { isFly: !entry.isFly })}
              className={`text-xs px-2 py-1 rounded-lg border transition-colors ${
                entry.isFly
                  ? 'bg-danger/20 border-danger/50 text-danger'
                  : 'border-white/10 text-white/30 hover:border-white/20'
              }`}
            >
              飛び
            </button>
          </div>
        );
      })}

      <div
        className={`flex items-center justify-between px-3 py-2 rounded-xl text-sm font-bold ${
          isValid
            ? 'bg-green-900/30 border border-green-500/30 text-green-400'
            : 'bg-red-900/30 border border-red-500/30 text-red-400'
        }`}
      >
        <span>合計点数</span>
        <span className="flex items-center gap-1">
          {totalScore.toLocaleString()}点
          {!isValid && <><AlertTriangle className="w-3.5 h-3.5 text-yellow-400" />合計が10万点になりません</>}
        </span>
      </div>
    </div>
  );
};
