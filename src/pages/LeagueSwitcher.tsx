import React, { useEffect, useState } from 'react';
import { Trophy, Plus, ChevronRight, LogOut } from 'lucide-react';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { db } from '@/firebase/config';
import { useLeagueStore } from '@/stores/useLeagueStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { Button } from '@/components/ui/Button';

interface LeagueEntry {
  id: string;
  name: string;
  description?: string;
  role: 'owner' | 'member';
}

interface LeagueSwitcherProps {
  onSelect: (leagueId: string) => Promise<void>;
  onCreateNew: () => void;
}

export const LeagueSwitcher: React.FC<LeagueSwitcherProps> = ({ onSelect, onCreateNew }) => {
  const { user, signOutUser } = useAuthStore();
  const [leagues, setLeagues] = useState<LeagueEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selecting, setSelecting] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    fetchLeagues();
  }, [user]);

  const fetchLeagues = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const found = new Map<string, LeagueEntry>();

      // オーナーとして持つリーグ
      const ownedSnap = await getDocs(
        query(collection(db, 'leagues'), where('ownerId', '==', user.uid))
      );
      for (const d of ownedSnap.docs) {
        found.set(d.id, {
          id: d.id,
          name: d.data().name,
          description: d.data().description,
          role: 'owner',
        });
      }

      // userLeagues から参加済みリーグ
      const userLeaguesSnap = await getDoc(doc(db, 'userLeagues', user.uid));
      if (userLeaguesSnap.exists()) {
        const joinedIds: string[] = userLeaguesSnap.data().leagueIds ?? [];
        for (const lid of joinedIds) {
          if (!found.has(lid)) {
            const leagueDoc = await getDoc(doc(db, 'leagues', lid));
            if (leagueDoc.exists()) {
              found.set(lid, {
                id: lid,
                name: leagueDoc.data().name,
                description: leagueDoc.data().description,
                role: 'member',
              });
            }
          }
        }
      }

      setLeagues(Array.from(found.values()));
    } catch (err) {
      console.error('fetchLeagues error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = async (leagueId: string) => {
    setSelecting(leagueId);
    try {
      await onSelect(leagueId);
    } finally {
      setSelecting(null);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col p-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm mx-auto space-y-6 pt-10"
      >
        {/* Header */}
        <div className="text-center space-y-2">
          <Trophy
            className="w-12 h-12 mx-auto text-accent"
            style={{ filter: 'drop-shadow(0 0 10px rgba(0,212,255,0.5))' }}
          />
          <h1 className="text-xl font-bold text-white">大会を選択</h1>
          <p className="text-white/40 text-sm">参加している大会を選んでください</p>
        </div>

        {/* League list */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-16 bg-white/5 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : leagues.length === 0 ? (
          <div className="text-center py-8 text-white/30 text-sm">
            大会がありません
          </div>
        ) : (
          <div className="space-y-2">
            {leagues.map((l) => (
              <button
                key={l.id}
                onClick={() => handleSelect(l.id)}
                disabled={!!selecting}
                className="w-full flex items-center gap-3 bg-bg-card border border-white/10 rounded-2xl px-4 py-3.5 text-left hover:border-accent/40 active:scale-[0.98] transition-all"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-sm truncate">{l.name}</p>
                  {l.description && (
                    <p className="text-white/40 text-xs truncate mt-0.5">{l.description}</p>
                  )}
                  <p className="text-xs text-white/20 mt-0.5">
                    {l.role === 'owner' ? 'オーナー' : 'メンバー'}
                  </p>
                </div>
                {selecting === l.id ? (
                  <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin flex-shrink-0" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-white/20 flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        )}

        {/* Create new */}
        <Button variant="gold" className="w-full" onClick={onCreateNew}>
          <Plus className="w-4 h-4 mr-1.5" />
          新しい大会を作成
        </Button>

        {/* Logout */}
        <button
          onClick={signOutUser}
          className="w-full flex items-center justify-center gap-1.5 text-white/30 text-sm py-2 hover:text-white/50 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          ログアウト
        </button>
      </motion.div>
    </div>
  );
};
