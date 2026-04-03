import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';
import { useLeagueStore } from '@/stores/useLeagueStore';

export const Header: React.FC = () => {
  const { user } = useAuthStore();
  const { league } = useLeagueStore();

  return (
    <header
      className="fixed top-0 left-0 right-0 z-40 bg-bg/80 backdrop-blur-md border-b border-white/10"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="flex items-center justify-between px-4 h-14">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl">🀄</span>
          <div>
            <p className="text-accent font-bold text-sm leading-tight">
              {league?.name ?? 'MahjongLeague'}
            </p>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <Link to="/rules" className="text-white/50 hover:text-white p-2 text-sm">
            📖
          </Link>
          <Link to="/settings" className="p-2">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName ?? ''}
                className="w-8 h-8 rounded-full border border-white/20"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-sm">
                {user?.displayName?.[0] ?? '?'}
              </div>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
};
