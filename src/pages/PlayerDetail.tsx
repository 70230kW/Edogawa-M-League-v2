import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Trophy, Swords, ChevronLeft, Link2, Link2Off, Camera } from 'lucide-react';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/firebase/config';
import { useLeagueStore } from '@/stores/useLeagueStore';
import { useGameStore } from '@/stores/useGameStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { useRealtimeGames, useRealtimeStandings } from '@/hooks/useRealtime';
import { GameCard } from '@/components/games/GameCard';
import { TrophyShelf } from '@/components/players/TrophyShelf';
import { CropModal } from '@/components/players/CropModal';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { Toast, useToast } from '@/components/ui/Toast';
import { formatPoint } from '@/utils/pointCalc';
import { usePlayerTrophies } from '@/hooks/useAchievements';

const GoogleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

export const PlayerDetail: React.FC = () => {
  const { playerId } = useParams<{ playerId: string }>();
  const { players, standings, league, currentSeason, linkPlayerToUser, unlinkPlayer, updatePlayer } = useLeagueStore();
  const { games } = useGameStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const { toast, showToast, hideToast } = useToast();
  const [linkLoading, setLinkLoading] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const player = players.find((p) => p.id === playerId);
  const standing = standings.find((s) => s.playerId === playerId);
  const playerGames = games.filter((g) =>
    g.players.some((p) => p.playerId === playerId)
  );

  const leagueId = league?.id ?? '';
  const seasonId = currentSeason?.id ?? '';
  useRealtimeGames(leagueId, seasonId);
  useRealtimeStandings(leagueId, seasonId);
  const { trophies, loading: trophiesLoading } = usePlayerTrophies(leagueId, playerId ?? '', seasonId);

  const isLinked = !!player?.linkedUserId;
  const isLinkedToMe = player?.linkedUserId === user?.uid;
  const canLink = !!user && !isLinked;

  const handleLink = async () => {
    if (!user || !playerId || !leagueId) return;
    setLinkLoading(true);
    setLinkError(null);
    try {
      await linkPlayerToUser(leagueId, playerId, user.uid, user.email ?? '');
    } catch (err: any) {
      setLinkError(err.message ?? '連携に失敗しました');
    } finally {
      setLinkLoading(false);
    }
  };

  const handleUnlink = async () => {
    if (!playerId || !leagueId) return;
    setLinkLoading(true);
    setLinkError(null);
    try {
      await unlinkPlayer(leagueId, playerId);
    } catch (err: any) {
      setLinkError(err.message ?? '解除に失敗しました');
    } finally {
      setLinkLoading(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (fileInputRef.current) fileInputRef.current.value = '';
    const reader = new FileReader();
    reader.onload = () => setCropSrc(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleCropDone = async (blob: Blob) => {
    if (!playerId || !leagueId) return;
    setCropSrc(null);
    setAvatarUploading(true);
    try {
      const sRef = storageRef(storage, `leagues/${leagueId}/players/${playerId}/avatar.jpg`);
      await uploadBytes(sRef, blob, { contentType: 'image/jpeg' });
      const url = await getDownloadURL(sRef);
      await updatePlayer(leagueId, playerId, { avatarUrl: url });
      showToast('写真を更新しました', 'success');
    } catch (err) {
      console.error('Avatar upload failed:', err);
      showToast('写真のアップロードに失敗しました', 'error');
    } finally {
      setAvatarUploading(false);
    }
  };

  if (!player) {
    return (
      <div className="p-4 text-center py-16" style={{ color: 'rgba(255,255,255,0.3)' }}>
        <User className="w-10 h-10 mx-auto mb-3 opacity-30" />
        <p>プレイヤーが見つかりません</p>
      </div>
    );
  }

  const statItems = [
    { label: '総合ポイント', value: standing ? formatPoint(standing.totalPoint) : '0.0', highlight: true },
    { label: '対局数',       value: `${standing?.totalGames ?? 0}` },
    { label: '平均順位',     value: standing ? `${standing.avgRank.toFixed(2)}位` : '-' },
    { label: '1位率',        value: standing ? `${standing.top1Rate.toFixed(1)}%` : '-' },
    { label: 'トップ2率',   value: standing ? `${standing.top2Rate.toFixed(1)}%` : '-' },
    { label: 'ラス率',       value: standing ? `${standing.lastRate.toFixed(1)}%` : '-' },
  ];

  return (
    <div className="p-4 space-y-6">
      <Toast message={toast.message} type={toast.type} isVisible={toast.visible} onClose={hideToast} />

      {cropSrc && (
        <CropModal
          imageSrc={cropSrc}
          onCrop={handleCropDone}
          onCancel={() => setCropSrc(null)}
        />
      )}

      {/* 戻るボタン */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-sm transition-colors"
        style={{ color: 'rgba(0,212,255,0.7)' }}
      >
        <ChevronLeft className="w-4 h-4" />戻る
      </button>

      {/* プレイヤーヘッダー */}
      <div className="flex items-center gap-4">
        {/* Avatar with camera button */}
        <div className="relative flex-shrink-0">
          {player.avatarUrl ? (
            <img
              src={player.avatarUrl}
              alt={player.name}
              className="w-16 h-16 rounded-full object-cover"
              style={{ boxShadow: `0 0 20px ${player.color}66` }}
            />
          ) : (
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-3xl font-bold text-white"
              style={{
                backgroundColor: player.color,
                boxShadow: `0 0 20px ${player.color}66`,
              }}
            >
              {player.name[0]}
            </div>
          )}
          {/* Camera overlay button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={avatarUploading}
            className="absolute bottom-0 right-0 w-6 h-6 rounded-full flex items-center justify-center transition-colors"
            style={{ background: 'rgba(0,212,255,0.9)', boxShadow: '0 2px 6px rgba(0,0,0,0.5)' }}
          >
            {avatarUploading ? (
              <span className="w-3 h-3 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            ) : (
              <Camera className="w-3.5 h-3.5 text-black" />
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>
        <div>
          <h1
            className="text-2xl font-bold text-white"
            style={{ fontFamily: 'Rajdhani, sans-serif' }}
          >
            {player.name}
            {isLinkedToMe && (
              <span className="ml-2 text-sm font-normal text-accent">（自分）</span>
            )}
          </h1>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>
            {playerGames.length}対局参加
          </p>
        </div>
      </div>

      {/* 成績グリッド */}
      <div className="grid grid-cols-3 gap-2">
        {statItems.map((item) => (
          <div
            key={item.label}
            className="rounded-xl p-3 text-center"
            style={{
              background: 'rgba(0,5,20,0.8)',
              border: item.highlight
                ? '1px solid rgba(0,212,255,0.3)'
                : '1px solid rgba(255,255,255,0.07)',
            }}
          >
            <p className="text-[10px] mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
              {item.label}
            </p>
            <p
              className={`font-bold ${item.highlight ? 'text-lg' : 'text-white'}`}
              style={
                item.highlight
                  ? { fontFamily: 'Rajdhani, sans-serif', color: '#00d4ff' }
                  : {}
              }
            >
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {/* Googleアカウント連携 */}
      <section>
        <h2
          className="text-xs font-bold uppercase tracking-wider mb-3"
          style={{ color: 'rgba(255,255,255,0.35)' }}
        >
          <Link2 className="w-3.5 h-3.5 inline mr-1" />アカウント連携
        </h2>
        <div
          className="rounded-xl p-4 space-y-3"
          style={{ background: 'rgba(0,5,20,0.8)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          {isLinked ? (
            <>
              <div className="flex items-center gap-2">
                <GoogleIcon className="w-5 h-5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-white/40 mb-0.5">連携済みアカウント</p>
                  <p className="text-sm text-white/80 font-medium">{player.linkedUserEmail}</p>
                </div>
              </div>
              {isLinkedToMe && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleUnlink}
                  loading={linkLoading}
                  className="w-full border border-red-500/20 text-red-400/70 hover:border-red-500/40"
                >
                  <Link2Off className="w-3.5 h-3.5 mr-1.5" />
                  連携を解除する
                </Button>
              )}
              {!isLinkedToMe && (
                <p className="text-xs text-white/30">別のアカウントで連携されています</p>
              )}
            </>
          ) : (
            <>
              <p className="text-sm text-white/50">
                現在ログイン中のGoogleアカウントをこのメンバーに連携します。
              </p>
              {user ? (
                <div className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2">
                  <GoogleIcon className="w-4 h-4 flex-shrink-0" />
                  <p className="text-sm text-white/60">{user.email}</p>
                </div>
              ) : (
                <p className="text-xs text-white/30">ログインが必要です</p>
              )}
              <Button
                variant="primary"
                size="sm"
                onClick={handleLink}
                loading={linkLoading}
                disabled={!canLink}
                className="w-full"
              >
                <Link2 className="w-3.5 h-3.5 mr-1.5" />
                Googleアカウントと連携する
              </Button>
            </>
          )}
          {linkError && (
            <p className="text-xs text-red-400">{linkError}</p>
          )}
        </div>
      </section>

      {/* トロフィー棚 */}
      <section>
        <h2
          className="text-xs font-bold uppercase tracking-wider mb-3"
          style={{ color: 'rgba(255,255,255,0.35)' }}
        >
          <Trophy className="w-3.5 h-3.5 inline mr-1" />トロフィー棚
        </h2>
        {trophiesLoading ? (
          <Skeleton className="h-32" />
        ) : (
          <TrophyShelf unlockedTrophies={trophies} />
        )}
      </section>

      {/* 対局履歴 */}
      <section>
        <h2
          className="text-xs font-bold uppercase tracking-wider mb-3"
          style={{ color: 'rgba(255,255,255,0.35)' }}
        >
          <Swords className="w-3.5 h-3.5 inline mr-1" />対局履歴
        </h2>
        {playerGames.length === 0 ? (
          <p className="text-sm text-center py-4" style={{ color: 'rgba(255,255,255,0.25)' }}>
            対局記録なし
          </p>
        ) : (
          <div className="space-y-3">
            {playerGames.slice(0, 20).map((g) => (
              <GameCard key={g.id} game={g} players={players} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
