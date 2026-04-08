import React from 'react';
import { UnlockedTrophy } from '@/types';
import { TrophyBadge } from '@/components/trophies/TrophyBadge';
import { getTrophiesByRank, RANK_META, RANK_ORDER } from '@/utils/achievements';

interface TrophyShelfProps {
  unlockedTrophies: UnlockedTrophy[];
}

export const TrophyShelf: React.FC<TrophyShelfProps> = ({ unlockedTrophies }) => {
  const byRank = getTrophiesByRank();
  const unlockedMap = new Map(unlockedTrophies.map((t) => [t.trophyId, t]));
  const totalUnlocked = unlockedTrophies.length;
  const totalTrophies = Object.values(byRank).reduce((s, arr) => s + arr.length, 0);

  return (
    <div className="space-y-5">
      {/* 進捗サマリー */}
      <div
        className="flex items-center justify-between px-4 py-3 rounded-xl"
        style={{ background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.15)' }}
      >
        <p className="text-sm text-white/60">解除済み</p>
        <p className="font-bold" style={{ fontFamily: 'Rajdhani, sans-serif', color: '#00d4ff' }}>
          {totalUnlocked} / {totalTrophies}
        </p>
      </div>

      {/* ランク別セクション */}
      {RANK_ORDER.map((rank) => {
        const defs = byRank[rank];
        const meta = RANK_META[rank];
        const rankUnlocked = defs.filter((d) => unlockedMap.has(d.id)).length;

        return (
          <section key={rank}>
            {/* ランクヘッダー */}
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold tracking-wider" style={{ color: meta.color }}>
                {meta.label}
              </h3>
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                {rankUnlocked}/{defs.length}
              </span>
            </div>

            {/* トロフィーグリッド */}
            <div className="grid grid-cols-4 gap-2">
              {defs.map((def) => (
                <TrophyBadge
                  key={def.id}
                  definition={def}
                  unlocked={unlockedMap.get(def.id)}
                  size="sm"
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
};
