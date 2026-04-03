import React, { useState } from 'react';
import { Season } from '@/types';
import { useLeagueStore } from '@/stores/useLeagueStore';

interface SeasonSwitcherProps {
  seasons: Season[];
  currentSeason: Season | null;
}

export const SeasonSwitcher: React.FC<SeasonSwitcherProps> = ({
  seasons,
  currentSeason,
}) => {
  const [open, setOpen] = useState(false);
  const { setCurrentSeason } = useLeagueStore();

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm hover:bg-white/10 transition-colors"
      >
        <span className="text-accent">📅</span>
        <span className="text-white font-medium">
          {currentSeason?.name ?? '全期間'}
        </span>
        <span className="text-white/40">▾</span>
      </button>

      {open && (
        <div className="absolute top-full mt-1 left-0 w-48 bg-bg-card border border-white/10 rounded-xl shadow-xl z-20 overflow-hidden">
          <button
            onClick={() => { setCurrentSeason(null); setOpen(false); }}
            className="w-full text-left px-4 py-3 text-sm text-white/60 hover:bg-white/5 transition-colors border-b border-white/5"
          >
            全期間
          </button>
          {seasons.map((s) => (
            <button
              key={s.id}
              onClick={() => { setCurrentSeason(s); setOpen(false); }}
              className={`w-full text-left px-4 py-3 text-sm hover:bg-white/5 transition-colors ${
                s.id === currentSeason?.id ? 'text-accent' : 'text-white/80'
              }`}
            >
              <p className="font-medium">{s.name}</p>
              <p className="text-xs text-white/40">
                {s.status === 'active' ? '🟢 進行中' : '⚫ 終了'}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
