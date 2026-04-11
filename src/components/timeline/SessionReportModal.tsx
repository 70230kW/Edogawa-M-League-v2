import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useGameStore } from '@/stores/useGameStore';
import { useLeagueStore } from '@/stores/useLeagueStore';
import { useSessionStore } from '@/stores/useSessionStore';
import { useTimelineStore } from '@/stores/useTimelineStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { generateSessionReport } from '@/utils/timelineGenerator';
import { Session } from '@/types';

interface SessionReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  leagueId: string;
  seasonId: string;
  session: Session;
}

export const SessionReportModal: React.FC<SessionReportModalProps> = ({
  isOpen,
  onClose,
  leagueId,
  seasonId,
  session,
}) => {
  const { games } = useGameStore();
  const { players } = useLeagueStore();
  const { closeSession } = useSessionStore();
  const { addPost } = useTimelineStore();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const sessionGames = games.filter((g) => session.gameIds.includes(g.id));

  // Aggregate points and game count per player
  const playerTotals = new Map<string, number>();
  const playerGameCount = new Map<string, number>();
  for (const game of sessionGames) {
    for (const gp of game.players) {
      playerTotals.set(gp.playerId, (playerTotals.get(gp.playerId) ?? 0) + gp.point);
      playerGameCount.set(gp.playerId, (playerGameCount.get(gp.playerId) ?? 0) + 1);
    }
  }

  const results = [...playerTotals.entries()]
    .map(([playerId, totalPoint]) => ({
      player: players.find((p) => p.id === playerId)!,
      totalPoint,
      gamesPlayed: playerGameCount.get(playerId) ?? 0,
    }))
    .filter((r) => r.player);

  const content = results.length > 0
    ? generateSessionReport(session.name, session.date, sessionGames.length, results)
    : '';

  const handlePost = async () => {
    if (!user || results.length === 0) return;
    setLoading(true);
    try {
      await addPost(leagueId, {
        type: 'session_report',
        content,
        triggeredBy: user.uid,
        meta: {
          sessionId: session.id,
          date: session.date,
          name: session.name,
          results: results
            .slice()
            .sort((a, b) => b.totalPoint - a.totalPoint)
            .map((r, i) => ({
              playerId: r.player.id,
              rank: i + 1,
              totalPoint: r.totalPoint,
            })),
        },
      });
      await closeSession(leagueId, seasonId, session.id);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="セッションを締める">
      <div className="space-y-4">
        <p className="text-sm text-white/60">
          {session.name}（全{sessionGames.length}局）の集計をタイムラインに投稿し、セッションを終了します。
        </p>

        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <pre className="text-sm text-white/80 whitespace-pre-wrap font-sans leading-relaxed">
            {content || 'セッションのデータがありません'}
          </pre>
        </div>

        <div className="flex gap-3">
          <Button variant="ghost" className="flex-1" onClick={onClose}>
            キャンセル
          </Button>
          <Button
            variant="gold"
            className="flex-1"
            onClick={handlePost}
            loading={loading}
            disabled={results.length === 0}
          >
            <Send className="w-4 h-4 mr-1" />投稿して締める
          </Button>
        </div>
      </div>
    </Modal>
  );
};
