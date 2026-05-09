import React, { useState, useMemo, useEffect } from 'react';
import { TrendingUp, Target, Calendar, BarChart2, TableProperties, Swords, ChevronDown } from 'lucide-react';
import { subMonths, addMonths } from 'date-fns';
import { useLeagueStore } from '@/stores/useLeagueStore';
import { useGameStore } from '@/stores/useGameStore';
import { useRealtimeGames, useRealtimeStandings } from '@/hooks/useRealtime';
import { CumulativeLineChart } from '@/components/stats/LineChart';
import { PlayerRadarChart } from '@/components/stats/RadarChart';
import { HeatmapCalendar } from '@/components/stats/HeatmapCalendar';
import { PlayerAvatar } from '@/components/players/PlayerAvatar';
import { Modal } from '@/components/ui/Modal';
import { GameCard } from '@/components/games/GameCard';
import { formatDateJa } from '@/utils/pointCalc';

export const Stats: React.FC = () => {
  const { players, standings, league, currentSeason } = useLeagueStore();
  const { games } = useGameStore();

  const leagueId = league?.id ?? '';
  const seasonId = currentSeason?.id ?? '';
  useRealtimeGames(leagueId, seasonId);
  useRealtimeStandings(leagueId, seasonId);

  // useMemoでキャッシュして参照を安定させる
  const activePlayers = useMemo(() => players.filter((p) => p.isActive), [players]);

  const [selectedPlayers, setSelectedPlayers] = useState<string[]>(
    activePlayers.slice(0, 4).map((p) => p.id)
  );
  const [calMonth, setCalMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [h2hPlayer1, setH2hPlayer1] = useState<string>('');
  const [h2hPlayer2, setH2hPlayer2] = useState<string>('');

  useEffect(() => {
    if (activePlayers.length >= 2 && !h2hPlayer1 && !h2hPlayer2) {
      setH2hPlayer1(activePlayers[0].id);
      setH2hPlayer2(activePlayers[1].id);
    }
  }, [activePlayers.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const togglePlayer = (id: string) => {
    setSelectedPlayers((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const gamesOnDate = selectedDate
    ? games.filter((g) => g.date === selectedDate)
    : [];

  const dashStats = useMemo(() => {
    const map = new Map<string, {
      totalPoint: number; rankCounts: number[];
      maxPoint: number; minPoint: number; flyCount: number; yakumanCount: number;
    }>();
    for (const game of games) {
      const yakumanIds = new Set((game.events ?? []).filter((e) => e.type === 'yakuman').map((e) => e.playerId));
      for (const gp of (game.players ?? [])) {
        const s = map.get(gp.playerId) ?? { totalPoint: 0, rankCounts: [0,0,0,0], maxPoint: -Infinity, minPoint: Infinity, flyCount: 0, yakumanCount: 0 };
        s.totalPoint += gp.point ?? 0;
        const ri = (gp.rank ?? 1) - 1;
        if (ri >= 0 && ri <= 3) s.rankCounts[ri]++;
        s.maxPoint = Math.max(s.maxPoint, gp.point ?? 0);
        s.minPoint = Math.min(s.minPoint, gp.point ?? 0);
        if ((gp.score ?? 0) < 0) s.flyCount++;
        if (yakumanIds.has(gp.playerId)) s.yakumanCount++;
        map.set(gp.playerId, s);
      }
    }
    return [...map.entries()].flatMap(([playerId, s]) => {
      const player = activePlayers.find((p) => p.id === playerId);
      if (!player) return [];
      const n = s.rankCounts.reduce((a, c) => a + c, 0);
      return [{
        player,
        totalPoint: Math.round(s.totalPoint * 10) / 10,
        games: n,
        avgRank: n > 0 ? Math.round((s.rankCounts.reduce((a, c, i) => a + c * (i + 1), 0) / n) * 100) / 100 : 0,
        rank1Rate: n > 0 ? Math.round((s.rankCounts[0] / n) * 1000) / 10 : 0,
        rank2Rate: n > 0 ? Math.round((s.rankCounts[1] / n) * 1000) / 10 : 0,
        rank3Rate: n > 0 ? Math.round((s.rankCounts[2] / n) * 1000) / 10 : 0,
        rank4Rate: n > 0 ? Math.round((s.rankCounts[3] / n) * 1000) / 10 : 0,
        maxPoint: s.maxPoint === -Infinity ? 0 : Math.round(s.maxPoint * 10) / 10,
        minPoint: s.minPoint === Infinity ? 0 : Math.round(s.minPoint * 10) / 10,
        flyCount: s.flyCount,
        yakumanCount: s.yakumanCount,
      }];
    }).sort((a, b) => b.totalPoint - a.totalPoint);
  }, [games, activePlayers]);

  const columnLeaders = useMemo((): Record<string, Set<string>> => {
    if (dashStats.length < 2) return {};
    const top = (fn: (r: typeof dashStats[0]) => number, higher: boolean): Set<string> => {
      const vals = dashStats.map(fn);
      const best = higher ? Math.max(...vals) : Math.min(...vals);
      return new Set(dashStats.filter((r) => fn(r) === best).map((r) => r.player.id));
    };
    return {
      totalPoint: top((r) => r.totalPoint, true),
      games: top((r) => r.games, true),
      avgRank: top((r) => r.avgRank, false),
      rank1Rate: top((r) => r.rank1Rate, true),
      rank2Rate: top((r) => r.rank2Rate, true),
      rank3Rate: top((r) => r.rank3Rate, true),
      rank4Rate: top((r) => r.rank4Rate, false),
      maxPoint: top((r) => r.maxPoint, true),
      minPoint: top((r) => r.minPoint, true),
      flyCount: top((r) => r.flyCount, false),
      yakumanCount: top((r) => r.yakumanCount, true),
    };
  }, [dashStats]);

  const h2hStats = useMemo(() => {
    if (!h2hPlayer1 || !h2hPlayer2 || h2hPlayer1 === h2hPlayer2) return null;
    const p1 = activePlayers.find((p) => p.id === h2hPlayer1);
    const p2 = activePlayers.find((p) => p.id === h2hPlayer2);
    if (!p1 || !p2) return null;
    let wins = 0, losses = 0, draws = 0;
    const sharedGames = games.filter((g) => {
      const ids = new Set(g.players.map((gp) => gp.playerId));
      return ids.has(h2hPlayer1) && ids.has(h2hPlayer2);
    });
    for (const g of sharedGames) {
      const gp1 = g.players.find((gp) => gp.playerId === h2hPlayer1);
      const gp2 = g.players.find((gp) => gp.playerId === h2hPlayer2);
      if (!gp1 || !gp2) continue;
      if (gp1.rank < gp2.rank) wins++;
      else if (gp1.rank > gp2.rank) losses++;
      else draws++;
    }
    return { p1, p2, wins, losses, draws, total: sharedGames.length };
  }, [h2hPlayer1, h2hPlayer2, games, activePlayers]);

  const seasonSummary = useMemo(() => ({
    totalGames: games.length,
    activeDays: new Set(games.map((g) => g.date)).size,
    yakuman: games.reduce((s, g) => s + (g.events ?? []).filter((e) => e.type === 'yakuman').length, 0),
    chonbo: games.reduce((s, g) => s + (g.events ?? []).filter((e) => e.type === 'chonbo').length, 0),
    fly: dashStats.reduce((s, r) => s + r.flyCount, 0),
  }), [games, dashStats]);

  return (
    <div className="p-4 space-y-8">
      <h1 className="text-xl font-bold text-white">統計・分析</h1>

      {/* ── 詳細ダッシュボード ── */}
      {games.length > 0 && (
        <section>
          <h2 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <TableProperties className="w-3.5 h-3.5" />
            シーズン詳細ダッシュボード
          </h2>
          {/* サマリーカード */}
          <div className="grid grid-cols-5 gap-2 mb-4">
            {([
              { label: '総対局数', value: seasonSummary.totalGames, color: 'text-accent' },
              { label: '対局日数', value: seasonSummary.activeDays, color: 'text-sky-400' },
              { label: '役満', value: seasonSummary.yakuman, color: 'text-yellow-400' },
              { label: 'チョンボ', value: seasonSummary.chonbo, color: 'text-red-400' },
              { label: '飛び', value: seasonSummary.fly, color: 'text-orange-400' },
            ] as const).map(({ label, value, color }) => (
              <div key={label} className="bg-bg-card border border-white/10 rounded-xl p-2.5 text-center">
                <p className={`text-2xl font-bold tabular-nums ${color}`}>{value}</p>
                <p className="text-[10px] text-white/40 mt-0.5 leading-tight">{label}</p>
              </div>
            ))}
          </div>
          {/* プレイヤー別詳細テーブル */}
          <div className="bg-bg-card border border-white/10 rounded-2xl overflow-hidden">
            <div style={{ overflowX: 'auto' }}>
              <table className="text-xs" style={{ minWidth: 680, width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    <th className="py-2.5 pl-3 text-left text-white/30 font-medium sticky left-0 bg-bg-card" style={{ minWidth: 96 }}>選手</th>
                    <th className="py-2.5 pr-3 text-right text-white/30 font-medium">合計pt</th>
                    <th className="py-2.5 pr-3 text-right text-white/30 font-medium">局数</th>
                    <th className="py-2.5 pr-3 text-right text-white/30 font-medium">平均</th>
                    <th className="py-2.5 pr-3 text-right text-yellow-400/70 font-medium">1位%</th>
                    <th className="py-2.5 pr-3 text-right text-gray-300/70 font-medium">2位%</th>
                    <th className="py-2.5 pr-3 text-right text-amber-600/70 font-medium">3位%</th>
                    <th className="py-2.5 pr-3 text-right text-red-400/70 font-medium">4位%</th>
                    <th className="py-2.5 pr-3 text-right text-green-400/70 font-medium">最高pt</th>
                    <th className="py-2.5 pr-3 text-right text-red-400/70 font-medium">最低pt</th>
                    <th className="py-2.5 pr-3 text-right text-orange-400/70 font-medium">飛び</th>
                    <th className="py-2.5 pr-3 text-right text-yellow-400/70 font-medium">役満</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const L = (col: string, id: string) =>
                      columnLeaders[col]?.has(id)
                        ? <span className="mr-0.5 text-[9px] text-yellow-400 align-top leading-none">★</span>
                        : null;
                    return dashStats.map((row, i) => (
                      <tr key={row.player.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <td className="py-2 pl-3 sticky left-0 bg-bg-card">
                          <div className="flex items-center gap-1.5">
                            <span className="text-white/30 text-[10px] w-3 tabular-nums shrink-0">{i + 1}</span>
                            <PlayerAvatar player={row.player} size={16} />
                            <span className="text-white/80 text-[11px] truncate" style={{ maxWidth: 60 }}>{row.player.name}</span>
                          </div>
                        </td>
                        <td className={`py-2 pr-3 text-right font-bold tabular-nums ${row.totalPoint >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {L('totalPoint', row.player.id)}{row.totalPoint > 0 ? '+' : ''}{row.totalPoint.toFixed(1)}
                        </td>
                        <td className="py-2 pr-3 text-right text-white/50 tabular-nums">{L('games', row.player.id)}{row.games}</td>
                        <td className="py-2 pr-3 text-right text-white/50 tabular-nums">{L('avgRank', row.player.id)}{row.avgRank.toFixed(2)}</td>
                        <td className="py-2 pr-3 text-right text-yellow-400 tabular-nums">{L('rank1Rate', row.player.id)}{row.rank1Rate.toFixed(1)}%</td>
                        <td className="py-2 pr-3 text-right text-gray-300 tabular-nums">{L('rank2Rate', row.player.id)}{row.rank2Rate.toFixed(1)}%</td>
                        <td className="py-2 pr-3 text-right text-amber-600 tabular-nums">{L('rank3Rate', row.player.id)}{row.rank3Rate.toFixed(1)}%</td>
                        <td className="py-2 pr-3 text-right text-red-400 tabular-nums">{L('rank4Rate', row.player.id)}{row.rank4Rate.toFixed(1)}%</td>
                        <td className={`py-2 pr-3 text-right tabular-nums ${row.maxPoint > 0 ? 'text-green-400' : 'text-white/50'}`}>
                          {L('maxPoint', row.player.id)}{row.maxPoint > 0 ? '+' : ''}{row.maxPoint.toFixed(1)}
                        </td>
                        <td className={`py-2 pr-3 text-right tabular-nums ${row.minPoint < 0 ? 'text-red-400' : 'text-white/50'}`}>
                          {L('minPoint', row.player.id)}{row.minPoint > 0 ? '+' : ''}{row.minPoint.toFixed(1)}
                        </td>
                        <td className="py-2 pr-3 text-right text-white/50 tabular-nums">{L('flyCount', row.player.id)}{row.flyCount}</td>
                        <td className="py-2 pr-3 text-right tabular-nums">
                          {row.yakumanCount > 0
                            ? <span className="text-yellow-400 font-bold">{L('yakumanCount', row.player.id)}{row.yakumanCount}</span>
                            : <span className="text-white/20">—</span>}
                        </td>
                      </tr>
                    ));
                  })()}
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

      {/* Head-to-Head */}
      <section>
        <h2 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Swords className="w-3.5 h-3.5" />
          直接対決
        </h2>
        {/* Player selectors */}
        <div className="flex items-center gap-3 mb-3">
          <div className="relative flex-1">
            <select
              value={h2hPlayer1}
              onChange={(e) => setH2hPlayer1(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-accent/50 appearance-none pr-7"
              style={{ colorScheme: 'dark' }}
            >
              <option value="">選手を選択</option>
              {activePlayers.filter((p) => p.id !== h2hPlayer2).map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30 pointer-events-none" />
          </div>
          <span className="text-white/30 text-sm font-bold shrink-0">vs</span>
          <div className="relative flex-1">
            <select
              value={h2hPlayer2}
              onChange={(e) => setH2hPlayer2(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-accent/50 appearance-none pr-7"
              style={{ colorScheme: 'dark' }}
            >
              <option value="">選手を選択</option>
              {activePlayers.filter((p) => p.id !== h2hPlayer1).map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30 pointer-events-none" />
          </div>
        </div>
        {/* Results */}
        {!h2hStats ? (
          <div className="bg-bg-card border border-white/10 rounded-2xl p-6 text-center text-white/30 text-sm">
            2人のプレイヤーを選択してください
          </div>
        ) : h2hStats.total === 0 ? (
          <div className="bg-bg-card border border-white/10 rounded-2xl p-6 text-center text-white/30 text-sm">
            この2人の同卓データがありません
          </div>
        ) : (
          <div className="bg-bg-card border border-white/10 rounded-2xl p-4">
            {/* Score row */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1 flex flex-col items-center gap-1">
                <div className="flex items-center gap-1.5">
                  <PlayerAvatar player={h2hStats.p1} size={18} />
                  <span className="text-white/80 text-sm font-bold">{h2hStats.p1.name}</span>
                </div>
                <span className="text-4xl font-bold tabular-nums" style={{ color: h2hStats.p1.color }}>
                  {h2hStats.wins}
                </span>
                <span className="text-xs text-white/40">勝</span>
              </div>
              <div className="flex flex-col items-center gap-0.5 px-3">
                {h2hStats.draws > 0 && (
                  <span className="text-lg font-bold text-white/30 tabular-nums">{h2hStats.draws}</span>
                )}
                {h2hStats.draws > 0 && <span className="text-[10px] text-white/30">分</span>}
                <span className="text-[10px] text-white/30 mt-1">同卓 {h2hStats.total} 局</span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-1">
                <div className="flex items-center gap-1.5">
                  <PlayerAvatar player={h2hStats.p2} size={18} />
                  <span className="text-white/80 text-sm font-bold">{h2hStats.p2.name}</span>
                </div>
                <span className="text-4xl font-bold tabular-nums" style={{ color: h2hStats.p2.color }}>
                  {h2hStats.losses}
                </span>
                <span className="text-xs text-white/40">勝</span>
              </div>
            </div>
            {/* Win rate bar */}
            {h2hStats.wins + h2hStats.losses > 0 && (
              <div>
                <div className="h-2 rounded-full overflow-hidden flex">
                  <div
                    className="h-full transition-all"
                    style={{
                      width: `${(h2hStats.wins / (h2hStats.wins + h2hStats.losses)) * 100}%`,
                      backgroundColor: h2hStats.p1.color,
                    }}
                  />
                  <div className="h-full flex-1" style={{ backgroundColor: h2hStats.p2.color }} />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-[10px] text-white/30">
                    {Math.round((h2hStats.wins / (h2hStats.wins + h2hStats.losses)) * 1000) / 10}%
                  </span>
                  <span className="text-[10px] text-white/30">
                    {Math.round((h2hStats.losses / (h2hStats.wins + h2hStats.losses)) * 1000) / 10}%
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
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
