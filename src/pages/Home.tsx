import React, { useState } from 'react';
import { BarChart2, Swords, Plus, Send, CalendarDays } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLeagueStore } from '@/stores/useLeagueStore';
import { useGameStore } from '@/stores/useGameStore';
import { RankingTable } from '@/components/dashboard/RankingTable';
import { RecentGames } from '@/components/dashboard/RecentGames';
import { SeasonSwitcher } from '@/components/dashboard/SeasonSwitcher';
import { Modal } from '@/components/ui/Modal';
import { GameForm } from '@/components/games/GameForm';
import { DailyReportModal } from '@/components/timeline/DailyReportModal';
import { useRealtimeStandings, useRealtimeGames, useRealtimeTimeline } from '@/hooks/useRealtime';
import { Skeleton } from '@/components/ui/Skeleton';
import { todayString } from '@/utils/dateUtils';
import { Player } from '@/types';

export const Home: React.FC = () => {
  const { league, players, seasons, currentSeason, standings } = useLeagueStore();
  const { games } = useGameStore();
  const [showGameForm, setShowGameForm] = useState(false);
  const [showDailyReport, setShowDailyReport] = useState(false);

  const leagueId = league?.id ?? '';
  const seasonId = currentSeason?.id ?? '';

  useRealtimeStandings(leagueId, seasonId);
  useRealtimeGames(leagueId, seasonId);
  useRealtimeTimeline(leagueId);

  // Today's cumulative data
  const today = todayString();
  const todayGames = games.filter((g) => g.date === today);

  const playerTotalsMap = new Map<string, number>();
  for (const game of todayGames) {
    for (const gp of game.players) {
      playerTotalsMap.set(gp.playerId, (playerTotalsMap.get(gp.playerId) ?? 0) + gp.point);
    }
  }
  const todayTotals = [...playerTotalsMap.entries()]
    .map(([playerId, total]) => ({
      playerId,
      player: players.find((p) => p.id === playerId) as Player | undefined,
      total,
    }))
    .filter((r): r is { playerId: string; player: Player; total: number } => !!r.player)
    .sort((a, b) => b.total - a.total);

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

      {/* Today's cumulative - only shown when today has games */}
      {todayGames.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold text-white/40 uppercase tracking-wider flex items-center gap-1">
              <CalendarDays className="w-3.5 h-3.5" />
              本日の累計（第{todayGames.length}局まで）
            </h2>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowDailyReport(true)}
              className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-xl border border-accent/50 text-accent hover:bg-accent/10 transition-colors"
            >
              <Send className="w-3 h-3" />
              本日を締める
            </motion.button>
          </div>

          <div className="bg-bg-card border border-white/10 rounded-2xl p-4 space-y-2.5">
            {todayTotals.map((item) => (
              <div key={item.playerId} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.player.color }}
                  />
                  <span className="text-sm text-white/80">{item.player.name}</span>
                </div>
                <span
                  className={`text-sm font-bold tabular-nums ${
                    item.total >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {item.total > 0 ? '+' : ''}{item.total.toFixed(1)}pt
                </span>
              </div>
            ))}
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

      {/* Daily report modal */}
      <DailyReportModal
        isOpen={showDailyReport}
        onClose={() => setShowDailyReport(false)}
        leagueId={leagueId}
        seasonId={seasonId}
      />
    </div>
  );
};
