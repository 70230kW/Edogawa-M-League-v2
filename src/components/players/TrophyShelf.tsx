import React from 'react';
import { Trophy, TrophyId } from '@/types';
import { TrophyBadge } from '@/components/trophies/TrophyBadge';
import { TROPHY_DEFINITIONS } from '@/utils/achievements';

interface TrophyShelfProps {
  earnedIds: TrophyId[];
}

export const TrophyShelf: React.FC<TrophyShelfProps> = ({ earnedIds }) => {
  if (earnedIds.length === 0) {
    return (
      <div className="text-center py-6 text-white/30 text-sm">
        まだトロフィーがありません
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-2">
      {earnedIds.map((id) => {
        const def = TROPHY_DEFINITIONS[id];
        return (
          <TrophyBadge
            key={id}
            trophy={def}
            size="md"
          />
        );
      })}
    </div>
  );
};
