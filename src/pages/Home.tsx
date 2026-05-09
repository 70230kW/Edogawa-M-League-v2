import React, { useState, useMemo, useEffect } from 'react';
import { BarChart2, Swords, Plus, Send, CalendarDays, ChevronDown, ChevronUp, RotateCcw, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useLeagueStore } from '@/stores/useLeagueStore';
import { useGameStore } from '@/stores/useGameStore';
import { useSessionStore } from '@/stores/useSessionStore';
import { SeasonSwitcher } from '@/components/dashboard/SeasonSwitcher';
import { Modal } from '@/components/ui/Modal';
import { SessionGameWizard } from '@/components/games/SessionGameWizard';
import { SessionReportModal } from '@/components/timeline/SessionReportModal';
import { PlayerAvatar } from '@/components/players/PlayerAvatar';
import { useRealtimeStandings, useRealtimeGames, useRealtimeTimeline, useRealtimeSessions } from '@/hooks/useRealtime';
import { Skeleton } from '@/components/ui/Skeleton';
import { Player, GameRecord } from '@/types';
import { loadDraft, clearDraft, DraftSessionData } from '@/utils/draftSession';
import { computeRanking } from '@/pages/Ranking';

const rankColors = ['text-yellow-400', 'text-gray-300', 'text-amber-600', 'text-red-400'];
const rankMedals = ['🥇', '🥈', '🥉'];

function computeSessionStats(games: GameRecord[], players: Player[]) {
  const map = new Map<string, { total: number; rankSum: number; count: number }>();
  for (const game of games) {
    for (const gp of game.players) {
      const prev = map.get(gp.playerId) ?? { total: 0, rankSum: 0, count: 0 };
      map.set(gp.playerId, {
        total: prev.total + gp.point,
        rankSum: prev.rankSum + gp.rank,
        count: prev.count + 1,
      });
    }
  }
  return [...map.entries()]
    .map(([playerId, { total, rankSum, count }]) => ({
      playerId,
      player: players.find((p) => p.id === playerId) as Player | undefined,
      total: Math.round(total * 10) / 10,
      avgRank: count > 0 ? Math.round((rankSum / count) * 100) / 100 : 0,
    }))
    .filter((r): r is { playerId: string; player: Player; total: number; avgRank: number } => !!r.player)
    .sort((a, b) => b.total - a.total);
}

export const Home: React.FC = () => {
  const { league, players, seasons, currentSeason } = useLeagueStore();
  const { games } = useGameStore();
  const { currentSession, sessions } = useSessionStore();
  const [showGameForm, setShowGameForm] = useState(false);
  const [showSessionReport, setShowSessionReport] = useState(false);
  const [expandGames, setExpandGames] = useState(false);
  const [resumeDraft, setResumeDraft] = useState<DraftSessionData | null>(null);
  const [showDraftBanner, setShowDraftBanner] = useState(false);

  const leagueId = league?.id ?? '';
  const seasonId = currentSeason?.id ?? '';

  useRealtimeStandings(leagueId, seasonId);
  useRealtimeGames(leagueId, seasonId);
  useRealtimeTimeline(leagueId);
  useRealtimeSessions(leagueId, seasonId);

  useEffect(() => {
    if (!leagueId || !seasonId) return;
    const draft = loadDraft();
    if (draft && draft.leagueId === leagueId && draft.seasonId === seasonId) {
      setResumeDraft(draft);
      setShowDraftBanner(true);
    }
  }, [leagueId, seasonId]);

  const sessionGames = currentSession
    ? games.filter((g) => currentSession.gameIds.includes(g.id))
        .slice()
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
    : [];

  const sessionStats = computeSessionStats(sessionGames, players);

  // ダッシュボード用ランキングデータ
  const dashRows = useMemo(() => computeRanking(games, players), [games, players]);

  const bestAvgRank = useMemo(
    () => (dashRows.length > 0 ? [...dashRows].sort((a, b) => a.avgRank - b.avgRank)[0] : null),
    [dashRows]
  );
  const bestTop1Rate = useMemo(
    () => (dashRows.length > 0 ? [...dashRows].sort((a, b) => b.top1Rate - a.top1Rate)[0] : null),
    [dashRows]
  );
  const bestLastRate = useMemo(
    () => (dashRows.length > 0 ? [...dashRows].sort((a, b) => a.lastRate - b.lastRate)[0] : null),
    [dashRows]
  );

  // 直近の対局（セッション単位、最大5件）対局が1件以上存在するもののみ表示
  const recentSessions = useMemo(
    () =>
      [...sessions]
        .filter(
          (s) =>
            s.status === 'closed' &&
            s.gameIds.some((id) => games.some((g) => g.id === id))
        )
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 5),
    [sessions, games]
  );

  if (!league) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Season switcher */}
      <SeasonSwitcher seasons={seasons} currentSeason={currentSeason} />

      {/* 途中保存バナー */}
      <AnimatePresence>
        {showDraftBanner && resumeDraft && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-3 px-4 py-3 bg-amber-900/30 border border-amber-500/40 rounded-xl"
          >
            <RotateCcw className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-amber-300">入力中のセッションがあります</p>
              <p className="text-[10px] text-amber-400/60 truncate">
                {resumeDraft.date} · {resumeDraft.completedHancha.length}半荘入力済み
              </p>
            </div>
            <button
              onClick={() => { setShowGameForm(true); setShowDraftBanner(false); }}
              className="text-xs text-amber-300 font-medium border border-amber-500/50 px-2.5 py-1 rounded-lg hover:bg-amber-500/20 transition-colors shrink-0"
            >
              続きから
            </button>
            <button
              onClick={() => { clearDraft(); setShowDraftBanner(false); setResumeDraft(null); }}
              className="text-amber-400/50 hover:text-amber-400 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Session status */}
      {currentSession && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold text-white/40 uppercase tracking-wider flex items-center gap-1">
              <CalendarDays className="w-3.5 h-3.5" />
              進行中の対局状況
            </h2>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowSessionReport(true)}
              className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-xl border border-accent/50 text-accent hover:bg-accent/10 transition-colors"
            >
              <Send className="w-3 h-3" />
              セッションを締める
            </motion.button>
          </div>

          <div className="bg-bg-card border border-white/10 rounded-2xl overflow-hidden">
            <div className="px-4 pt-3 pb-2 border-b border-white/5">
              <p className="text-xs text-accent font-medium">
                {currentSession.name}（第{sessionGames.length}局まで）
              </p>
            </div>

            {sessionStats.length === 0 ? (
              <p className="text-white/30 text-sm text-center py-4">まだ対局が記録されていません</p>
            ) : (
              <div className="p-4 space-y-2.5">
                {sessionStats.map((item) => (
                  <div key={item.playerId} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: item.player.color }}
                      />
                      <span className="text-sm text-white/80">{item.player.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-white/35 tabular-nums">
                        avg {item.avgRank.toFixed(2)}位
                      </span>
                      <span
                        className={`text-sm font-bold tabular-nums w-20 text-right ${
                          item.total >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}
                      >
                        {item.total > 0 ? '+' : ''}{item.total.toFixed(1)}pt
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {sessionGames.length > 0 && (
              <button
                onClick={() => setExpandGames((v) => !v)}
                className="w-full flex items-center justify-center gap-1 py-2.5 text-xs text-white/30 hover:text-white/60 border-t border-white/5 transition-colors"
              >
                {expandGames ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                {expandGames ? '各局を閉じる' : `各局の詳細（${sessionGames.length}局）`}
              </button>
            )}

            <AnimatePresence>
              {expandGames && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="border-t border-white/10 divide-y divide-white/5">
                    {sessionGames.map((game, i) => {
                      const sorted = [...game.players].sort((a, b) => a.rank - b.rank);
                      return (
                        <div key={game.id} className="px-4 py-3">
                          <p className="text-[10px] text-white/30 mb-2">第{i + 1}局</p>
                          <div className="grid grid-cols-4 gap-1">
                            {sorted.map((gp) => {
                              const p = players.find((pl) => pl.id === gp.playerId);
                              if (!p) return null;
                              return (
                                <div key={gp.playerId} className="text-center">
                                  <p className={`text-xs font-bold ${rankColors[gp.rank - 1]}`}>{gp.rank}位</p>
                                  <div
                                    className="w-1.5 h-1.5 rounded-full mx-auto my-1"
                                    style={{ backgroundColor: p.color }}
                                  />
                                  <p className="text-[10px] text-white/70 truncate">{p.name}</p>
                                  <p className="text-[10px] text-white/40 tabular-nums">
                                    {gp.score.toLocaleString()}
                                  </p>
                                  <p className={`text-[10px] font-bold tabular-nums ${gp.point >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {gp.point > 0 ? '+' : ''}{gp.point.toFixed(1)}
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>
      )}

      {/* ダッシュボード */}
      <section>
        <h2 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3 flex items-center gap-1">
          <BarChart2 className="w-3.5 h-3.5" />ダッシュボード
        </h2>

        {dashRows.length === 0 ? (
          <div className="text-center py-8 text-white/30 text-sm">データがありません</div>
        ) : (
          <>
            {/* 成績トップバッジ */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              {dashRows[0] && (
                <div className="bg-bg-card border border-yellow-500/20 rounded-xl px-3 py-2.5">
                  <p className="text-[10px] text-white/40 mb-1.5">累計pt首位</p>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <PlayerAvatar player={dashRows[0].player} size={18} />
                    <span className="text-xs font-bold text-yellow-400 truncate">{dashRows[0].player.name}</span>
                  </div>
                  <p className="text-[11px] font-bold text-yellow-400 tabular-nums">
                    {dashRows[0].totalPoint > 0 ? '+' : ''}{dashRows[0].totalPoint.toFixed(1)}pt
                  </p>
                </div>
              )}
              {bestAvgRank && (
                <div className="bg-bg-card border border-emerald-500/20 rounded-xl px-3 py-2.5">
                  <p className="text-[10px] text-white/40 mb-1.5">平均順位</p>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <PlayerAvatar player={bestAvgRank.player} size={18} />
                    <span className="text-xs font-bold text-emerald-400 truncate">{bestAvgRank.player.name}</span>
                  </div>
                  <p className="text-[11px] font-bold text-emerald-400 tabular-nums">
                    {bestAvgRank.avgRank.toFixed(2)}位
                  </p>
                </div>
              )}
              {bestTop1Rate && (
                <div className="bg-bg-card border border-sky-500/20 rounded-xl px-3 py-2.5">
                  <p className="text-[10px] text-white/40 mb-1.5">1位率</p>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <PlayerAvatar player={bestTop1Rate.player} size={18} />
                    <span className="text-xs font-bold text-sky-400 truncate">{bestTop1Rate.player.name}</span>
                  </div>
                  <p className="text-[11px] font-bold text-sky-400 tabular-nums">
                    {bestTop1Rate.top1Rate.toFixed(1)}%
                  </p>
                </div>
              )}
              {bestLastRate && (
                <div className="bg-bg-card border border-purple-500/20 rounded-xl px-3 py-2.5">
                  <p className="text-[10px] text-white/40 mb-1.5">4位率最低</p>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <PlayerAvatar player={bestLastRate.player} size={18} />
                    <span className="text-xs font-bold text-purple-400 truncate">{bestLastRate.player.name}</span>
                  </div>
                  <p className="text-[11px] font-bold text-purple-400 tabular-nums">
                    {bestLastRate.lastRate.toFixed(1)}%
                  </p>
                </div>
              )}
            </div>

            {/* ランキングテーブル（横スクロール） */}
            <div className="bg-bg-card border border-white/10 rounded-2xl overflow-hidden">
              <div style={{ overflowX: 'auto' }}>
                <table
                  className="text-xs"
                  style={{ minWidth: 520, width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}
                >
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                      <th className="py-2.5 pl-4 text-left text-white/30 font-medium" style={{ width: 32 }}>#</th>
                      <th className="py-2.5 text-left text-white/30 font-medium" style={{ width: 110 }}>名前</th>
                      <th className="py-2.5 pr-3 text-right text-white/30 font-medium">合計pt</th>
                      <th className="py-2.5 pr-3 text-right text-white/30 font-medium">局数</th>
                      <th className="py-2.5 pr-3 text-right text-white/30 font-medium">平均</th>
                      <th className="py-2.5 pr-3 text-right text-white/30 font-medium">1位%</th>
                      <th className="py-2.5 pr-3 text-right text-white/30 font-medium">4位%</th>
                      <th className="py-2.5 pr-4 text-right text-white/30 font-medium">最高pt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashRows.map((row, i) => (
                      <tr key={row.player.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td className="py-2.5 pl-4 text-white/50 font-bold">
                          {rankMedals[i] ?? `${i + 1}`}
                        </td>
                        <td className="py-2.5">
                          <Link to={`/players/${row.player.id}`} className="flex items-center gap-1.5 group">
                            <PlayerAvatar player={row.player} size={18} />
                            <span className="text-white text-xs truncate group-hover:text-accent transition-colors" style={{ maxWidth: 72 }}>
                              {row.player.name}
                            </span>
                          </Link>
                        </td>
                        <td className={`py-2.5 pr-3 text-right font-bold tabular-nums ${row.totalPoint >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {row.totalPoint > 0 ? '+' : ''}{row.totalPoint.toFixed(1)}
                        </td>
                        <td className="py-2.5 pr-3 text-right text-white/60 tabular-nums">{row.totalGames}</td>
                        <td className="py-2.5 pr-3 text-right text-white/60 tabular-nums">{row.avgRank.toFixed(2)}</td>
                        <td className="py-2.5 pr-3 text-right text-white/60 tabular-nums">{row.top1Rate.toFixed(1)}%</td>
                        <td className="py-2.5 pr-3 text-right text-white/60 tabular-nums">{row.lastRate.toFixed(1)}%</td>
                        <td className={`py-2.5 pr-4 text-right tabular-nums ${row.maxPoint > 0 ? 'text-accent/80' : 'text-white/60'}`}>
                          {row.maxPoint > 0 ? '+' : ''}{row.maxPoint.toFixed(1)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </section>

      {/* 直近の対局（セッション単位） */}
      <section>
        <h2 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3 flex items-center gap-1">
          <Swords className="w-3.5 h-3.5" />直近の対局
        </h2>
        {recentSessions.length === 0 ? (
          <div className="text-center py-6 text-white/40 text-sm">
            まだ対局が記録されていません
          </div>
        ) : (
          <div className="space-y-3">
            {recentSessions.map((sess) => {
              const sessGames = games.filter((g) => sess.gameIds.includes(g.id));
              const stats = computeSessionStats(sessGames, players);
              return (
                <div key={sess.id} className="bg-bg-card border border-white/10 rounded-2xl overflow-hidden">
                  <div className="px-4 py-2.5 border-b border-white/5">
                    <p className="text-xs font-medium text-white">{sess.name}</p>
                    <p className="text-[10px] text-white/40">{sess.date} · {sessGames.length}半荘</p>
                  </div>
                  <div className="px-4 py-3 space-y-2">
                    {stats.map((item, i) => (
                      <div key={item.playerId} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-white/30 w-3 tabular-nums">{i + 1}</span>
                          <div
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: item.player.color }}
                          />
                          <span className="text-xs text-white/80">{item.player.name}</span>
                        </div>
                        <span
                          className={`text-xs font-bold tabular-nums ${item.total >= 0 ? 'text-green-400' : 'text-red-400'}`}
                        >
                          {item.total > 0 ? '+' : ''}{item.total.toFixed(1)}pt
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* FAB */}
      <motion.button
        whileTap={{ scale: 0.92 }}
        whileHover={{ scale: 1.05 }}
        onClick={() => setShowGameForm(true)}
        className="fixed right-5 w-14 h-14 rounded-full flex items-center justify-center text-black z-30"
        style={{
          bottom: 'calc(env(safe-area-inset-bottom) + 5.5rem)',
          background: 'linear-gradient(135deg, #00d4ff 0%, #0066ff 100%)',
          boxShadow: '0 0 25px rgba(0, 212, 255, 0.5), 0 4px 15px rgba(0, 0, 0, 0.5)',
        }}
      >
        <Plus className="w-7 h-7" strokeWidth={2.5} />
      </motion.button>

      {/* 対局入力ウィザード */}
      <Modal
        isOpen={showGameForm}
        onClose={() => { setShowGameForm(false); }}
        title="対局を記録"
        size="lg"
      >
        {seasonId ? (
          <SessionGameWizard
            leagueId={leagueId}
            seasonId={seasonId}
            initialDraft={resumeDraft}
            onSuccess={() => { setShowGameForm(false); setResumeDraft(null); }}
            onCancel={() => { setShowGameForm(false); }}
          />
        ) : (
          <div className="text-center py-6">
            <p className="text-white/60 text-sm">
              シーズンを作成してから対局を記録できます
            </p>
          </div>
        )}
      </Modal>

      {/* Session report modal */}
      {currentSession && (
        <SessionReportModal
          isOpen={showSessionReport}
          onClose={() => setShowSessionReport(false)}
          leagueId={leagueId}
          seasonId={seasonId}
          session={currentSession}
        />
      )}

    </div>
  );
};
