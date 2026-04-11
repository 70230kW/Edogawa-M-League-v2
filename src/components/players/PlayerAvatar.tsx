import React from 'react';
import { Player } from '@/types';

interface PlayerAvatarProps {
  player: Player;
  size?: number;
  className?: string;
}

export const PlayerAvatar: React.FC<PlayerAvatarProps> = ({ player, size = 40, className = '' }) => {
  if (player.avatarUrl) {
    return (
      <img
        src={player.avatarUrl}
        alt={player.name}
        className={`rounded-full object-cover flex-shrink-0 ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className={`rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: player.color,
        fontSize: Math.round(size * 0.38),
      }}
    >
      {player.name[0]}
    </div>
  );
};
