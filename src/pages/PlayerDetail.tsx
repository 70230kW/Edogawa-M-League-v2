import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLeagueStore } from '@/stores/useLeagueStore';
import { useGameStore } from '@/stores/useGameStore';
import { GameCard } from '@/components/games/GameCard';
import { TrophyShelf } from '@/components/players/TrophyShelf';
import { formatPoint } from '@/utils/pointCalc';

export const PlayerDetail: React.FC = () => {
  const { playerId } = useParams<{ playerId: string }>();
  const { players, standings } = useLeagueStore();
  const { games } = useGameStore();
  const navigate = useNavigate();

  const player = players.find((p) => p.id === playerId);
  const standing = standings.find((s) => s.playerId === playerId);
  const playerGames = games.filter((g) =>
    g.players.some((p) => p.playerId === playerId)
  );

  if (!player) {
    return (
      <div className="p-4 text-center text-white/40 py-16">
        <p className="text-4xl mb-3">👤</p>
        <p>プレイヤーが見つかりません</p>
      </div>
    );
  }

  const statItems = [
    { label: '総合ポイント', value: standing ? formatPoint(standing.totalPoint) : '0.0', accent: true },
    { label: '対局数', value: `${standing?.totalGames ?? 0}` },
    { label: '平均順位', value: standing ? `${standing.avgRank.toFixed(2)}位` : '-' },
    { label: '1位率', value: standing ? `${standing.top1Rate.toFixed(1)}%` : '-' },
    { label: 'トップ2率', value: standing ? `${standing.top2Rate.toFixed(1)}%` : '-' },
    { label: 'ラス率', value: standing ? `${standing.lastRate.toFixed(1)}%` : '-' },
  ];

  return (
    <div className="p-4 space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="text-white/50 text-sm flex items-center gap-1 hover:text-white transition-colors"
      >
        ← 戻る
      </button>

      {/* Player header */}
      <div className="flex items-center gap-4">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-[0_0_20px_rgba(0,0,0,0.5)]"
          style={{ backgroundColor: player.color }}
        >
          {player.name[0]}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">{player.name}</h1>
          <p className="text-white/40 text-sm">{playerGames.length}対局参加</p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-3">
        {statItems.map((item) => (
          <div
            key={item.label}
            className="bg-bg-card border border-white/10 rounded-xl p-3 text-center"
          >
            <p className="text-[10px] text-white/40 mb-1">{item.label}</p>
            <p className={`font-bold ${item.accent ? 'text-lg text-accent' : 'text-white'}`}>
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {/* Trophy shelf */}
      <section>
        <h2 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">
          🏆 トロフィー棚
        </h2>
        <TrophyShelf earnedIds={[]} />
      </section>

      {/* Game history */}
      <section>
        <h2 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">
          🎮 対局履歴
        </h2>
        {playerGames.length === 0 ? (
          <p className="text-white/30 text-sm text-center py-4">対局記録なし</p>
        ) : (
          <div className="space-y-3">
            {playerGames.slice(0, 20).map((g) => (
              <GameCard key={g.id} game={g} players={players} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
