import React, { useState } from 'react';
import { Layers, Share2, Calendar, Settings2, Pencil, Trash2, RefreshCw, FlaskConical } from 'lucide-react';
import { useLeagueStore } from '@/stores/useLeagueStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { useTimelineStore } from '@/stores/useTimelineStore';
import { useGameStore } from '@/stores/useGameStore';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { InviteModal } from '@/components/league/InviteModal';
import { LeagueSettings } from '@/types';
import { M_LEAGUE_SETTINGS } from '@/utils/pointCalc';
import { todayString } from '@/utils/dateUtils';
import { Toast, useToast } from '@/components/ui/Toast';
import { syncAllTrophiesForSeason } from '@/utils/achievementService';
import { generateDemoData } from '@/utils/demoData';

interface SettingsProps {
  onSwitchLeague?: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ onSwitchLeague }) => {
  const { league, seasons, currentSeason, players, updateLeagueSettings, updateLeagueName, createSeason, finishSeason, deleteSeason, clearLeague } =
    useLeagueStore();
  const { user, signOutUser } = useAuthStore();
  const { clearAllPosts } = useTimelineStore();
  const { clearAllGames } = useGameStore();
  const { toast, showToast, hideToast } = useToast();
  const [showInvite, setShowInvite] = useState(false);
  const [clearingTL, setClearingTL] = useState(false);
  const [confirmClearTL, setConfirmClearTL] = useState(false);
  const [clearingGames, setClearingGames] = useState(false);
  const [confirmClearGames, setConfirmClearGames] = useState(false);
  const [syncingTrophies, setSyncingTrophies] = useState(false);
  const [generatingDemo, setGeneratingDemo] = useState(false);
  const [confirmDemo, setConfirmDemo] = useState(false);
  const [showNewSeason, setShowNewSeason] = useState(false);
  const [showEditLeague, setShowEditLeague] = useState(false);
  const [editLeagueName, setEditLeagueName] = useState('');
  const [editLeagueDesc, setEditLeagueDesc] = useState('');
  const [seasonName, setSeasonName] = useState('');
  const [loading, setLoading] = useState(false);
  const [deletingSeasonId, setDeletingSeasonId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const [settings, setSettings] = useState<LeagueSettings>(
    league?.settings ?? M_LEAGUE_SETTINGS
  );

  const handleOpenEditLeague = () => {
    setEditLeagueName(league?.name ?? '');
    setEditLeagueDesc(league?.description ?? '');
    setShowEditLeague(true);
  };

  const handleSaveLeagueName = async () => {
    if (!league || !editLeagueName.trim()) return;
    setLoading(true);
    try {
      await updateLeagueName(league.id, editLeagueName.trim(), editLeagueDesc.trim());
      setShowEditLeague(false);
      showToast('リーグ名を更新しました', 'success');
    } catch {
      showToast('更新に失敗しました', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!league) return;
    setLoading(true);
    try {
      await updateLeagueSettings(league.id, settings);
      showToast('設定を保存しました', 'success');
    } catch {
      showToast('保存に失敗しました', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResetToMLeague = () => {
    setSettings(M_LEAGUE_SETTINGS);
  };

  const handleCreateSeason = async () => {
    if (!league || !seasonName.trim()) return;
    setLoading(true);
    try {
      await createSeason(league.id, seasonName.trim(), todayString());
      setSeasonName('');
      setShowNewSeason(false);
      showToast('シーズンを作成しました', 'success');
    } finally {
      setLoading(false);
    }
  };

  const handleFinishSeason = async (seasonId: string) => {
    if (!league) return;
    await finishSeason(league.id, seasonId, todayString());
    showToast('シーズンを終了しました', 'info');
  };

  const handleDeleteSeason = async (seasonId: string) => {
    if (!league) return;
    setDeletingSeasonId(seasonId);
    try {
      await deleteSeason(league.id, seasonId);
      setConfirmDeleteId(null);
      showToast('シーズンを削除しました', 'info');
    } catch {
      showToast('削除に失敗しました', 'error');
    } finally {
      setDeletingSeasonId(null);
    }
  };

  const handleSwitchLeague = () => {
    clearLeague();
    localStorage.removeItem('mahjong_league_id');
    onSwitchLeague?.();
  };

  return (
    <div className="p-4 space-y-6">
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.visible}
        onClose={hideToast}
      />

      <h1 className="text-xl font-bold text-white">設定</h1>

      {/* User info */}
      <section className="bg-bg-card border border-white/10 rounded-2xl p-4 flex items-center gap-4">
        {user?.photoURL ? (
          <img src={user.photoURL} alt="" className="w-12 h-12 rounded-full" />
        ) : (
          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white text-xl font-bold">
            {user?.displayName?.[0] ?? '?'}
          </div>
        )}
        <div className="flex-1">
          <p className="font-bold text-white">{user?.displayName}</p>
          <p className="text-xs text-white/40">{user?.email}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={signOutUser}>
          ログアウト
        </Button>
      </section>

      {/* League info */}
      {league && (
        <section>
          <h2 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" />
            リーグ情報
          </h2>
          <div className="bg-bg-card border border-white/10 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <p className="text-white font-bold">{league.name}</p>
              <button
                onClick={handleOpenEditLeague}
                className="p-1.5 rounded-lg text-white/30 hover:text-accent hover:bg-accent/10 transition-colors flex-shrink-0"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            </div>
            {league.description && (
              <p className="text-white/50 text-sm">{league.description}</p>
            )}
            <div className="flex gap-2 mt-2 flex-wrap">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowInvite(true)}
              >
                <Share2 className="w-3.5 h-3.5 mr-1.5" />招待コードを発行
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSwitchLeague}
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" />大会を切り替え
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Seasons */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold text-white/40 uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            シーズン管理
          </h2>
          <Button variant="secondary" size="sm" onClick={() => setShowNewSeason(true)}>
            ＋ 新シーズン
          </Button>
        </div>
        <div className="space-y-2">
          {seasons.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between bg-bg-card border border-white/10 rounded-xl px-4 py-3"
            >
              <div>
                <p className="text-white font-medium text-sm">{s.name}</p>
                <p className="text-xs text-white/40">
                  {s.startDate}{s.endDate ? ` 〜 ${s.endDate}` : ''}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full border ${
                    s.status === 'active'
                      ? 'border-green-500/40 text-green-400 bg-green-900/20'
                      : 'border-white/10 text-white/30'
                  }`}
                >
                  {s.status === 'active' ? '進行中' : '終了'}
                </span>
                {s.status === 'active' && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleFinishSeason(s.id)}
                  >
                    終了
                  </Button>
                )}
                {confirmDeleteId === s.id ? (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleDeleteSeason(s.id)}
                      disabled={deletingSeasonId === s.id}
                      className="text-xs px-2 py-1 rounded-lg bg-danger/20 text-danger border border-danger/30 hover:bg-danger/30 transition-colors"
                    >
                      {deletingSeasonId === s.id ? '…' : '確認'}
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(null)}
                      className="text-xs px-2 py-1 rounded-lg text-white/30 hover:text-white/50 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDeleteId(s.id)}
                    className="p-1.5 rounded-lg text-white/20 hover:text-danger hover:bg-danger/10 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
          {seasons.length === 0 && (
            <p className="text-white/30 text-sm text-center py-4">
              シーズンがありません
            </p>
          )}
        </div>
      </section>

      {/* Rule settings */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold text-white/40 uppercase tracking-wider flex items-center gap-1.5">
            <Settings2 className="w-3.5 h-3.5" />
            ルール設定
          </h2>
          <Button variant="secondary" size="sm" onClick={handleResetToMLeague}>
            Mリーグ設定に戻す
          </Button>
        </div>
        <div className="bg-bg-card border border-white/10 rounded-2xl p-4 space-y-4">
          {[
            { label: '原点', key: 'startPoints' as const, step: 100 },
            { label: '返し点', key: 'returnPoints' as const, step: 100 },
            { label: 'チョンボペナルティ (pt)', key: 'chonboPenalty' as const, step: 5 },
          ].map(({ label, key, step }) => (
            <div key={key} className="flex items-center justify-between gap-4">
              <label className="text-sm text-white/70 flex-1">{label}</label>
              <input
                type="number"
                value={settings[key]}
                step={step}
                onChange={(e) =>
                  setSettings({ ...settings, [key]: Number(e.target.value) })
                }
                className="w-28 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-right text-sm focus:outline-none focus:border-accent"
              />
            </div>
          ))}

          <div className="flex items-center justify-between">
            <label className="text-sm text-white/70">赤ドラあり</label>
            <button
              onClick={() => setSettings({ ...settings, hasRedDora: !settings.hasRedDora })}
              className={`w-12 h-6 rounded-full border transition-colors ${
                settings.hasRedDora
                  ? 'bg-accent border-accent'
                  : 'bg-white/10 border-white/20'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white mx-1 transition-transform ${
                  settings.hasRedDora ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm text-white/70">裏ドラあり</label>
            <button
              onClick={() => setSettings({ ...settings, hasUraDora: !settings.hasUraDora })}
              className={`w-12 h-6 rounded-full border transition-colors ${
                settings.hasUraDora
                  ? 'bg-accent border-accent'
                  : 'bg-white/10 border-white/20'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white mx-1 transition-transform ${
                  settings.hasUraDora ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <Button
            variant="gold"
            className="w-full"
            onClick={handleSaveSettings}
            loading={loading}
          >
            設定を保存
          </Button>
        </div>
      </section>

      {/* Invite modal */}
      {league && (
        <InviteModal
          isOpen={showInvite}
          onClose={() => setShowInvite(false)}
          leagueId={league.id}
        />
      )}

      {/* Edit league name modal */}
      <Modal
        isOpen={showEditLeague}
        onClose={() => setShowEditLeague(false)}
        title="リーグ情報を編集"
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm text-white/60 block mb-2">リーグ名</label>
            <input
              type="text"
              value={editLeagueName}
              onChange={(e) => setEditLeagueName(e.target.value)}
              placeholder="リーグ名を入力"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="text-sm text-white/60 block mb-2">説明（任意）</label>
            <input
              type="text"
              value={editLeagueDesc}
              onChange={(e) => setEditLeagueDesc(e.target.value)}
              placeholder="リーグの説明"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-accent"
            />
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" className="flex-1" onClick={() => setShowEditLeague(false)}>
              キャンセル
            </Button>
            <Button
              variant="gold"
              className="flex-1"
              onClick={handleSaveLeagueName}
              loading={loading}
              disabled={!editLeagueName.trim()}
            >
              保存する
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── 一時メンテ ──────────────────────── */}
      {league && currentSeason && (
        <section className="border border-red-500/30 rounded-2xl p-4 space-y-3 bg-red-900/10">
          <h2 className="text-xs font-bold text-red-400 uppercase tracking-wider">
            メンテナンス
          </h2>

          {/* デモデータ生成 */}
          <div className="space-y-1.5">
            <p className="text-xs text-white/50">
              現在のシーズンにデモデータ（16セッション・約64局）を生成します。既存データは残ります。
            </p>
            {confirmDemo ? (
              <div className="flex gap-2">
                <Button variant="ghost" className="flex-1" onClick={() => setConfirmDemo(false)}>
                  キャンセル
                </Button>
                <button
                  disabled={generatingDemo}
                  onClick={async () => {
                    if (!league || !currentSeason) return;
                    setGeneratingDemo(true);
                    setConfirmDemo(false);
                    try {
                      const { sessions, games: gc } = await generateDemoData(
                        league.id,
                        currentSeason.id,
                        players,
                        league.settings ?? M_LEAGUE_SETTINGS,
                      );
                      showToast(`デモデータを生成しました（${sessions}セッション / ${gc}局）`);
                    } catch (err: any) {
                      console.error(err);
                      showToast(err?.message ?? 'デモデータの生成に失敗しました');
                    } finally {
                      setGeneratingDemo(false);
                    }
                  }}
                  className="flex-1 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-sm font-medium disabled:opacity-50 transition-colors"
                >
                  {generatingDemo ? '生成中…' : '本当に生成する'}
                </button>
              </div>
            ) : (
              <Button
                variant="ghost"
                className="w-full border-orange-500/40 text-orange-400 hover:bg-orange-500/10"
                loading={generatingDemo}
                onClick={() => setConfirmDemo(true)}
              >
                <FlaskConical className="w-3.5 h-3.5 mr-1" />デモデータを生成
              </Button>
            )}
          </div>

          <hr className="border-white/10" />

          {/* トロフィー整合性修正 */}
          <div className="space-y-1.5">
            <p className="text-xs text-white/50">
              対局データとトロフィーの整合性を修正します。対局なしなのにトロフィーが残っている場合などに使用してください。
            </p>
            <Button
              variant="ghost"
              className="w-full border-red-500/40 text-red-400 hover:bg-red-500/10"
              loading={syncingTrophies}
              onClick={async () => {
                if (!league || !currentSeason) return;
                setSyncingTrophies(true);
                try {
                  // 常に最新の対局データをロードしてから整合（storeが空でも安全）
                  await useGameStore.getState().loadGames(league.id, currentSeason.id);
                  const freshGames = useGameStore.getState().games;
                  const playerIds = players.map((p) => p.id);
                  await syncAllTrophiesForSeason(league.id, currentSeason.id, playerIds, freshGames);
                  showToast('トロフィーの整合性を修正しました');
                } catch (err) {
                  console.error(err);
                  showToast('修正中にエラーが発生しました');
                } finally {
                  setSyncingTrophies(false);
                }
              }}
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1" />トロフィーを現在の対局データで再整合
            </Button>
          </div>

          <hr className="border-white/10" />

          <p className="text-xs text-white/50">
            タイムラインの投稿を全件削除します。この操作は取り消せません。
          </p>
          {confirmClearTL ? (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                className="flex-1"
                onClick={() => setConfirmClearTL(false)}
              >
                キャンセル
              </Button>
              <button
                disabled={clearingTL}
                onClick={async () => {
                  setClearingTL(true);
                  try {
                    const count = await clearAllPosts(league.id);
                    showToast(`${count}件の投稿を削除しました`);
                    setConfirmClearTL(false);
                  } finally {
                    setClearingTL(false);
                  }
                }}
                className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-medium disabled:opacity-50 transition-colors"
              >
                {clearingTL ? '削除中…' : '本当に全削除する'}
              </button>
            </div>
          ) : (
            <Button
              variant="ghost"
              className="w-full border-red-500/40 text-red-400 hover:bg-red-500/10"
              onClick={() => setConfirmClearTL(true)}
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" />TL投稿を全件削除
            </Button>
          )}

          <hr className="border-white/10" />

          {/* 対局記録の全件削除 */}
          <div className="space-y-1.5">
            <p className="text-xs text-white/50">
              現在のシーズンの対局・セッション・成績・トロフィーをすべて削除します。この操作は取り消せません。
            </p>
            {confirmClearGames ? (
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  className="flex-1"
                  onClick={() => setConfirmClearGames(false)}
                >
                  キャンセル
                </Button>
                <button
                  disabled={clearingGames}
                  onClick={async () => {
                    if (!league || !currentSeason) return;
                    setClearingGames(true);
                    try {
                      const playerIds = players.map((p) => p.id);
                      const { games: gc } = await clearAllGames(league.id, currentSeason.id, playerIds);
                      showToast(`${gc}件の対局記録を削除しました`);
                      setConfirmClearGames(false);
                    } catch (err: any) {
                      console.error(err);
                      showToast(err?.message ?? '削除中にエラーが発生しました');
                    } finally {
                      setClearingGames(false);
                    }
                  }}
                  className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-medium disabled:opacity-50 transition-colors"
                >
                  {clearingGames ? '削除中…' : '本当に全削除する'}
                </button>
              </div>
            ) : (
              <Button
                variant="ghost"
                className="w-full border-red-500/40 text-red-400 hover:bg-red-500/10"
                loading={clearingGames}
                onClick={() => setConfirmClearGames(true)}
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" />対局記録を全件削除
              </Button>
            )}
          </div>
        </section>
      )}

      {/* New season modal */}
      <Modal
        isOpen={showNewSeason}
        onClose={() => setShowNewSeason(false)}
        title="新シーズン作成"
      >
        <div className="space-y-4">
          <input
            type="text"
            value={seasonName}
            onChange={(e) => setSeasonName(e.target.value)}
            placeholder="シーズン名（例: 2026年春季リーグ）"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-accent"
          />
          <div className="flex gap-3">
            <Button variant="ghost" className="flex-1" onClick={() => setShowNewSeason(false)}>
              キャンセル
            </Button>
            <Button
              variant="gold"
              className="flex-1"
              onClick={handleCreateSeason}
              loading={loading}
              disabled={!seasonName.trim()}
            >
              作成する
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
