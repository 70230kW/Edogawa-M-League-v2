import React, { useState } from 'react';
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

const TOTAL_SCORE = 100000;

function applyRanks(list: ScoreEntry[]): ScoreEntry[] {
  const sorted = [...list]
    .sort((a, b) => b.score - a.score)
    .map((s, rank) => ({ ...s, rank: rank + 1 }));
  return list.map((s) => sorted.find((ss) => ss.playerId === s.playerId)!);
}

export const ScoreInput: React.FC<ScoreInputProps> = ({
  players,
  scores,
  points,
  onChange,
  totalScore,
  isValid,
}) => {
  const [touchedIndices, setTouchedIndices] = useState<Set<number>>(new Set());
  const [autoCalcIdx, setAutoCalcIdx] = useState<number | null>(null);

  const handleScoreChange = (index: number, raw: string) => {
    const newScore = parseInt(raw) || 0;

    // Mark this index as manually entered
    const newTouched = new Set(touchedIndices);
    newTouched.add(index);
    setTouchedIndices(newTouched);

    // Update score + auto fly detection
    let newScores = scores.map((s, i) =>
      i === index ? { ...s, score: newScore, isFly: newScore < 0 } : s
    );

    // Auto-calc 4th player when 3 are manually entered
    const untouched = newScores.map((_, i) => i).filter((i) => !newTouched.has(i));
    let newAutoCalcIdx: number | null = null;
    if (untouched.length === 1) {
      const autoIdx = untouched[0];
      const sumOfTouched = newScores
        .filter((_, i) => newTouched.has(i))
        .reduce((acc, e) => acc + e.score, 0);
      const autoScore = TOTAL_SCORE - sumOfTouched;
      newScores = newScores.map((s, i) =>
        i === autoIdx ? { ...s, score: autoScore, isFly: autoScore < 0 } : s
      );
      newAutoCalcIdx = autoIdx;
    }

    setAutoCalcIdx(newAutoCalcIdx);
    onChange(applyRanks(newScores));
  };

  const toggleFly = (index: number) => {
    const newScores = scores.map((s, i) =>
      i === index ? { ...s, isFly: !s.isFly } : s
    );
    onChange(newScores);
  };

  const rankColors = ['text-yellow-400', 'text-gray-300', 'text-amber-600', 'text-red-400'];

  return (
    <div className="space-y-3">
      {scores.map((entry, i) => {
        const player = players.find((p) => p.id === entry.playerId);
        if (!player) return null;
        const point = points[i];
        const isAutoCalc = autoCalcIdx === i;

        return (
          <div
            key={entry.playerId}
            className={`flex items-center gap-3 border rounded-xl p-3 transition-colors ${
              entry.isFly
                ? 'bg-red-900/15 border-red-500/50'
                : 'bg-white/5 border-white/10'
            }`}
          >
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: player.color }}
            />
            <div className="w-16 flex-shrink-0">
              <p className="font-medium text-sm truncate">{player.name}</p>
              {entry.isFly && (
                <p className="text-[10px] text-red-400 font-bold">飛び</p>
              )}
            </div>

            <div className="flex-1">
              <input
                type="number"
                value={entry.score !== 0 ? entry.score : ''}
                onChange={(e) => handleScoreChange(i, e.target.value)}
                placeholder="点数"
                step={100}
                className={`w-full bg-transparent text-white text-right text-lg font-bold focus:outline-none pb-1 border-b transition-colors ${
                  isAutoCalc
                    ? 'border-cyan-400 text-cyan-300'
                    : entry.score < 0
                    ? 'border-red-500'
                    : 'border-white/20 focus:border-accent'
                }`}
              />
              {isAutoCalc && (
                <p className="text-[10px] text-cyan-400/70 text-right mt-0.5">自動計算</p>
              )}
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
              onClick={() => toggleFly(i)}
              className={`text-xs px-2 py-1 rounded-lg border transition-colors flex-shrink-0 ${
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
          {!isValid && (
            <><AlertTriangle className="w-3.5 h-3.5 text-yellow-400" />合計が10万点になりません</>
          )}
        </span>
      </div>
    </div>
  );
};
