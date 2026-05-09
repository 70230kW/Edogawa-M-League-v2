import React, { useMemo, useState } from 'react';
import { Trophy } from 'lucide-react';
import { useLeagueStore } from '@/stores/useLeagueStore';
import { useGameStore } from '@/stores/useGameStore';
import { useRealtimeGames } from '@/hooks/useRealtime';
import { YakumanType } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { PlayerAvatar } from '@/components/players/PlayerAvatar';

const ALL_YAKUMAN: YakumanType[] = [
  '天和', '地和', '人和',
  '国士無双', '国士無双十三面',
  '四暗刻', '四暗刻単騎',
  '大三元', '緑一色', '字一色',
  '小四喜', '大四喜', '清老頭',
  '四槓子',
  '九蓮宝燈', '純正九蓮宝燈',
  '数え役満',
];

export const Yakuman: React.FC = () => {
  const { league, currentSeason, players } = useLeagueStore();
  const { games } = useGameStore();

  const leagueId = league?.id ?? '';
  const seasonId = currentSeason?.id ?? '';
  useRealtimeGames(leagueId, seasonId);

  const [selectedYaku, setSelectedYaku] = useState<YakumanType | null>(null);

  // type → playerId → count
  const yakumanPlayerCounts = useMemo(() => {
    const result: Partial<Record<YakumanType, Record<string, number>>> = {};
    for (const game of games) {
      for (const event of (game.events ?? [])) {
        if (event.type === 'yakuman' && event.yakumanList) {
          for (const yaku of event.yakumanList) {
            if (!result[yaku]) result[yaku] = {};
            result[yaku]![event.playerId] = (result[yaku]![event.playerId] ?? 0) + 1;
          }
        }
      }
    }
    return result;
  }, [games]);

  // type → 合計回数
  const yakumanCounts = useMemo(() => {
    const counts: Partial<Record<YakumanType, number>> = {};
    for (const [yaku, playerMap] of Object.entries(yakumanPlayerCounts) as [YakumanType, Record<string, number>][]) {
      counts[yaku] = Object.values(playerMap).reduce((a, b) => a + b, 0);
    }
    return counts;
  }, [yakumanPlayerCounts]);

  const achievedCount = ALL_YAKUMAN.filter((y) => (yakumanCounts[y] ?? 0) > 0).length;

  // 選択中の役満の per-player 内訳（降順）
  const detailRows = useMemo(() => {
    if (!selectedYaku) return [];
    const playerMap = yakumanPlayerCounts[selectedYaku] ?? {};
    return Object.entries(playerMap)
      .map(([playerId, count]) => ({
        player: players.find((p) => p.id === playerId),
        count,
      }))
      .filter((r) => r.player != null)
      .sort((a, b) => b.count - a.count) as { player: NonNullable<typeof players[0]>; count: number }[];
  }, [selectedYaku, yakumanPlayerCounts, players]);

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-xl font-bold text-white flex items-center gap-2">
        <Trophy className="w-5 h-5 text-yellow-400" />役満
      </h1>

      <section>
        <h2 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Trophy className="w-3.5 h-3.5" />
          目指せ！みんなで役満コンプリート
        </h2>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-white/50">
            {achievedCount} / {ALL_YAKUMAN.length} 種達成
            {achievedCount === ALL_YAKUMAN.length && (
              <span className="ml-2 text-yellow-400 font-bold">全制覇！</span>
            )}
          </span>
          {achievedCount > 0 && (
            <div className="h-1.5 w-32 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-yellow-400 rounded-full transition-all"
                style={{ width: `${(achievedCount / ALL_YAKUMAN.length) * 100}%` }}
              />
            </div>
          )}
        </div>
        <div className="grid grid-cols-3 gap-2">
          {ALL_YAKUMAN.map((yaku) => {
            const count = yakumanCounts[yaku] ?? 0;
            const achieved = count > 0;
            return (
              <button
                key={yaku}
                onClick={() => achieved && setSelectedYaku(yaku)}
                className={`rounded-xl p-2.5 text-center border transition-colors ${
                  achieved
                    ? 'bg-yellow-400/10 border-yellow-400/30 active:bg-yellow-400/20 cursor-pointer'
                    : 'bg-white/3 border-white/5 cursor-default'
                }`}
              >
                <p className={`text-[10px] font-medium leading-tight ${achieved ? 'text-white/80' : 'text-white/20'}`}>
                  {yaku}
                </p>
                <p className={`text-2xl font-bold tabular-nums mt-0.5 ${achieved ? 'text-yellow-400' : 'text-white/10'}`}>
                  {count}
                </p>
                <p className={`text-[9px] ${achieved ? 'text-yellow-400/50' : 'text-white/10'}`}>回</p>
              </button>
            );
          })}
        </div>
      </section>

      {/* 役満詳細モーダル */}
      <Modal
        isOpen={!!selectedYaku}
        onClose={() => setSelectedYaku(null)}
        title={selectedYaku ?? ''}
      >
        <div className="space-y-3">
          {detailRows.length === 0 ? (
            <p className="text-center text-white/40 text-sm py-4">データなし</p>
          ) : (
            detailRows.map(({ player, count }) => (
              <div
                key={player.id}
                className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3"
              >
                <PlayerAvatar player={player} size={36} />
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-sm truncate">{player.name}</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold tabular-nums text-yellow-400">{count}</span>
                  <span className="text-xs text-yellow-400/60 ml-1">回</span>
                </div>
              </div>
            ))
          )}
        </div>
      </Modal>
    </div>
  );
};
