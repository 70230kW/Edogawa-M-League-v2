import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLeagueStore } from '@/stores/useLeagueStore';
import { useGameStore } from '@/stores/useGameStore';
import { GameCard } from '@/components/games/GameCard';
import { TrophyShelf } from '@/components/players/TrophyShelf';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatPoint } from '@/utils/pointCalc';
import { usePlayerTrophies } from '@/hooks/useAchievements';

export const PlayerDetail: React.FC = () => {
  const { playerId } = useParams<{ playerId: string }>();
  const { players, standings, league } = useLeagueStore();
  const { games } = useGameStore();
  const navigate = useNavigate();

  const player = players.find((p) => p.id === playerId);
  const standing = standings.find((s) => s.playerId === playerId);
  const playerGames = games.filter((g) =>
    g.players.some((p) => p.playerId === playerId)
  );

  const leagueId = league?.id ?? '';
  const { trophies, loading: trophiesLoading } = usePlayerTrophies(leagueId, playerId ?? '');

  if (!player) {
    return (
      <div className="p-4 text-center py-16" style={{ color: 'rgba(255,255,255,0.3)' }}>
        <p className="text-4xl mb-3">👤</p>
        <p>プレイヤーが見つかりません</p>
      </div>
    );
  }

  const statItems = [
    { label: '総合ポイント', value: standing ? formatPoint(standing.totalPoint) : '0.0', highlight: true },
    { label: '対局数',       value: `${standing?.totalGames ?? 0}` },
    { label: '平均順位',     value: standing ? `${standing.avgRank.toFixed(2)}位` : '-' },
    { label: '1位率',        value: standing ? `${standing.top1Rate.toFixed(1)}%` : '-' },
    { label: 'トップ2率',   value: standing ? `${standing.top2Rate.toFixed(1)}%` : '-' },
    { label: 'ラス率',       value: standing ? `${standing.lastRate.toFixed(1)}%` : '-' },
  ];

  return (
    <div className="p-4 space-y-6">
      {/* 戻るボタン */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-sm transition-colors"
        style={{ color: 'rgba(0,212,255,0.7)' }}
      >
        ← 戻る
      </button>

      {/* プレイヤーヘッダー */}
      <div className="flex items-center gap-4">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-3xl font-bold text-white"
          style={{
            backgroundColor: player.color,
            boxShadow: `0 0 20px ${player.color}66`,
          }}
        >
          {player.name[0]}
        </div>
        <div>
          <h1
            className="text-2xl font-bold text-white"
            style={{ fontFamily: 'Rajdhani, sans-serif' }}
          >
            {player.name}
          </h1>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>
            {playerGames.length}対局参加
          </p>
        </div>
      </div>

      {/* 成績グリッド */}
      <div className="grid grid-cols-3 gap-2">
        {statItems.map((item) => (
          <div
            key={item.label}
            className="rounded-xl p-3 text-center"
            style={{
              background: 'rgba(0,5,20,0.8)',
              border: item.highlight
                ? '1px solid rgba(0,212,255,0.3)'
                : '1px solid rgba(255,255,255,0.07)',
            }}
          >
            <p className="text-[10px] mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
              {item.label}
            </p>
            <p
              className={`font-bold ${item.highlight ? 'text-lg' : 'text-white'}`}
              style={
                item.highlight
                  ? { fontFamily: 'Rajdhani, sans-serif', color: '#00d4ff' }
                  : {}
              }
            >
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {/* トロフィー棚 */}
      <section>
        <h2
          className="text-xs font-bold uppercase tracking-wider mb-3"
          style={{ color: 'rgba(255,255,255,0.35)' }}
        >
          🏆 トロフィー棚
        </h2>
        {trophiesLoading ? (
          <Skeleton className="h-32" />
        ) : (
          <TrophyShelf unlockedTrophies={trophies} />
        )}
      </section>

      {/* 対局履歴 */}
      <section>
        <h2
          className="text-xs font-bold uppercase tracking-wider mb-3"
          style={{ color: 'rgba(255,255,255,0.35)' }}
        >
          🎮 対局履歴
        </h2>
        {playerGames.length === 0 ? (
          <p className="text-sm text-center py-4" style={{ color: 'rgba(255,255,255,0.25)' }}>
            対局記録なし
          </p>
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
