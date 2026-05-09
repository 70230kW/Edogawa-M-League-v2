import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { BottomNav } from './BottomNav';
import { AchievementToast } from '@/components/trophies/AchievementToast';
import { ErrorBoundary } from './ErrorBoundary';

export const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-bg text-white">
      <Header />
      <main
        className="pt-14 mx-auto max-w-2xl"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 5rem)' }}
      >
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
      <BottomNav />
      <AchievementToast />
    </div>
  );
};
