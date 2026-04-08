import React, { useState } from 'react';
import { Download, Swords } from 'lucide-react';
import { useLeagueStore } from '@/stores/useLeagueStore';
import { useGameStore } from '@/stores/useGameStore';
import { useRealtimeGames } from '@/hooks/useRealtime';
import { GameCard } from '@/components/games/GameCard';
import { Modal } from '@/components/ui/Modal';
import { GameForm } from '@/components/games/GameForm';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { downloadCSV, exportGamesToCSV } from '@/utils/csvExport';

export const Games: React.FC = () => {
  const { league, players, currentSeason } = useLeagueStore();
  const { games, loading, deleteGame } = useGameStore();
  const [showForm, setShowForm] = useState(false);

  const leagueId = league?.id ?? '';
  const seasonId = currentSeason?.id ?? '';

  useRealtimeGames(leagueId, seasonId);

  const handleExport = () => {
    const csv = exportGamesToCSV(games, players);
    downloadCSV(csv, `mahjong-${currentSeason?.name ?? 'games'}.csv`);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">対局履歴</h1>
        <div className="flex gap-2">
          {games.length > 0 && (
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
      ) : games.length === 0 ? (
        <div className="text-center py-16 text-white/40">
          <Swords className="w-12 h-12 mb-3 mx-auto opacity-30" />
          <p className="text-sm">対局がまだありません</p>
          <p className="text-xs mt-1">「＋ 記録」から対局を追加してください</p>
        </div>
      ) : (
        <div className="space-y-3">
          {games.map((g) => (
            <GameCard
              key={g.id}
              game={g}
              players={players}
              onDelete={(id) => deleteGame(leagueId, seasonId, id)}
            />
          ))}
        </div>
      )}

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
    </div>
  );
};
