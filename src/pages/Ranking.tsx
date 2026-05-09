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

// Widths for sticky columns (px)
const RANK_W = 40;  // # column (including left page padding)
const NAME_W = 110; // name column

const stickyRank: React.CSSProperties = {
  position: 'sticky',
  left: 0,
  zIndex: 10,
  background: '#000000',
  paddingLeft: 16,
  minWidth: RANK_W,
  width: RANK_W,
};
const stickyName: React.CSSProperties = {
  position: 'sticky',
  left: RANK_W,
  zIndex: 10,
  background: '#000000',
  minWidth: NAME_W,
  width: NAME_W,
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
  const rows = useMemo(() => computeRanking(activeGames, players), [activeGames, players]);

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

      {loadingAlltime ? (
        <div className="text-center py-12 text-white/40 text-sm">読み込み中…</div>
      ) : rows.length === 0 ? (
        <div className="text-center py-12 text-white/30 text-sm">データがありません</div>
      ) : (
        /* overflow container: no padding so sticky left:0 aligns with viewport edge */
        <div style={{ overflowX: 'auto', margin: '0 -16px' }}>
          <table className="text-xs" style={{ minWidth: 640, width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <th className="pb-2.5 text-left text-white/30 uppercase tracking-wider" style={stickyRank}>#</th>
                <th className="pb-2.5 text-left text-white/30 uppercase tracking-wider" style={stickyName}>名前</th>
                <th className="pb-2.5 text-right pr-3 text-white/30 uppercase tracking-wider">合計pt</th>
                <th className="pb-2.5 text-right pr-3 text-white/30 uppercase tracking-wider">局数</th>
                <th className="pb-2.5 text-right pr-3 text-white/30 uppercase tracking-wider">平均</th>
                <th className="pb-2.5 text-right pr-3 text-white/30 uppercase tracking-wider">1位%</th>
                <th className="pb-2.5 text-right pr-3 text-white/30 uppercase tracking-wider">2位%</th>
                <th className="pb-2.5 text-right pr-3 text-white/30 uppercase tracking-wider">3位%</th>
                <th className="pb-2.5 text-right pr-3 text-white/30 uppercase tracking-wider">4位%</th>
                <th className="pb-2.5 text-right pr-3 text-white/30 uppercase tracking-wider">最高点</th>
                <th className="pb-2.5 text-right pr-4 text-white/30 uppercase tracking-wider">最高pt</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={row.player.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td className="py-3 font-bold text-white/50" style={stickyRank}>
                    {rankMedals[i] ?? `${i + 1}`}
                  </td>
                  <td className="py-3" style={stickyName}>
                    <Link
                      to={`/players/${row.player.id}`}
                      className="flex items-center gap-1.5 cursor-pointer group"
                    >
                      <PlayerAvatar player={row.player} size={20} />
                      <span className="text-white font-medium group-hover:text-accent transition-colors underline-offset-2 group-hover:underline">
                        {row.player.name}
                      </span>
                    </Link>
                  </td>
                  <td className={`py-3 text-right pr-3 font-bold tabular-nums ${row.totalPoint >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {row.totalPoint > 0 ? '+' : ''}{row.totalPoint.toFixed(1)}
                  </td>
                  <td className="py-3 text-right pr-3 text-white/60 tabular-nums">{row.totalGames}</td>
                  <td className="py-3 text-right pr-3 text-white/60 tabular-nums">{row.avgRank.toFixed(2)}</td>
                  <td className="py-3 text-right pr-3 text-white/60 tabular-nums">{row.top1Rate.toFixed(1)}%</td>
                  <td className="py-3 text-right pr-3 text-white/60 tabular-nums">{row.top2Rate.toFixed(1)}%</td>
                  <td className="py-3 text-right pr-3 text-white/60 tabular-nums">{row.top3Rate.toFixed(1)}%</td>
                  <td className="py-3 text-right pr-3 text-white/60 tabular-nums">{row.lastRate.toFixed(1)}%</td>
                  <td className="py-3 text-right pr-3 text-white/60 tabular-nums">{row.maxScore.toLocaleString()}</td>
                  <td className={`py-3 text-right pr-4 tabular-nums ${row.maxPoint > 0 ? 'text-accent/80' : 'text-white/60'}`}>
                    {row.maxPoint > 0 ? '+' : ''}{row.maxPoint.toFixed(1)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
