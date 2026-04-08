import React, { useState } from 'react';
import { TrendingUp, Target, Calendar, BarChart2 } from 'lucide-react';
import { subMonths, addMonths } from 'date-fns';
import { useLeagueStore } from '@/stores/useLeagueStore';
import { useGameStore } from '@/stores/useGameStore';
import { CumulativeLineChart } from '@/components/stats/LineChart';
import { PlayerRadarChart } from '@/components/stats/RadarChart';
import { HeatmapCalendar } from '@/components/stats/HeatmapCalendar';

export const Stats: React.FC = () => {
  const { players, standings } = useLeagueStore();
  const { games } = useGameStore();

  const activePlayers = players.filter((p) => p.isActive);

  const [selectedPlayers, setSelectedPlayers] = useState<string[]>(
    activePlayers.slice(0, 4).map((p) => p.id)
  );
  const [calMonth, setCalMonth] = useState(new Date());

  const togglePlayer = (id: string) => {
    setSelectedPlayers((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  return (
    <div className="p-4 space-y-8">
      <h1 className="text-xl font-bold text-white">統計・分析</h1>

      {/* Cumulative points chart */}
      <section>
        <h2 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5" />
          累積ポイント推移
        </h2>
        <div className="bg-bg-card border border-white/10 rounded-2xl p-4">
          <CumulativeLineChart games={games} players={activePlayers} />
        </div>
      </section>

      {/* Radar chart */}
      <section>
        <h2 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Target className="w-3.5 h-3.5" />
          プレイヤー比較
        </h2>
        <div className="flex gap-2 flex-wrap mb-3">
          {activePlayers.map((p) => (
            <button
              key={p.id}
              onClick={() => togglePlayer(p.id)}
              className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                selectedPlayers.includes(p.id)
                  ? 'border-accent/60 text-accent bg-accent/10'
                  : 'border-white/10 text-white/50 bg-white/5'
              }`}
            >
              <span
                className="inline-block w-2 h-2 rounded-full mr-1.5 align-middle"
                style={{ backgroundColor: p.color }}
              />
              {p.name}
            </button>
          ))}
        </div>
        <div className="bg-bg-card border border-white/10 rounded-2xl p-4">
          <PlayerRadarChart
            standings={standings}
            players={activePlayers}
            selectedPlayerIds={selectedPlayers}
          />
        </div>
      </section>

      {/* Heatmap calendar */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold text-white/40 uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            対局カレンダー
          </h2>
          <div className="flex gap-1">
            <button
              onClick={() => setCalMonth(subMonths(calMonth, 1))}
              className="text-white/50 hover:text-white px-3 py-1 text-sm rounded-lg hover:bg-white/5"
            >
              ‹
            </button>
            <button
              onClick={() => setCalMonth(new Date())}
              className="text-white/50 hover:text-white px-2 py-1 text-xs rounded-lg hover:bg-white/5"
            >
              今月
            </button>
            <button
              onClick={() => setCalMonth(addMonths(calMonth, 1))}
              className="text-white/50 hover:text-white px-3 py-1 text-sm rounded-lg hover:bg-white/5"
            >
              ›
            </button>
          </div>
        </div>
        <div className="bg-bg-card border border-white/10 rounded-2xl p-4">
          <HeatmapCalendar games={games} month={calMonth} />
        </div>
      </section>

      {/* Summary stats */}
      {games.length > 0 && (
        <section>
          <h2 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <BarChart2 className="w-3.5 h-3.5" />
            シーズンサマリー
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-bg-card border border-white/10 rounded-2xl p-4 text-center">
              <p className="text-3xl font-bold text-accent">{games.length}</p>
              <p className="text-xs text-white/40 mt-1">総対局数</p>
            </div>
            <div className="bg-bg-card border border-white/10 rounded-2xl p-4 text-center">
              <p className="text-3xl font-bold text-white">
                {games.filter((g) => g.events?.some((e) => e.type === 'yakuman')).length}
              </p>
              <p className="text-xs text-white/40 mt-1">役満対局</p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
