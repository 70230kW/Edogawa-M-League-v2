import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import {
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import { useAuthStore } from '@/stores/useAuthStore';
import { useLeagueStore } from '@/stores/useLeagueStore';
import { AppLayout } from '@/components/layout/AppLayout';
import { Home } from '@/pages/Home';
import { Games } from '@/pages/Games';
import { Timeline } from '@/pages/Timeline';
import { Stats } from '@/pages/Stats';
import { Players } from '@/pages/Players';
import { PlayerDetail } from '@/pages/PlayerDetail';
import { Settings } from '@/pages/Settings';
import { Invite } from '@/pages/Invite';
import { Rules } from '@/pages/Rules';
import { Login } from '@/pages/Login';
import { CreateLeague } from '@/pages/CreateLeague';

// Load the user's league (the first league they own or are a member of)
function useLeagueInit(userId: string | undefined) {
  const { loadLeague, loadPlayers, loadSeasons, setLeague } = useLeagueStore();
  const [status, setStatus] = useState<'loading' | 'found' | 'none'>('loading');
  const [leagueId, setLeagueId] = useState('');

  useEffect(() => {
    if (!userId) {
      setStatus('none');
      return;
    }

    // Find leagues where the user is a member
    const findLeague = async () => {
      try {
        // Query leagues where user is a member (check members subcollection)
        // We'll search the leagues the user has access to via members docs
        const membersQuery = query(
          collection(db, 'leagues'),
          // We can't easily query across subcollections here
          // Instead, listen for member docs via collectionGroup (requires index)
          // Simple approach: get leagues the user created
        );

        // Simple approach: find leagues where ownerId == userId
        const ownedQuery = query(
          collection(db, 'leagues'),
          where('ownerId', '==', userId)
        );
        const ownedSnap = await getDocs(ownedQuery);

        if (!ownedSnap.empty) {
          const lid = ownedSnap.docs[0].id;
          setLeagueId(lid);
          await loadLeague(lid);
          await Promise.all([loadPlayers(lid), loadSeasons(lid)]);
          setStatus('found');
          return;
        }

        // Check if user is a member of any league via collectionGroup
        // This requires a Firestore index - for simplicity store leagueId in localStorage
        const stored = localStorage.getItem('mahjong_league_id');
        if (stored) {
          try {
            setLeagueId(stored);
            await loadLeague(stored);
            await Promise.all([loadPlayers(stored), loadSeasons(stored)]);
            setStatus('found');
            return;
          } catch {
            localStorage.removeItem('mahjong_league_id');
          }
        }

        setStatus('none');
      } catch (err) {
        console.error('League init error:', err);
        setStatus('none');
      }
    };

    findLeague();
  }, [userId]);

  const handleLeagueCreated = async (lid: string) => {
    localStorage.setItem('mahjong_league_id', lid);
    setLeagueId(lid);
    await loadLeague(lid);
    await Promise.all([loadPlayers(lid), loadSeasons(lid)]);
    setStatus('found');
  };

  return { status, leagueId, handleLeagueCreated };
}

function AuthenticatedApp() {
  const { user } = useAuthStore();
  const { status, handleLeagueCreated } = useLeagueInit(user?.uid);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg">
        <div className="text-center">
          <p className="text-5xl mb-4 animate-pulse">🀄</p>
          <p className="text-accent text-lg font-bold">MahjongLeague</p>
          <p className="text-white/40 text-sm mt-2">データを読み込み中…</p>
        </div>
      </div>
    );
  }

  if (status === 'none') {
    return <CreateLeague onCreated={handleLeagueCreated} />;
  }

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/games" element={<Games />} />
        <Route path="/timeline" element={<Timeline />} />
        <Route path="/stats" element={<Stats />} />
        <Route path="/players" element={<Players />} />
        <Route path="/players/:playerId" element={<PlayerDetail />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/rules" element={<Rules />} />
      </Route>
      <Route path="/invite/:code" element={<Invite />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  const { initialize, user, loading } = useAuthStore();

  useEffect(() => {
    return initialize();
  }, [initialize]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg">
        <p className="text-5xl animate-pulse">🀄</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="*"
          element={
            user ? <AuthenticatedApp /> : <Login />
          }
        />
        <Route path="/invite/:code" element={<Invite />} />
      </Routes>
    </BrowserRouter>
  );
}
