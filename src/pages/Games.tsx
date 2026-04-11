import React, { useState, useMemo, useEffect } from 'react';
import { Download, Swords, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLeagueStore } from '@/stores/useLeagueStore';
import { useGameStore } from '@/stores/useGameStore';
import { useSessionStore } from '@/stores/useSessionStore';
import { useRealtimeGames, useRealtimeSessions } from '@/hooks/useRealtime';
import { GameCard } from '@/components/games/GameCard';
import { Modal } from '@/components/ui/Modal';
import { GameForm } from '@/components/games/GameForm';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { downloadCSV, exportGamesToCSV } from '@/utils/csvExport';
import { GameRecord } from '@/types';

export const Games: React.FC = () => {
  const { league, players, currentSeason } = useLeagueStore();
  const { games, loading, deleteGame } = useGameStore();
  const { sessions } = useSessionStore();
  const [showForm, setShowForm] = useState(false);
  const [editingGame, setEditingGame] = useState<GameRecord | null>(null);
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(new Set());
  const [initialized, setInitialized] = useState(false);

  const leagueId = league?.id ?? '';
  const seasonId = currentSeason?.id ?? '';

  useRealtimeGames(leagueId, seasonId);
  useRealtimeSessions(leagueId, seasonId);

  // Auto-expand most recent session on first load
  useEffect(() => {
    if (!initialized && sessions.length > 0) {
      const sorted = [...sessions].sort((a, b) => b.date.localeCompare(a.date));
      if (sorted[0]) setExpandedSessions(new Set([sorted[0].id]));
      setInitialized(true);
    }
  }, [sessions.length, initialized]);

  const toggleSession = (sessionId: string) => {
    setExpandedSessions((prev) => {
      const next = new Set(prev);
      if (next.has(sessionId)) next.delete(sessionId);
      else next.add(sessionId);
      return next;
    });
  };

  const handleExport = () => {
    const csv = exportGamesToCSV(games, players);
    downloadCSV(csv, `mahjong-${currentSeason?.name ?? 'games'}.csv`);
  };

  // Group games by session
  const { bySession, ungrouped, sortedSessions } = useMemo(() => {
    const gameToSession = new Map<string, (typeof sessions)[0]>();
    for (const sess of sessions) {
      for (const gid of sess.gameIds) {
        gameToSession.set(gid, sess);
      }
    }

    const bySession = new Map<string, GameRecord[]>();
    const ungrouped: GameRecord[] = [];

    for (const game of games) {
      const sess = gameToSession.get(game.id);
      if (sess) {
        if (!bySession.has(sess.id)) bySession.set(sess.id, []);
        bySession.get(sess.id)!.push(game);
      } else {
        ungrouped.push(game);
      }
    }

    const sortedSessions = [...sessions].sort((a, b) => b.date.localeCompare(a.date));
    return { bySession, ungrouped, sortedSessions };
  }, [games, sessions]);

  const hasGames = games.length > 0;

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">対局履歴</h1>
        <div className="flex gap-2">
          {hasGames && (
            <Button variant="ghost" size="sm" onClick={handleExport}>
              <Download className="w-3.5 h-3.5 mr-1" />CSV
            </Button>
          )}
          <Button variant="gold" size="sm" onClick={() => setShowForm(true)}>
            ＋ 記録
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-24" count={5} />
        </div>
      ) : !hasGames ? (
        <div className="text-center py-16 text-white/40">
          <Swords className="w-12 h-12 mb-3 mx-auto opacity-30" />
          <p className="text-sm">対局がまだありません</p>
          <p className="text-xs mt-1">「＋ 記録」から対局を追加してください</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Session accordion groups */}
          {sortedSessions.map((sess) => {
            const sessGames = bySession.get(sess.id) ?? [];
            if (sessGames.length === 0) return null;
            const isExpanded = expandedSessions.has(sess.id);
            return (
              <div key={sess.id} className="rounded-2xl overflow-hidden border border-white/10">
                <button
                  onClick={() => toggleSession(sess.id)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-bg-card"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white text-sm">{sess.name}</span>
                    {sess.status === 'active' && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent/20 text-accent border border-accent/30">
                        進行中
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-white/40">
                    <span className="text-xs">{sessGames.length}局</span>
                    {isExpanded
                      ? <ChevronUp className="w-4 h-4" />
                      : <ChevronDown className="w-4 h-4" />
                    }
                  </div>
                </button>
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="p-3 space-y-3 border-t border-white/5">
                        {sessGames.map((g) => (
                          <GameCard
                            key={g.id}
                            game={g}
                            players={players}
                            onDelete={(id) => deleteGame(leagueId, seasonId, id)}
                            onEdit={(game) => setEditingGame(game)}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}

          {/* Ungrouped games */}
          {ungrouped.length > 0 && (
            <div className="rounded-2xl overflow-hidden border border-white/10">
              <button
                onClick={() => toggleSession('__ungrouped__')}
                className="w-full flex items-center justify-between px-4 py-3 bg-bg-card"
              >
                <span className="font-medium text-white/50 text-sm">未分類</span>
                <div className="flex items-center gap-2 text-white/40">
                  <span className="text-xs">{ungrouped.length}局</span>
                  {expandedSessions.has('__ungrouped__')
                    ? <ChevronUp className="w-4 h-4" />
                    : <ChevronDown className="w-4 h-4" />
                  }
                </div>
              </button>
              <AnimatePresence>
                {expandedSessions.has('__ungrouped__') && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="p-3 space-y-3 border-t border-white/5">
                      {ungrouped.map((g) => (
                        <GameCard
                          key={g.id}
                          game={g}
                          players={players}
                          onDelete={(id) => deleteGame(leagueId, seasonId, id)}
                          onEdit={(game) => setEditingGame(game)}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      )}

      {/* Add game modal */}
      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title="対局を記録"
        size="lg"
      >
        {seasonId ? (
          <GameForm
            leagueId={leagueId}
            seasonId={seasonId}
            onSuccess={() => setShowForm(false)}
            onCancel={() => setShowForm(false)}
          />
        ) : (
          <div className="text-center py-6">
            <p className="text-white/60 text-sm">シーズンを作成してください</p>
          </div>
        )}
      </Modal>

      {/* Edit game modal */}
      <Modal
        isOpen={!!editingGame}
        onClose={() => setEditingGame(null)}
        title="対局を編集"
        size="lg"
      >
        {editingGame && seasonId && (
          <GameForm
            leagueId={leagueId}
            seasonId={seasonId}
            initialGame={editingGame}
            onSuccess={() => setEditingGame(null)}
            onCancel={() => setEditingGame(null)}
          />
        )}
      </Modal>
    </div>
  );
};
