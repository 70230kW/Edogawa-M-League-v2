import React, { useMemo } from 'react';
import { Trophy } from 'lucide-react';
import { useLeagueStore } from '@/stores/useLeagueStore';
import { useGameStore } from '@/stores/useGameStore';
import { useRealtimeGames } from '@/hooks/useRealtime';
import { YakumanType } from '@/types';

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
  const { league, currentSeason } = useLeagueStore();
  const { games } = useGameStore();

  const leagueId = league?.id ?? '';
  const seasonId = currentSeason?.id ?? '';
  useRealtimeGames(leagueId, seasonId);

  const yakumanCounts = useMemo(() => {
    const counts: Partial<Record<YakumanType, number>> = {};
    for (const game of games) {
      for (const event of (game.events ?? [])) {
        if (event.type === 'yakuman' && event.yakumanList) {
          for (const yaku of event.yakumanList) {
            counts[yaku] = (counts[yaku] ?? 0) + 1;
          }
        }
      }
    }
    return counts;
  }, [games]);

  const achievedCount = ALL_YAKUMAN.filter((y) => (yakumanCounts[y] ?? 0) > 0).length;

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
            return (
              <div
                key={yaku}
                className={`rounded-xl p-2.5 text-center border transition-colors ${
                  count > 0
                    ? 'bg-yellow-400/10 border-yellow-400/30'
                    : 'bg-white/3 border-white/5'
                }`}
              >
                <p className={`text-[10px] font-medium leading-tight ${count > 0 ? 'text-white/80' : 'text-white/20'}`}>
                  {yaku}
                </p>
                <p className={`text-2xl font-bold tabular-nums mt-0.5 ${count > 0 ? 'text-yellow-400' : 'text-white/10'}`}>
                  {count}
                </p>
                <p className={`text-[9px] ${count > 0 ? 'text-yellow-400/50' : 'text-white/10'}`}>回</p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
