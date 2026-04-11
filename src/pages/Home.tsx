import React, { useState } from 'react';
import { BarChart2, Swords, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLeagueStore } from '@/stores/useLeagueStore';
import { useGameStore } from '@/stores/useGameStore';
import { RankingTable } from '@/components/dashboard/RankingTable';
import { RecentGames } from '@/components/dashboard/RecentGames';
import { SeasonSwitcher } from '@/components/dashboard/SeasonSwitcher';
import { Modal } from '@/components/ui/Modal';
import { GameForm } from '@/components/games/GameForm';
import { useRealtimeStandings, useRealtimeGames, useRealtimeTimeline } from '@/hooks/useRealtime';
import { Skeleton } from '@/components/ui/Skeleton';

export const Home: React.FC = () => {
  const { league, players, seasons, currentSeason, standings } = useLeagueStore();
  const { games } = useGameStore();
  const [showGameForm, setShowGameForm] = useState(false);

  const leagueId = league?.id ?? '';
  const seasonId = currentSeason?.id ?? '';

  useRealtimeStandings(leagueId, seasonId);
  useRealtimeGames(leagueId, seasonId);
  useRealtimeTimeline(leagueId);

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
    </div>
  );
};
