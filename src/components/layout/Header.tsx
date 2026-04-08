import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Grid2X2 } from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import { useLeagueStore } from '@/stores/useLeagueStore';

export const Header: React.FC = () => {
  const { user } = useAuthStore();
  const { league } = useLeagueStore();

  return (
    <header
      className="fixed top-0 left-0 right-0 z-40 backdrop-blur-md border-b"
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        backgroundColor: 'rgba(0, 0, 0, 0.92)',
        borderBottomColor: 'rgba(0, 212, 255, 0.25)',
        boxShadow: '0 1px 20px rgba(0, 212, 255, 0.08)',
      }}
    >
      <div className="flex items-center justify-between px-4 h-14">
        <Link to="/" className="flex items-center gap-2.5">
          <Grid2X2
            className="w-6 h-6"
            style={{ color: '#00d4ff', filter: 'drop-shadow(0 0 6px rgba(0,212,255,0.6))' }}
          />
          <div>
            <p
              className="font-bold text-sm leading-tight tracking-wider"
              style={{
                fontFamily: 'Rajdhani, sans-serif',
                color: '#00d4ff',
                textShadow: '0 0 10px rgba(0, 212, 255, 0.5)',
              }}
            >
              {league?.name ?? 'MAHJONG LEAGUE'}
            </p>
          </div>
        </Link>

        {/* ヘッダー中央のデコレーションライン */}
        <div
          className="absolute left-1/2 -translate-x-1/2 w-24 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(0,212,255,0.4), transparent)' }}
        />

        <div className="flex items-center gap-2">
          <Link
            to="/rules"
            className="p-2 text-white/40 hover:text-accent transition-colors"
          >
            <BookOpen className="w-4.5 h-4.5 w-[18px] h-[18px]" />
          </Link>
          <Link to="/settings" className="p-1.5">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName ?? ''}
                className="w-8 h-8 rounded-full"
                style={{ border: '1px solid rgba(0, 212, 255, 0.4)' }}
              />
            ) : (
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-accent"
                style={{ background: 'rgba(0, 212, 255, 0.1)', border: '1px solid rgba(0, 212, 255, 0.3)' }}
              >
                {user?.displayName?.[0] ?? '?'}
              </div>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
};
