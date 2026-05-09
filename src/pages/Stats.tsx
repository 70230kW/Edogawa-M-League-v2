import React, { useState, useMemo } from 'react';
import { TrendingUp, Target, Calendar, BarChart2, TableProperties } from 'lucide-react';
import { subMonths, addMonths } from 'date-fns';
import { useLeagueStore } from '@/stores/useLeagueStore';
import { useGameStore } from '@/stores/useGameStore';
import { CumulativeLineChart } from '@/components/stats/LineChart';
import { PlayerRadarChart } from '@/components/stats/RadarChart';
import { HeatmapCalendar } from '@/components/stats/HeatmapCalendar';
import { PlayerAvatar } from '@/components/players/PlayerAvatar';
import { Modal } from '@/components/ui/Modal';
import { GameCard } from '@/components/games/GameCard';
import { formatDateJa } from '@/utils/pointCalc';
import { GameRecord, Player } from '@/types';

function computeDetailedStats(games: GameRecord[], players: Player[]) {
  const map = new Map<string, {
    games: number; totalPoint: number; rankCounts: number[];
    maxPoint: number; minPoint: number; flyCount: number; yakumanCount: number; chonboCount: number;
  }>();

  for (const game of games) {
    const yakumanPlayerIds = new Set(
      (game.events ?? []).filter((e) => e.type === 'yakuman').map((e) => e.playerId)
    );
    const chonboPlayerIds = new Set(
      (game.events ?? []).filter((e) => e.type === 'chonbo').map((e) => e.playerId)
    );
    for (const gp of game.players) {
      const s = map.get(gp.playerId) ?? {
        games: 0, totalPoint: 0, rankCounts: [0, 0, 0, 0],
        maxPoint: -Infinity, minPoint: Infinity, flyCount: 0, yakumanCount: 0, chonboCount: 0,
      };
      s.games++;
      s.totalPoint += gp.point;
      s.rankCounts[gp.rank - 1]++;
      s.maxPoint = Math.max(s.maxPoint, gp.point);
      s.minPoint = Math.min(s.minPoint, gp.point);
      if (gp.score < 0) s.flyCount++;
      if (yakumanPlayerIds.has(gp.playerId)) s.yakumanCount++;
      if (chonboPlayerIds.has(gp.playerId)) s.chonboCount++;
      map.set(gp.playerId, s);
    }
  }

  return [...map.entries()]
    .map(([playerId, s]) => {
      const player = players.find((p) => p.id === playerId);
      if (!player) return null;
      const n = s.games;
      const r = s.rankCounts;
      return {
        player,
        games: n,
        totalPoint: Math.round(s.totalPoint * 10) / 10,
        avgRank: n > 0 ? Math.round((r.reduce((acc, c, i) => acc + c * (i + 1), 0) / n) * 100) / 100 : 0,
        rank1Rate: n > 0 ? Math.round((r[0] / n) * 1000) / 10 : 0,
        rank2Rate: n > 0 ? Math.round((r[1] / n) * 1000) / 10 : 0,
        rank3Rate: n > 0 ? Math.round((r[2] / n) * 1000) / 10 : 0,
        rank4Rate: n > 0 ? Math.round((r[3] / n) * 1000) / 10 : 0,
        maxPoint: s.maxPoint === -Infinity ? 0 : Math.round(s.maxPoint * 10) / 10,
        minPoint: s.minPoint === Infinity ? 0 : Math.round(s.minPoint * 10) / 10,
        flyCount: s.flyCount,
        yakumanCount: s.yakumanCount,
        chonboCount: s.chonboCount,
      };
    })
    .filter((r): r is NonNullable<typeof r> => r !== null)
    .sort((a, b) => b.totalPoint - a.totalPoint);
}

export const Stats: React.FC = () => {
  const { players, standings } = useLeagueStore();
  const { games } = useGameStore();

  const activePlayers = players.filter((p) => p.isActive);

  const [selectedPlayers, setSelectedPlayers] = useState<string[]>(
    activePlayers.slice(0, 4).map((p) => p.id)
  );
  const [calMonth, setCalMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const detailedStats = useMemo(() => computeDetailedStats(games, activePlayers), [games, activePlayers]);

  const seasonTotals = useMemo(() => ({
    games: games.length,
    yakuman: games.reduce((s, g) => s + (g.events ?? []).filter((e) => e.type === 'yakuman').length, 0),
    chonbo: games.reduce((s, g) => s + (g.events ?? []).filter((e) => e.type === 'chonbo').length, 0),
    fly: detailedStats.reduce((s, r) => s + r.flyCount, 0),
    activeDays: new Set(games.map((g) => g.date)).size,
  }), [games, detailedStats]);

  const togglePlayer = (id: string) => {
    setSelectedPlayers((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const gamesOnDate = selectedDate
    ? games.filter((g) => g.date === selectedDate)
    : [];

  return (
    <div className="p-4 space-y-8">
      <h1 className="text-xl font-bold text-white">統計・分析</h1>

      {/* ── 詳細ダッシュボード（トップ） ── */}
      {games.length > 0 && (
        <section>
          <h2 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <TableProperties className="w-3.5 h-3.5" />
            シーズン詳細ダッシュボード
          </h2>

          {/* サマリーカード */}
          <div className="grid grid-cols-5 gap-2 mb-4">
            {[
              { label: '総対局数', value: seasonTotals.games, color: 'text-accent' },
              { label: '対局日数', value: seasonTotals.activeDays, color: 'text-sky-400' },
              { label: '役満', value: seasonTotals.yakuman, color: 'text-yellow-400' },
              { label: 'チョンボ', value: seasonTotals.chonbo, color: 'text-red-400' },
              { label: '飛び', value: seasonTotals.fly, color: 'text-orange-400' },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-bg-card border border-white/10 rounded-xl p-2.5 text-center">
                <p className={`text-2xl font-bold tabular-nums ${color}`}>{value}</p>
                <p className="text-[10px] text-white/40 mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* プレイヤー別詳細テーブル */}
          <div className="bg-bg-card border border-white/10 rounded-2xl overflow-hidden">
            <div style={{ overflowX: 'auto' }}>
              <table
                className="text-xs"
                style={{ minWidth: 700, width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}
              >
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    <th className="py-2.5 pl-3 text-left text-white/30 font-medium sticky left-0 bg-bg-card" style={{ minWidth: 100 }}>プレイヤー</th>
                    <th className="py-2.5 pr-3 text-right text-white/30 font-medium whitespace-nowrap">合計pt</th>
                    <th className="py-2.5 pr-3 text-right text-white/30 font-medium whitespace-nowrap">対局</th>
                    <th className="py-2.5 pr-3 text-right text-white/30 font-medium whitespace-nowrap">平均</th>
                    <th className="py-2.5 pr-3 text-right text-yellow-400/60 font-medium whitespace-nowrap">1位%</th>
                    <th className="py-2.5 pr-3 text-right text-gray-300/60 font-medium whitespace-nowrap">2位%</th>
                    <th className="py-2.5 pr-3 text-right text-amber-600/60 font-medium whitespace-nowrap">3位%</th>
                    <th className="py-2.5 pr-3 text-right text-red-400/60 font-medium whitespace-nowrap">4位%</th>
                    <th className="py-2.5 pr-3 text-right text-green-400/60 font-medium whitespace-nowrap">最高pt</th>
                    <th className="py-2.5 pr-3 text-right text-red-400/60 font-medium whitespace-nowrap">最低pt</th>
                    <th className="py-2.5 pr-3 text-right text-orange-400/60 font-medium whitespace-nowrap">飛び</th>
                    <th className="py-2.5 pr-3 text-right text-yellow-400/60 font-medium whitespace-nowrap">役満</th>
                  </tr>
                </thead>
                <tbody>
                  {detailedStats.map((row, i) => (
                    <tr key={row.player.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td className="py-2.5 pl-3 sticky left-0 bg-bg-card">
                        <div className="flex items-center gap-1.5">
                          <span className="text-white/30 text-[10px] w-3 tabular-nums shrink-0">{i + 1}</span>
                          <PlayerAvatar player={row.player} size={16} />
                          <span className="text-white/80 truncate" style={{ maxWidth: 68 }}>{row.player.name}</span>
                        </div>
                      </td>
                      <td className={`py-2.5 pr-3 text-right font-bold tabular-nums ${row.totalPoint >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {row.totalPoint > 0 ? '+' : ''}{row.totalPoint.toFixed(1)}
                      </td>
                      <td className="py-2.5 pr-3 text-right text-white/50 tabular-nums">{row.games}</td>
                      <td className="py-2.5 pr-3 text-right text-white/50 tabular-nums">{row.avgRank.toFixed(2)}</td>
                      <td className="py-2.5 pr-3 text-right text-yellow-400 tabular-nums">{row.rank1Rate.toFixed(1)}%</td>
                      <td className="py-2.5 pr-3 text-right text-gray-300 tabular-nums">{row.rank2Rate.toFixed(1)}%</td>
                      <td className="py-2.5 pr-3 text-right text-amber-600 tabular-nums">{row.rank3Rate.toFixed(1)}%</td>
                      <td className="py-2.5 pr-3 text-right text-red-400 tabular-nums">{row.rank4Rate.toFixed(1)}%</td>
                      <td className={`py-2.5 pr-3 text-right tabular-nums ${row.maxPoint > 0 ? 'text-green-400' : 'text-white/50'}`}>
                        {row.maxPoint > 0 ? '+' : ''}{row.maxPoint.toFixed(1)}
                      </td>
                      <td className={`py-2.5 pr-3 text-right tabular-nums ${row.minPoint < 0 ? 'text-red-400' : 'text-white/50'}`}>
                        {row.minPoint > 0 ? '+' : ''}{row.minPoint.toFixed(1)}
                      </td>
                      <td className="py-2.5 pr-3 text-right text-white/50 tabular-nums">{row.flyCount}</td>
                      <td className="py-2.5 pr-3 text-right text-white/50 tabular-nums">{row.yakumanCount > 0 ? <span className="text-yellow-400">{row.yakumanCount}</span> : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

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
          <HeatmapCalendar
            games={games}
            month={calMonth}
            onDateClick={(dateStr) => setSelectedDate(dateStr)}
          />
        </div>
      </section>

      {/* Date games modal */}
      <Modal
        isOpen={!!selectedDate}
        onClose={() => setSelectedDate(null)}
        title={selectedDate ? `${formatDateJa(selectedDate)}の対局` : ''}
        size="lg"
      >
        <div className="space-y-3">
          {gamesOnDate.map((g) => (
            <GameCard key={g.id} game={g} players={players} />
          ))}
          {gamesOnDate.length === 0 && (
            <p className="text-center text-white/40 text-sm py-4">対局なし</p>
          )}
        </div>
      </Modal>
    </div>
  );
};
