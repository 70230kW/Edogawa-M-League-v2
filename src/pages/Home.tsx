import React, { useState } from 'react';
import { BarChart2, Swords, Plus, Send, CalendarDays, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLeagueStore } from '@/stores/useLeagueStore';
import { useGameStore } from '@/stores/useGameStore';
import { useSessionStore } from '@/stores/useSessionStore';
import { RankingTable } from '@/components/dashboard/RankingTable';
import { RecentGames } from '@/components/dashboard/RecentGames';
import { SeasonSwitcher } from '@/components/dashboard/SeasonSwitcher';
import { Modal } from '@/components/ui/Modal';
import { GameForm } from '@/components/games/GameForm';
import { SessionReportModal } from '@/components/timeline/SessionReportModal';
import { useRealtimeStandings, useRealtimeGames, useRealtimeTimeline, useRealtimeSessions } from '@/hooks/useRealtime';
import { Skeleton } from '@/components/ui/Skeleton';
import { Player, GameRecord } from '@/types';

const rankColors = ['text-yellow-400', 'text-gray-300', 'text-amber-600', 'text-red-400'];

// Compute per-player cumulative stats for a set of games
function computeSessionStats(games: GameRecord[], players: Player[]) {
  const map = new Map<string, { total: number; rankSum: number; count: number }>();
  for (const game of games) {
    for (const gp of game.players) {
      const prev = map.get(gp.playerId) ?? { total: 0, rankSum: 0, count: 0 };
      map.set(gp.playerId, {
        total: prev.total + gp.point,
        rankSum: prev.rankSum + gp.rank,
        count: prev.count + 1,
      });
    }
  }
  return [...map.entries()]
    .map(([playerId, { total, rankSum, count }]) => ({
      playerId,
      player: players.find((p) => p.id === playerId) as Player | undefined,
      total: Math.round(total * 10) / 10,
      avgRank: count > 0 ? Math.round((rankSum / count) * 100) / 100 : 0,
    }))
    .filter((r): r is { playerId: string; player: Player; total: number; avgRank: number } => !!r.player)
    .sort((a, b) => b.total - a.total);
}

export const Home: React.FC = () => {
  const { league, players, seasons, currentSeason, standings } = useLeagueStore();
  const { games } = useGameStore();
  const { currentSession } = useSessionStore();
  const [showGameForm, setShowGameForm] = useState(false);
  const [showSessionReport, setShowSessionReport] = useState(false);
  const [expandGames, setExpandGames] = useState(false);

  const leagueId = league?.id ?? '';
  const seasonId = currentSeason?.id ?? '';

  useRealtimeStandings(leagueId, seasonId);
  useRealtimeGames(leagueId, seasonId);
  useRealtimeTimeline(leagueId);
  useRealtimeSessions(leagueId, seasonId);

  const sessionGames = currentSession
    ? games.filter((g) => currentSession.gameIds.includes(g.id))
        .slice()
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
    : [];

  const sessionStats = computeSessionStats(sessionGames, players);

  if (!league) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Season switcher */}
      <SeasonSwitcher seasons={seasons} currentSeason={currentSeason} />

      {/* Session status */}
      {currentSession && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold text-white/40 uppercase tracking-wider flex items-center gap-1">
              <CalendarDays className="w-3.5 h-3.5" />
              進行中の対局状況
            </h2>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowSessionReport(true)}
              className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-xl border border-accent/50 text-accent hover:bg-accent/10 transition-colors"
            >
              <Send className="w-3 h-3" />
              セッションを締める
            </motion.button>
          </div>

          <div className="bg-bg-card border border-white/10 rounded-2xl overflow-hidden">
            {/* Session header */}
            <div className="px-4 pt-3 pb-2 border-b border-white/5">
              <p className="text-xs text-accent font-medium">
                {currentSession.name}（第{sessionGames.length}局まで）
              </p>
            </div>

            {/* Player stats table */}
            {sessionStats.length === 0 ? (
              <p className="text-white/30 text-sm text-center py-4">まだ対局が記録されていません</p>
            ) : (
              <div className="p-4 space-y-2.5">
                {sessionStats.map((item) => (
                  <div key={item.playerId} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: item.player.color }}
                      />
                      <span className="text-sm text-white/80">{item.player.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-white/35 tabular-nums">
                        avg {item.avgRank.toFixed(2)}位
                      </span>
                      <span
                        className={`text-sm font-bold tabular-nums w-20 text-right ${
                          item.total >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}
                      >
                        {item.total > 0 ? '+' : ''}{item.total.toFixed(1)}pt
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Expand/collapse toggle */}
            {sessionGames.length > 0 && (
              <button
                onClick={() => setExpandGames((v) => !v)}
                className="w-full flex items-center justify-center gap-1 py-2.5 text-xs text-white/30 hover:text-white/60 border-t border-white/5 transition-colors"
              >
                {expandGames ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                {expandGames ? '各局を閉じる' : `各局の詳細（${sessionGames.length}局）`}
              </button>
            )}

            {/* Game detail list */}
            <AnimatePresence>
              {expandGames && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="border-t border-white/10 divide-y divide-white/5">
                    {sessionGames.map((game, i) => {
                      const sorted = [...game.players].sort((a, b) => a.rank - b.rank);
                      return (
                        <div key={game.id} className="px-4 py-3">
                          <p className="text-[10px] text-white/30 mb-2">第{i + 1}局</p>
                          <div className="grid grid-cols-4 gap-1">
                            {sorted.map((gp) => {
                              const p = players.find((pl) => pl.id === gp.playerId);
                              if (!p) return null;
                              return (
                                <div key={gp.playerId} className="text-center">
                                  <p className={`text-xs font-bold ${rankColors[gp.rank - 1]}`}>{gp.rank}位</p>
                                  <div
                                    className="w-1.5 h-1.5 rounded-full mx-auto my-1"
                                    style={{ backgroundColor: p.color }}
                                  />
                                  <p className="text-[10px] text-white/70 truncate">{p.name}</p>
                                  <p className="text-[10px] text-white/40 tabular-nums">
                                    {gp.score.toLocaleString()}
                                  </p>
                                  <p className={`text-[10px] font-bold tabular-nums ${gp.point >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {gp.point > 0 ? '+' : ''}{gp.point.toFixed(1)}
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>
      )}

      {/* Ranking */}
      <section>
        <h2 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">
          <BarChart2 className="w-3.5 h-3.5 inline mr-1" />ランキング
        </h2>
        <RankingTable standings={standings} players={players} />
      </section>

      {/* Recent games */}
      <section>
        <h2 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">
          <Swords className="w-3.5 h-3.5 inline mr-1" />直近の対局
        </h2>
        <RecentGames
          games={games}
          players={players}
          leagueId={leagueId}
          seasonId={seasonId}
        />
      </section>

      {/* FAB */}
      <motion.button
        whileTap={{ scale: 0.92 }}
        whileHover={{ scale: 1.05 }}
        onClick={() => setShowGameForm(true)}
        className="fixed right-5 w-14 h-14 rounded-full flex items-center justify-center text-black z-30"
        style={{
          bottom: 'calc(env(safe-area-inset-bottom) + 5.5rem)',
          background: 'linear-gradient(135deg, #00d4ff 0%, #0066ff 100%)',
          boxShadow: '0 0 25px rgba(0, 212, 255, 0.5), 0 4px 15px rgba(0, 0, 0, 0.5)',
        }}
      >
        <Plus className="w-7 h-7" strokeWidth={2.5} />
      </motion.button>

      {/* Game form modal */}
      <Modal
        isOpen={showGameForm}
        onClose={() => setShowGameForm(false)}
        title="対局を記録"
        size="lg"
      >
        {seasonId ? (
          <GameForm
            leagueId={leagueId}
            seasonId={seasonId}
            onSuccess={() => setShowGameForm(false)}
            onCancel={() => setShowGameForm(false)}
          />
        ) : (
          <div className="text-center py-6">
            <p className="text-white/60 text-sm">
              シーズンを作成してから対局を記録できます
            </p>
          </div>
        )}
      </Modal>

      {/* Session report modal */}
      {currentSession && (
        <SessionReportModal
          isOpen={showSessionReport}
          onClose={() => setShowSessionReport(false)}
          leagueId={leagueId}
          seasonId={seasonId}
          session={currentSession}
        />
      )}
    </div>
  );
};
