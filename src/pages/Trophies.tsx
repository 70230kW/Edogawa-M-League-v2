import React, { useState } from 'react';
import { Trophy } from 'lucide-react';
import { useLeagueStore } from '@/stores/useLeagueStore';
import { TrophyShelf } from '@/components/players/TrophyShelf';
import { Skeleton } from '@/components/ui/Skeleton';
import { usePlayerTrophies } from '@/hooks/useAchievements';

export const Trophies: React.FC = () => {
  const { players, league } = useLeagueStore();
  const activePlayers = players.filter((p) => p.isActive);
  const [selectedId, setSelectedId] = useState(activePlayers[0]?.id ?? '');

  const leagueId = league?.id ?? '';
  const { trophies, loading } = usePlayerTrophies(leagueId, selectedId);

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold text-white flex items-center gap-2">
        <Trophy className="w-5 h-5 text-accent" />
        トロフィー
      </h1>

      {/* Player selector */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {activePlayers.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelectedId(p.id)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm transition-all ${
              selectedId === p.id
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

      {/* Trophy shelf */}
      {loading ? (
        <Skeleton className="h-64" />
      ) : (
        <TrophyShelf unlockedTrophies={trophies} />
      )}
    </div>
  );
};
