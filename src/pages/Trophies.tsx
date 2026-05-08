import React, { useState } from 'react';
import { Trophy, ChevronDown } from 'lucide-react';
import { useLeagueStore } from '@/stores/useLeagueStore';
import { TrophyShelf } from '@/components/players/TrophyShelf';
import { Skeleton } from '@/components/ui/Skeleton';
import { usePlayerTrophies } from '@/hooks/useAchievements';

export const Trophies: React.FC = () => {
  const { players, league, seasons, currentSeason } = useLeagueStore();
  const activePlayers = players.filter((p) => p.isActive);
  const [selectedPlayerId, setSelectedPlayerId] = useState(activePlayers[0]?.id ?? '');
  const [selectedSeasonId, setSelectedSeasonId] = useState(currentSeason?.id ?? seasons[0]?.id ?? '');

  const leagueId = league?.id ?? '';
  const { trophies, loading } = usePlayerTrophies(leagueId, selectedPlayerId, selectedSeasonId);

  const selectedSeason = seasons.find((s) => s.id === selectedSeasonId);

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold text-white flex items-center gap-2">
        <Trophy className="w-5 h-5 text-accent" />
        トロフィー
      </h1>

      {/* Season selector */}
      <div className="relative">
        <select
          value={selectedSeasonId}
          onChange={(e) => setSelectedSeasonId(e.target.value)}
          className="w-full appearance-none bg-bg-card border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-accent pr-9"
        >
          {seasons.map((s) => (
            <option key={s.id} value={s.id} className="bg-gray-900">
              {s.name}{s.status === 'active' ? '（進行中）' : ''}
            </option>
          ))}
          {seasons.length === 0 && (
            <option value="" className="bg-gray-900">シーズンなし</option>
          )}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
      </div>

      {/* Player selector */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {activePlayers.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelectedPlayerId(p.id)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm transition-all ${
              selectedPlayerId === p.id
                ? 'border-accent/60 text-accent bg-accent/10'
                : 'border-white/10 text-white/50 bg-white/5'
            }`}
          >
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: p.color }}
            />
            {p.name}
          </button>
        ))}
      </div>

      {/* No season state */}
      {!selectedSeasonId && (
        <div className="text-center py-12 text-white/30 text-sm">
          シーズンが選択されていません
        </div>
      )}

      {/* Trophy shelf */}
      {selectedSeasonId && (
        loading ? (
          <Skeleton className="h-64" />
        ) : (
          <TrophyShelf unlockedTrophies={trophies} seasonName={selectedSeason?.name} />
        )
      )}
    </div>
  );
};
