import React from 'react';
import { ChonboType, Player } from '@/types';

const CHONBO_TYPES: ChonboType[] = [
  '誤ロン',
  'ノーテンリーチ',
  'リーチ後不正カン',
  '牌山崩し',
  'その他',
];

interface ChonboEntry {
  playerId: string;
  chonboType: ChonboType;
  note?: string;
}

interface ChonboSelectorProps {
  players: Player[];
  value: ChonboEntry[];
  onChange: (entries: ChonboEntry[]) => void;
}

export const ChonboSelector: React.FC<ChonboSelectorProps> = ({
  players,
  value,
  onChange,
}) => {
  const addEntry = () => {
    onChange([...value, { playerId: players[0]?.id ?? '', chonboType: '誤ロン' }]);
  };

  const removeEntry = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const updateEntry = (index: number, updates: Partial<ChonboEntry>) => {
    onChange(value.map((e, i) => (i === index ? { ...e, ...updates } : e)));
  };

  return (
    <div className="space-y-3">
      {value.map((entry, i) => (
        <div key={i} className="bg-danger/10 border border-danger/30 rounded-xl p-3 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-danger">チョンボ {i + 1}</p>
            <button
              onClick={() => removeEntry(i)}
              className="text-white/40 hover:text-danger text-sm"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-white/50 block mb-1">プレイヤー</label>
              <select
                value={entry.playerId}
                onChange={(e) => updateEntry(i, { playerId: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-2 text-sm text-white"
              >
                {players.map((p) => (
                  <option key={p.id} value={p.id} className="bg-gray-900">
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-white/50 block mb-1">種別</label>
              <select
                value={entry.chonboType}
                onChange={(e) => updateEntry(i, { chonboType: e.target.value as ChonboType })}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-2 text-sm text-white"
              >
                {CHONBO_TYPES.map((t) => (
                  <option key={t} value={t} className="bg-gray-900">
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {entry.chonboType === 'その他' && (
            <input
              type="text"
              placeholder="詳細を入力"
              value={entry.note ?? ''}
              onChange={(e) => updateEntry(i, { note: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30"
            />
          )}
        </div>
      ))}

      <button
        onClick={addEntry}
        className="w-full py-2 border border-dashed border-danger/40 rounded-xl text-danger/70 text-sm hover:border-danger/70 hover:text-danger transition-colors"
      >
        + チョンボを追加
      </button>
    </div>
  );
};
