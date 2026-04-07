import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import {
  getRedirectResult,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { auth, db } from '@/firebase/config';
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

// ユーザーのリーグを検索・ロードする
function useLeagueInit(userId: string | undefined) {
  const { loadLeague, loadPlayers, loadSeasons } = useLeagueStore();
  const [status, setStatus] = useState<'loading' | 'found' | 'none'>('loading');

  useEffect(() => {
    if (!userId) {
      setStatus('none');
      return;
    }

    const findLeague = async () => {
      try {
        // オーナーとして所属するリーグを検索
        const ownedQuery = query(
          collection(db, 'leagues'),
          where('ownerId', '==', userId)
        );
        const ownedSnap = await getDocs(ownedQuery);

        if (!ownedSnap.empty) {
          const lid = ownedSnap.docs[0].id;
          localStorage.setItem('mahjong_league_id', lid);
          await loadLeague(lid);
          await Promise.all([loadPlayers(lid), loadSeasons(lid)]);
          setStatus('found');
          return;
        }

        // localStorageから以前参加したリーグIDを復元
        const stored = localStorage.getItem('mahjong_league_id');
        if (stored) {
          try {
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
    await loadLeague(lid);
    await Promise.all([loadPlayers(lid), loadSeasons(lid)]);
    setStatus('found');
  };

  return { status, handleLeagueCreated };
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
  const { user, loading } = useAuthStore();

  useEffect(() => {
    const init = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
          console.log('リダイレクトログイン成功:', result.user.email);
          useAuthStore.getState().setUser(result.user);
        }
      } catch (error: any) {
        console.error('リダイレクトエラー:', error.code, error.message);
      }
    };

    init();

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('認証状態変化:', user?.email ?? 'ログアウト');
      useAuthStore.getState().setUser(user);
    });

    return () => unsubscribe();
  }, []);

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
          element={user ? <AuthenticatedApp /> : <Login />}
        />
        <Route path="/invite/:code" element={<Invite />} />
      </Routes>
    </BrowserRouter>
  );
}
