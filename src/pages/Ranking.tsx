import React, { useState, useMemo, useEffect } from 'react';
import { BarChart2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { useLeagueStore } from '@/stores/useLeagueStore';
import { useGameStore } from '@/stores/useGameStore';
import { useRealtimeGames } from '@/hooks/useRealtime';
import { GameRecord, Player } from '@/types';
import { PlayerAvatar } from '@/components/players/PlayerAvatar';

// Home.tsx から利用されているため維持
export function computeRanking(games: GameRecord[], players: Player[]) {
  const stats: Record<string, {
    totalGames: number;
    totalPoint: number;
    rankSum: number;
    rankCounts: number[];
    maxScore: number;
    maxPoint: number;
  }> = {};

  for (const game of games) {
    for (const gp of game.players) {
      if (!stats[gp.playerId]) {
        stats[gp.playerId] = {
          totalGames: 0,
          totalPoint: 0,
          rankSum: 0,
          rankCounts: [0, 0, 0, 0],
          maxScore: -Infinity,
          maxPoint: -Infinity,
        };
      }
      const s = stats[gp.playerId];
      s.totalGames++;
      s.totalPoint = Math.round((s.totalPoint + gp.point) * 10) / 10;
      s.rankSum += gp.rank;
      s.rankCounts[gp.rank - 1]++;
      if (gp.score > s.maxScore) s.maxScore = gp.score;
      if (gp.point > s.maxPoint) s.maxPoint = gp.point;
    }
  }

  return players
    .filter((p) => p.isActive && stats[p.id])
    .map((player) => {
      const s = stats[player.id];
      const n = s.totalGames;
      return {
        player,
        totalPoint: s.totalPoint,
        totalGames: n,
        avgRank: n > 0 ? Math.round((s.rankSum / n) * 100) / 100 : 0,
        top1Rate: n > 0 ? Math.round((s.rankCounts[0] / n) * 1000) / 10 : 0,
        top2Rate: n > 0 ? Math.round(((s.rankCounts[0] + s.rankCounts[1]) / n) * 1000) / 10 : 0,
        top3Rate: n > 0 ? Math.round(((s.rankCounts[0] + s.rankCounts[1] + s.rankCounts[2]) / n) * 1000) / 10 : 0,
        lastRate: n > 0 ? Math.round((s.rankCounts[3] / n) * 1000) / 10 : 0,
        maxScore: s.maxScore === -Infinity ? 0 : s.maxScore,
        maxPoint: s.maxPoint === -Infinity ? 0 : s.maxPoint,
      };
    })
    .sort((a, b) => b.totalPoint - a.totalPoint);
}

export function computeDashStats(games: GameRecord[], players: Player[]) {
  const activePlayers = players.filter((p) => p.isActive);
  const map = new Map<string, {
    totalPoint: number; rankCounts: number[];
    maxPoint: number; minPoint: number; flyCount: number; yakumanCount: number;
  }>();
  for (const game of games) {
    const yakumanIds = new Set(
      (game.events ?? []).filter((e) => e.type === 'yakuman').map((e) => e.playerId)
    );
    for (const gp of (game.players ?? [])) {
      const s = map.get(gp.playerId) ?? {
        totalPoint: 0, rankCounts: [0, 0, 0, 0],
        maxPoint: -Infinity, minPoint: Infinity, flyCount: 0, yakumanCount: 0,
      };
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
      flyRate: n > 0 ? Math.round((s.flyCount / n) * 1000) / 10 : 0,
      yakumanCount: s.yakumanCount,
    }];
  }).sort((a, b) => b.totalPoint - a.totalPoint);
}

const RANK_W = 40;
const NAME_W = 110;
const stickyRank: React.CSSProperties = {
  position: 'sticky', left: 0, zIndex: 10, background: '#000000',
  paddingLeft: 16, minWidth: RANK_W, width: RANK_W,
};
const stickyName: React.CSSProperties = {
  position: 'sticky', left: RANK_W, zIndex: 10, background: '#000000',
  minWidth: NAME_W, width: NAME_W,
};

export const Ranking: React.FC = () => {
  const { league, players, seasons, currentSeason } = useLeagueStore();
  const { games } = useGameStore();
  const [mode, setMode] = useState<'current' | 'alltime'>('current');
  const [alltimeGames, setAlltimeGames] = useState<GameRecord[] | null>(null);
  const [loadingAlltime, setLoadingAlltime] = useState(false);

  const leagueId = league?.id ?? '';
  useRealtimeGames(leagueId, currentSeason?.id ?? '');

  useEffect(() => {
    if (mode !== 'alltime' || alltimeGames !== null || !leagueId) return;
    setLoadingAlltime(true);
    const load = async () => {
      const allGames: GameRecord[] = [];
      for (const season of seasons) {
        const q = query(
          collection(db, 'leagues', leagueId, 'seasons', season.id, 'games'),
          orderBy('date')
        );
        const snap = await getDocs(q);
        for (const d of snap.docs) {
          allGames.push({ id: d.id, ...d.data() } as GameRecord);
        }
      }
      setAlltimeGames(allGames);
      setLoadingAlltime(false);
    };
    load().catch(console.error);
  }, [mode, leagueId, seasons, alltimeGames]);

  const activeGames = mode === 'current' ? games : (alltimeGames ?? []);
  const rows = useMemo(() => computeDashStats(activeGames, players), [activeGames, players]);

  const seasonSummary = useMemo(() => ({
    totalGames: activeGames.length,
    activeDays: new Set(activeGames.map((g) => g.date)).size,
    yakuman: activeGames.reduce((s, g) => s + (g.events ?? []).filter((e) => e.type === 'yakuman').length, 0),
    chonbo: activeGames.reduce((s, g) => s + (g.events ?? []).filter((e) => e.type === 'chonbo').length, 0),
    fly: rows.reduce((s, r) => s + r.flyCount, 0),
  }), [activeGames, rows]);

  const columnLeaders = useMemo((): Record<string, Set<string>> => {
    if (rows.length < 2) return {};
    const top = (fn: (r: typeof rows[0]) => number, higher: boolean): Set<string> => {
      const vals = rows.map(fn);
      const best = higher ? Math.max(...vals) : Math.min(...vals);
      return new Set(rows.filter((r) => fn(r) === best).map((r) => r.player.id));
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
      flyRate: top((r) => r.flyRate, false),
      yakumanCount: top((r) => r.yakumanCount, true),
    };
  }, [rows]);

  const rankMedals = ['🥇', '🥈', '🥉'];

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-accent" />ランキング
        </h1>
        <div className="flex gap-1 bg-white/5 rounded-xl p-1 border border-white/10">
          <button
            onClick={() => setMode('current')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              mode === 'current' ? 'bg-accent text-black' : 'text-white/50 hover:text-white/80'
            }`}
          >
            今季
          </button>
          <button
            onClick={() => setMode('alltime')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              mode === 'alltime' ? 'bg-accent text-black' : 'text-white/50 hover:text-white/80'
            }`}
          >
            通算
          </button>
        </div>
      </div>

      {/* サマリーカード */}
      {activeGames.length > 0 && (
        <div className="grid grid-cols-5 gap-2">
          {([
            { label: '総対局数', value: seasonSummary.totalGames, color: 'text-accent' },
            { label: '対局日数', value: seasonSummary.activeDays, color: 'text-sky-400' },
            { label: '役満', value: seasonSummary.yakuman, color: 'text-yellow-400' },
            { label: 'チョンボ', value: seasonSummary.chonbo, color: 'text-red-400' },
            { label: '飛び', value: seasonSummary.fly, color: 'text-orange-400' },
          ] as const).map(({ label, value, color }) => (
            <div key={label} className="bg-white/5 border border-white/10 rounded-xl p-2 text-center">
              <p className={`text-xl font-bold tabular-nums ${color}`}>{value}</p>
              <p className="text-[10px] text-white/40 mt-0.5 leading-tight">{label}</p>
            </div>
          ))}
        </div>
      )}

      {loadingAlltime ? (
        <div className="text-center py-12 text-white/40 text-sm">読み込み中…</div>
      ) : rows.length === 0 ? (
        <div className="text-center py-12 text-white/30 text-sm">データがありません</div>
      ) : (
        <div style={{ overflowX: 'auto', margin: '0 -16px' }}>
          <table className="text-xs" style={{ minWidth: 780, width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <th className="pb-2.5 text-left text-white/30 uppercase tracking-wider" style={stickyRank}>#</th>
                <th className="pb-2.5 text-left text-white/30 uppercase tracking-wider" style={stickyName}>名前</th>
                <th className="pb-2.5 text-right pr-3 text-white/30 font-medium">合計pt</th>
                <th className="pb-2.5 text-right pr-3 text-white/30 font-medium">局数</th>
                <th className="pb-2.5 text-right pr-3 text-white/30 font-medium">平均</th>
                <th className="pb-2.5 text-right pr-3 text-yellow-400/70 font-medium">1位%</th>
                <th className="pb-2.5 text-right pr-3 text-gray-300/70 font-medium">2位%</th>
                <th className="pb-2.5 text-right pr-3 text-amber-600/70 font-medium">3位%</th>
                <th className="pb-2.5 text-right pr-3 text-red-400/70 font-medium">4位%</th>
                <th className="pb-2.5 text-right pr-3 text-green-400/70 font-medium">最高pt</th>
                <th className="pb-2.5 text-right pr-3 text-red-400/70 font-medium">最低pt</th>
                <th className="pb-2.5 text-right pr-3 text-orange-400/70 font-medium">飛び</th>
                <th className="pb-2.5 text-right pr-3 text-orange-400/70 font-medium">飛び率</th>
                <th className="pb-2.5 text-right pr-4 text-yellow-400/70 font-medium">役満</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => {
                const L = (col: string, id: string) =>
                  columnLeaders[col]?.has(id)
                    ? <span className="mr-0.5 text-[9px] text-yellow-400 align-top leading-none">★</span>
                    : null;
                return (
                  <tr key={row.player.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td className="py-2.5 font-bold text-white/50" style={stickyRank}>
                      {rankMedals[i] ?? `${i + 1}`}
                    </td>
                    <td className="py-2.5" style={stickyName}>
                      <Link
                        to={`/players/${row.player.id}`}
                        className="flex items-center gap-1.5 cursor-pointer group"
                      >
                        <PlayerAvatar player={row.player} size={20} />
                        <span className="text-white font-medium group-hover:text-accent transition-colors underline-offset-2 group-hover:underline truncate" style={{ maxWidth: 72 }}>
                          {row.player.name}
                        </span>
                      </Link>
                    </td>
                    <td className={`py-2.5 text-right pr-3 font-bold tabular-nums ${row.totalPoint >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {L('totalPoint', row.player.id)}{row.totalPoint > 0 ? '+' : ''}{row.totalPoint.toFixed(1)}
                    </td>
                    <td className="py-2.5 text-right pr-3 text-white/60 tabular-nums">{L('games', row.player.id)}{row.games}</td>
                    <td className="py-2.5 text-right pr-3 text-white/60 tabular-nums">{L('avgRank', row.player.id)}{row.avgRank.toFixed(2)}</td>
                    <td className="py-2.5 text-right pr-3 text-yellow-400 tabular-nums">{L('rank1Rate', row.player.id)}{row.rank1Rate.toFixed(1)}%</td>
                    <td className="py-2.5 text-right pr-3 text-gray-300 tabular-nums">{L('rank2Rate', row.player.id)}{row.rank2Rate.toFixed(1)}%</td>
                    <td className="py-2.5 text-right pr-3 text-amber-600 tabular-nums">{L('rank3Rate', row.player.id)}{row.rank3Rate.toFixed(1)}%</td>
                    <td className="py-2.5 text-right pr-3 text-red-400 tabular-nums">{L('rank4Rate', row.player.id)}{row.rank4Rate.toFixed(1)}%</td>
                    <td className={`py-2.5 text-right pr-3 tabular-nums ${row.maxPoint > 0 ? 'text-green-400' : 'text-white/60'}`}>
                      {L('maxPoint', row.player.id)}{row.maxPoint > 0 ? '+' : ''}{row.maxPoint.toFixed(1)}
                    </td>
                    <td className={`py-2.5 text-right pr-3 tabular-nums ${row.minPoint < 0 ? 'text-red-400' : 'text-white/60'}`}>
                      {L('minPoint', row.player.id)}{row.minPoint > 0 ? '+' : ''}{row.minPoint.toFixed(1)}
                    </td>
                    <td className="py-2.5 text-right pr-3 text-white/60 tabular-nums">{L('flyCount', row.player.id)}{row.flyCount}</td>
                    <td className="py-2.5 text-right pr-3 text-orange-400 tabular-nums">{L('flyRate', row.player.id)}{row.flyRate.toFixed(1)}%</td>
                    <td className="py-2.5 text-right pr-4 tabular-nums">
                      {row.yakumanCount > 0
                        ? <span className="text-yellow-400 font-bold">{L('yakumanCount', row.player.id)}{row.yakumanCount}</span>
                        : <span className="text-white/20">—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
