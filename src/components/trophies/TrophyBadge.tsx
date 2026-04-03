import React from 'react';
import { Trophy } from '@/types';

interface TrophyBadgeProps {
  trophy: Omit<Trophy, 'id'>;
  size?: 'sm' | 'md' | 'lg';
  showDate?: boolean;
}

export const TrophyBadge: React.FC<TrophyBadgeProps> = ({
  trophy,
  size = 'md',
  showDate = false,
}) => {
  const sizes = {
    sm: { emoji: 'text-xl', name: 'text-xs', container: 'p-2' },
    md: { emoji: 'text-3xl', name: 'text-xs', container: 'p-3' },
    lg: { emoji: 'text-5xl', name: 'text-sm', container: 'p-4' },
  };

  const s = sizes[size];

  return (
    <div className={`flex flex-col items-center gap-1 ${s.container} bg-white/5 rounded-2xl border border-accent/20 hover:border-accent/40 transition-colors`}>
      <span className={s.emoji}>{trophy.emoji}</span>
      <p className={`${s.name} text-white/80 font-medium text-center leading-tight`}>
        {trophy.name}
      </p>
      {showDate && trophy.earnedAt && (
        <p className="text-[10px] text-white/40">
          {trophy.earnedAt.toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })}
        </p>
      )}
    </div>
  );
};
