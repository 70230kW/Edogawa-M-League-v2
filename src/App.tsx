import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import {
  getRedirectResult,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { Trophy } from 'lucide-react';
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
import { Trophies } from '@/pages/Trophies';
import { Ranking } from '@/pages/Ranking';
import { CreateLeague } from '@/pages/CreateLeague';
import { LeagueSwitcher } from '@/pages/LeagueSwitcher';

type InitStatus = 'loading' | 'found' | 'select' | 'create';

function useLeagueInit(userId: string | undefined) {
  const { loadLeague, loadPlayers, loadSeasons, league } = useLeagueStore();
  const [status, setStatus] = useState<InitStatus>('loading');

  // league が clearLeague() でリセットされたら選択画面に戻す
  useEffect(() => {
    if (league?.id) {
      setStatus('found');
    }
  }, [league?.id]);

  useEffect(() => {
    if (!userId) {
      setStatus('create');
      return;
    }
    if (league?.id) {
      setStatus('found');
      return;
    }
    init(userId);
  }, [userId]);

  const init = async (uid: string) => {
    setStatus('loading');
    try {
      // 1. localStorage に保存済みのリーグを優先ロード
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

      // 2. 全所有リーグを取得
      const ownedSnap = await getDocs(
        query(collection(db, 'leagues'), where('ownerId', '==', uid))
      );
      const leagueIds = new Set<string>(ownedSnap.docs.map((d) => d.id));

      // 3. userLeagues から参加済みリーグを取得
      const userLeaguesSnap = await getDoc(doc(db, 'userLeagues', uid));
      if (userLeaguesSnap.exists()) {
        for (const lid of (userLeaguesSnap.data().leagueIds ?? []) as string[]) {
          leagueIds.add(lid);
        }
      }

      if (leagueIds.size === 0) {
        setStatus('create');
      } else if (leagueIds.size === 1) {
        const lid = [...leagueIds][0];
        localStorage.setItem('mahjong_league_id', lid);
        await loadLeague(lid);
        await Promise.all([loadPlayers(lid), loadSeasons(lid)]);
        setStatus('found');
      } else {
        setStatus('select');
      }
    } catch (err) {
      console.error('League init error:', err);
      setStatus('create');
    }
  };

  const handleLeagueSelected = async (lid: string) => {
    localStorage.setItem('mahjong_league_id', lid);
    await loadLeague(lid);
    await Promise.all([loadPlayers(lid), loadSeasons(lid)]);
    setStatus('found');
  };

  const handleLeagueCreated = async (lid: string) => {
    localStorage.setItem('mahjong_league_id', lid);
    await loadLeague(lid);
    await Promise.all([loadPlayers(lid), loadSeasons(lid)]);
    setStatus('found');
  };

  const goToSwitcher = () => setStatus('select');
  const goToCreate = () => setStatus('create');

  return { status, handleLeagueSelected, handleLeagueCreated, goToSwitcher, goToCreate };
}

function AuthenticatedApp() {
  const { user } = useAuthStore();
  const { status, handleLeagueSelected, handleLeagueCreated, goToSwitcher, goToCreate } =
    useLeagueInit(user?.uid);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg">
        <div className="text-center">
          <Trophy className="w-12 h-12 text-accent mb-4 animate-pulse" />
          <p className="text-accent text-lg font-bold">MahjongLeague</p>
          <p className="text-white/40 text-sm mt-2">データを読み込み中…</p>
        </div>
      </div>
    );
  }

  if (status === 'select') {
    return (
      <LeagueSwitcher
        onSelect={handleLeagueSelected}
        onCreateNew={goToCreate}
      />
    );
  }

  if (status === 'create') {
    return (
      <CreateLeague
        onCreated={handleLeagueCreated}
        onBack={goToSwitcher}
      />
    );
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
        <Route path="/trophies" element={<Trophies />} />
        <Route path="/ranking" element={<Ranking />} />
        <Route path="/settings" element={<Settings onSwitchLeague={goToSwitcher} />} />
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
          useAuthStore.getState().setUser(result.user);
        }
      } catch (error: any) {
        console.error('リダイレクトエラー:', error.code, error.message);
      }
    };

    init();

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      useAuthStore.getState().setUser(user);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg">
        <Trophy className="w-12 h-12 text-accent animate-pulse" />
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
