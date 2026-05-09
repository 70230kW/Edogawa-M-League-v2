import React, { useState, useMemo, useEffect } from 'react';
import { TrendingUp, Target, Calendar, Swords, ChevronDown, Trophy } from 'lucide-react';
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
import { YakumanType } from '@/types';

const ALL_YAKUMAN: YakumanType[] = [
  '天和', '地和', '人和',
  '国士無双', '国士無双十三面',
  '四暗刻', '四暗刻単騎',
  '大三元', '緑一色', '字一色',
  '小四喜', '大四喜', '清老頭',
  '四槓子',
  '九蓮宝燈', '純正九蓮宝燈',
  '数え役満',
];

export const Stats: React.FC = () => {
  const { players, standings, league, currentSeason } = useLeagueStore();
  const { games } = useGameStore();

  const leagueId = league?.id ?? '';
  const seasonId = currentSeason?.id ?? '';
  useRealtimeGames(leagueId, seasonId);
  useRealtimeStandings(leagueId, seasonId);

  const activePlayers = useMemo(() => players.filter((p) => p.isActive), [players]);

  const [selectedPlayers, setSelectedPlayers] = useState<string[]>(
    activePlayers.map((p) => p.id)
  );
  const [calMonth, setCalMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [h2hPlayer1, setH2hPlayer1] = useState<string>('');
  const [h2hPlayer2, setH2hPlayer2] = useState<string>('');

  useEffect(() => {
    if (activePlayers.length > 0 && selectedPlayers.length === 0) {
      setSelectedPlayers(activePlayers.map((p) => p.id));
    }
  }, [activePlayers.length]); // eslint-disable-line react-hooks/exhaustive-deps

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

  const yakumanCounts = useMemo(() => {
    const counts: Partial<Record<YakumanType, number>> = {};
    for (const game of games) {
      for (const event of (game.events ?? [])) {
        if (event.type === 'yakuman' && event.yakumanList) {
          for (const yaku of event.yakumanList) {
            counts[yaku] = (counts[yaku] ?? 0) + 1;
          }
        }
      }
    }
    return counts;
  }, [games]);

  const achievedCount = ALL_YAKUMAN.filter((y) => (yakumanCounts[y] ?? 0) > 0).length;

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

  return (
    <div className="p-4 space-y-8">
      <h1 className="text-xl font-bold text-white">統計・分析</h1>

      {/* 役満コンプリート */}
      <section>
        <h2 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Trophy className="w-3.5 h-3.5" />
          目指せ！みんなで役満コンプリート
        </h2>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-white/50">
            {achievedCount} / {ALL_YAKUMAN.length} 種達成
            {achievedCount === ALL_YAKUMAN.length && (
              <span className="ml-2 text-yellow-400 font-bold">全制覇！</span>
            )}
          </span>
          {achievedCount > 0 && (
            <div className="h-1.5 w-32 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-yellow-400 rounded-full transition-all"
                style={{ width: `${(achievedCount / ALL_YAKUMAN.length) * 100}%` }}
              />
            </div>
          )}
        </div>
        <div className="grid grid-cols-3 gap-2">
          {ALL_YAKUMAN.map((yaku) => {
            const count = yakumanCounts[yaku] ?? 0;
            return (
              <div
                key={yaku}
                className={`rounded-xl p-2.5 text-center border transition-colors ${
                  count > 0
                    ? 'bg-yellow-400/10 border-yellow-400/30'
                    : 'bg-white/3 border-white/5'
                }`}
              >
                <p className={`text-[10px] font-medium leading-tight ${count > 0 ? 'text-white/80' : 'text-white/20'}`}>
                  {yaku}
                </p>
                <p className={`text-2xl font-bold tabular-nums mt-0.5 ${count > 0 ? 'text-yellow-400' : 'text-white/10'}`}>
                  {count}
                </p>
                <p className={`text-[9px] ${count > 0 ? 'text-yellow-400/50' : 'text-white/10'}`}>回</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 累積ポイント推移 */}
      <section>
        <h2 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5" />
          累積ポイント推移
        </h2>
        <div className="bg-bg-card border border-white/10 rounded-2xl p-4">
          <CumulativeLineChart games={games} players={activePlayers} />
        </div>
      </section>

      {/* プレイヤー比較 */}
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

      {/* 直接対決 */}
      <section>
        <h2 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Swords className="w-3.5 h-3.5" />
          直接対決
        </h2>
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

      {/* 対局カレンダー */}
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
