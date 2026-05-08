import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Trophy, Users } from 'lucide-react';
import { doc, getDoc, updateDoc, arrayUnion, setDoc, serverTimestamp, collection, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { useAuthStore } from '@/stores/useAuthStore';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';

export const Invite: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const { user, signInWithGoogle } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');
  const [leagueId, setLeagueId] = useState('');
  const [leagueName, setLeagueName] = useState('');
  const [inviteDocId, setInviteDocId] = useState('');

  useEffect(() => {
    findInvite();
  }, [code]);

  const findInvite = async () => {
    if (!code) return;
    setLoading(true);
    try {
      // Search all leagues for this invite code - simplified: we store leagueId in invite
      // The invite URL format: /invite/{leagueId}_{code} or we search
      // For simplicity, we'll use the code as the doc ID
      // Actually we need to search - let's store the leagueId in the URL as well
      // Format: the invite doc has its code stored, find by querying
      // Since Firestore doesn't allow cross-collection queries easily without knowing leagueId,
      // we'll embed leagueId in the code: format "LEAGUEID_CODE"
      const parts = code.split('_');
      if (parts.length < 2) {
        setError('無効な招待コードです');
        return;
      }
      const lid = parts[0];
      const inviteCode = parts.slice(1).join('_');

      const invitesRef = doc(db, 'leagues', lid, 'invites', inviteCode);
      const inviteSnap = await getDoc(invitesRef);

      if (!inviteSnap.exists()) {
        setError('招待コードが見つかりません');
        return;
      }

      const inviteData = inviteSnap.data();
      const now = new Date();
      if (inviteData.expiresAt?.toDate() < now) {
        setError('この招待コードは期限切れです');
        return;
      }

      const leagueSnap = await getDoc(doc(db, 'leagues', lid));
      if (!leagueSnap.exists()) {
        setError('リーグが見つかりません');
        return;
      }

      setLeagueId(lid);
      setLeagueName(leagueSnap.data().name);
      setInviteDocId(inviteCode);
    } catch (err) {
      setError('招待コードの確認中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!user || !leagueId) return;
    setJoining(true);
    try {
      await setDoc(doc(db, 'leagues', leagueId, 'members', user.uid), {
        uid: user.uid,
        joinedAt: serverTimestamp(),
        role: 'member',
      });
      await updateDoc(doc(db, 'leagues', leagueId, 'invites', inviteDocId), {
        usedBy: arrayUnion(user.uid),
      });
      // userLeagues にリーグIDを追記
      const userLeaguesRef = doc(db, 'userLeagues', user.uid);
      const userLeaguesSnap = await getDoc(userLeaguesRef);
      const existing: string[] = userLeaguesSnap.exists() ? (userLeaguesSnap.data().leagueIds ?? []) : [];
      if (!existing.includes(leagueId)) {
        await setDoc(userLeaguesRef, { leagueIds: [...existing, leagueId] });
      }
      localStorage.setItem('mahjong_league_id', leagueId);
      navigate('/');
    } catch (err) {
      setError('参加に失敗しました');
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <p className="text-white/40">確認中…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm text-center space-y-6"
      >
        <Trophy className="w-14 h-14 mx-auto text-accent" style={{ filter: 'drop-shadow(0 0 12px rgba(0,212,255,0.5))' }} />
        <h1 className="text-2xl font-bold text-white">MahjongLeague</h1>

        {error ? (
          <div className="bg-danger/10 border border-danger/30 rounded-2xl p-4">
            <p className="text-danger text-sm">{error}</p>
          </div>
        ) : (
          <>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-2">
              <p className="text-white/50 text-sm">リーグへの招待</p>
              <p className="text-2xl font-bold text-accent">{leagueName}</p>
            </div>

            {user ? (
              <Button variant="gold" size="lg" className="w-full" onClick={handleJoin} loading={joining}>
                <Users className="w-4 h-4 mr-1.5" />リーグに参加する
              </Button>
            ) : (
              <div className="space-y-3">
                <p className="text-white/50 text-sm">
                  参加するにはGoogleアカウントが必要です
                </p>
                <Button
                  variant="gold"
                  size="lg"
                  className="w-full"
                  onClick={signInWithGoogle}
                >
                  Googleでログインして参加
                </Button>
              </div>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
};
