import React, { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, Save, Cloud, Check, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Player, GamePlayer, GameEvent, LeagueSettings } from '@/types';
import { Button } from '@/components/ui/Button';
import { ScoreInput } from './ScoreInput';
import { YakumanSelector } from './YakumanSelector';
import { ChonboSelector } from './ChonboSelector';
import { MahjongTableSeat } from './MahjongTableSeat';
import { calcPoint, validateTotalScore } from '@/utils/pointCalc';
import { todayString } from '@/utils/dateUtils';
import { useGameStore } from '@/stores/useGameStore';
import { useLeagueStore } from '@/stores/useLeagueStore';
import { useSessionStore } from '@/stores/useSessionStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { useTimelineStore } from '@/stores/useTimelineStore';
import { generateYakumanFlash, generateChonboFlash } from '@/utils/timelineGenerator';
import {
  DraftSessionData,
  DraftHanchaEntry,
  DraftScoreEntry,
  DraftYakumanEntry,
  DraftChonboEntry,
  SeatWind,
  saveDraft,
  clearDraft,
  getOyaPlayerId,
  getBlockStart,
  isBlockStart,
  WIND_ORDER,
  WIND_LABELS,
} from '@/utils/draftSession';

interface SessionGameWizardProps {
  leagueId: string;
  seasonId: string;
  initialDraft?: DraftSessionData | null;
  onSuccess: () => void;
  onCancel: () => void;
}

type WizardStep = 'basic' | 'seat' | 'score';

function makeInitialScores(playerIds: string[]): DraftScoreEntry[] {
  return playerIds.map((id, i) => ({ playerId: id, score: 0, rank: i + 1, isFly: false }));
}

export const SessionGameWizard: React.FC<SessionGameWizardProps> = ({
  leagueId,
  seasonId,
  initialDraft,
  onSuccess,
  onCancel,
}) => {
  const { players, league } = useLeagueStore();
  const { addGame } = useGameStore();
  const { sessions, createSession, addGameToSession, closeSession } = useSessionStore();
  const { addPost } = useTimelineStore();
  const { user } = useAuthStore();

  const activePlayers = players.filter((p) => p.isActive);

  const settings: LeagueSettings = league?.settings ?? {
    startPoints: 25000,
    returnPoints: 30000,
    rankPoints: [50, 10, -10, -30],
    oka: 20,
    playerCount: 4,
    gameType: 'south',
    hasRedDora: true,
    hasUraDora: true,
    chonboPenalty: -20,
  };

  // ── ステップ・基本情報 ─────────────────────────────────────
  const [step, setStep] = useState<WizardStep>(
    initialDraft
      ? initialDraft.currentStep === 'seat'
        ? 'seat'
        : 'score'
      : 'basic'
  );
  const [date, setDate] = useState(initialDraft?.date ?? todayString());
  const [sessionName, setSessionName] = useState(initialDraft?.sessionName ?? '');
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>(
    initialDraft?.selectedPlayerIds ??
      (activePlayers.length === 4 ? activePlayers.map((p) => p.id) : [])
  );
  const [gameType, setGameType] = useState<'south' | 'east'>('south');

  // ── 進行状態 ───────────────────────────────────────────────
  const [currentHanchaIndex, setCurrentHanchaIndex] = useState(
    initialDraft?.currentHanchaIndex ?? 0
  );
  const [seatMaps, setSeatMaps] = useState<Record<string, Record<string, SeatWind>>>(
    initialDraft?.seatMaps ?? {}
  );
  const [currentSeatMap, setCurrentSeatMap] = useState<Record<string, SeatWind>>(
    initialDraft?.currentSeatMap ?? {}
  );
  const [currentScores, setCurrentScores] = useState<DraftScoreEntry[]>(
    initialDraft?.currentScores ??
      makeInitialScores(initialDraft?.selectedPlayerIds ?? [])
  );
  const [currentYakuman, setCurrentYakuman] = useState<DraftYakumanEntry[]>(
    initialDraft?.currentYakuman ?? []
  );
  const [currentChonbo, setCurrentChonbo] = useState<DraftChonboEntry[]>(
    initialDraft?.currentChonbo ?? []
  );
  const [currentNotes, setCurrentNotes] = useState(initialDraft?.currentNotes ?? '');
  const [completedHancha, setCompletedHancha] = useState<DraftHanchaEntry[]>(
    initialDraft?.completedHancha ?? []
  );

  const [saving, setSaving] = useState(false);
  const [draftSavedMsg, setDraftSavedMsg] = useState(false);

  // 4人のとき自動選択
  useEffect(() => {
    if (!initialDraft && activePlayers.length === 4 && selectedPlayerIds.length === 0) {
      setSelectedPlayerIds(activePlayers.map((p) => p.id));
    }
  }, [activePlayers.length]);

  const selectedPlayers = selectedPlayerIds
    .map((id) => activePlayers.find((p) => p.id === id))
    .filter(Boolean) as Player[];

  const totalScore = currentScores.reduce((s, e) => s + e.score, 0);
  const isValidTotal =
    currentScores.length > 0 && validateTotalScore(currentScores.map((s) => s.score));
  const points = useMemo(
    () => currentScores.map((s) => calcPoint(s.score, s.rank, settings)),
    [currentScores, settings]
  );

  const hanchaLabel = currentHanchaIndex + 1;
  const oyaPlayerId = getOyaPlayerId(currentHanchaIndex, seatMaps);
  const oyaPlayer = oyaPlayerId ? selectedPlayers.find((p) => p.id === oyaPlayerId) : null;

  const isSeatComplete = WIND_ORDER.every((w) =>
    Object.values(currentSeatMap).includes(w)
  );

  // ── ドラフト保存 ───────────────────────────────────────────
  const buildDraftSnapshot = (): Omit<DraftSessionData, 'savedAt'> => ({
    leagueId,
    seasonId,
    date,
    sessionName,
    selectedPlayerIds,
    seatMaps,
    completedHancha,
    currentHanchaIndex,
    currentStep: step === 'seat' ? 'seat' : 'score',
    currentSeatMap,
    currentScores,
    currentYakuman,
    currentChonbo,
    currentNotes,
  });

  const handleSaveDraft = () => {
    saveDraft(buildDraftSnapshot());
    setDraftSavedMsg(true);
    setTimeout(() => setDraftSavedMsg(false), 2500);
  };

  // ── 基本設定 → 座席選択 ────────────────────────────────────
  const handleBasicNext = () => {
    setCurrentScores(makeInitialScores(selectedPlayerIds));
    setCurrentHanchaIndex(0);
    setCurrentSeatMap({});
    setCompletedHancha([]);
    setSeatMaps({});
    setStep('seat');
  };

  // ── 座席確定 → 素点入力 ────────────────────────────────────
  const handleSeatConfirm = () => {
    const blockStart = getBlockStart(currentHanchaIndex);
    const newSeatMaps = { ...seatMaps, [String(blockStart)]: currentSeatMap };
    setSeatMaps(newSeatMaps);
    setCurrentScores(makeInitialScores(selectedPlayerIds));
    setCurrentYakuman([]);
    setCurrentChonbo([]);
    setCurrentNotes('');
    setStep('score');
  };

  // ── 現在の半荘を確定 ──────────────────────────────────────
  const commitCurrentHancha = (): DraftHanchaEntry => ({
    hanchaIndex: currentHanchaIndex,
    scores: currentScores,
    yakumanEntries: currentYakuman,
    chonboEntries: currentChonbo,
    notes: currentNotes,
  });

  // ── 次の半荘へ進む ────────────────────────────────────────
  const handleNextHancha = () => {
    const entry = commitCurrentHancha();
    const newCompleted = [...completedHancha, entry];
    setCompletedHancha(newCompleted);

    const nextIdx = currentHanchaIndex + 1;
    setCurrentHanchaIndex(nextIdx);
    setCurrentScores(makeInitialScores(selectedPlayerIds));
    setCurrentYakuman([]);
    setCurrentChonbo([]);
    setCurrentNotes('');

    if (isBlockStart(nextIdx)) {
      setCurrentSeatMap({});
      setStep('seat');
    }

    // 自動途中保存
    saveDraft({
      ...buildDraftSnapshot(),
      completedHancha: newCompleted,
      currentHanchaIndex: nextIdx,
      currentScores: makeInitialScores(selectedPlayerIds),
      currentYakuman: [],
      currentChonbo: [],
      currentNotes: '',
      currentStep: isBlockStart(nextIdx) ? 'seat' : 'score',
    });
  };

  // ── 全半荘を保存して終了 ──────────────────────────────────
  const handleFinalSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const allHancha = [...completedHancha, commitCurrentHancha()];
      const finalSeatMaps = { ...seatMaps };
      const blockStart = getBlockStart(currentHanchaIndex);
      if (!finalSeatMaps[String(blockStart)] && Object.keys(currentSeatMap).length > 0) {
        finalSeatMaps[String(blockStart)] = currentSeatMap;
      }

      const closedCount = sessions.filter((s) => s.status === 'closed').length;
      const name = sessionName.trim() || `第${closedCount + 1}回`;
      const sessId = await createSession(leagueId, seasonId, name, user.uid);

      for (const hancha of allHancha) {
        const oya = getOyaPlayerId(hancha.hanchaIndex, finalSeatMaps);
        const gamePlayers: GamePlayer[] = hancha.scores.map((s) => ({
          playerId: s.playerId,
          rank: s.rank,
          score: s.score,
          point: calcPoint(s.score, s.rank, settings),
          isFly: s.isFly,
        }));
        const validYakuman = hancha.yakumanEntries.filter((e) => e.yakumanList.length > 0);
        const events: GameEvent[] = [
          ...validYakuman.map((e) => ({
            type: 'yakuman' as const,
            playerId: e.playerId,
            yakumanList: e.yakumanList,
          })),
          ...hancha.chonboEntries.map((e) => ({
            type: 'chonbo' as const,
            playerId: e.playerId,
            chonboType: e.chonboType,
            chonboNote: e.note,
          })),
        ];

        const gameId = await addGame(
          leagueId,
          seasonId,
          {
            date,
            gameType,
            oya: oya ?? undefined,
            players: gamePlayers,
            events,
            notes: hancha.notes,
          },
          settings,
          user.uid
        );
        await addGameToSession(leagueId, seasonId, sessId, gameId);

        for (const entry of validYakuman) {
          const player = selectedPlayers.find((p) => p.id === entry.playerId);
          if (player) {
            await addPost(leagueId, {
              type: 'yakuman_flash',
              content: generateYakumanFlash(player.name, entry.yakumanList),
              triggeredBy: 'system',
              meta: { gameId, playerId: entry.playerId, yakumanList: entry.yakumanList },
            });
          }
        }
        for (const entry of hancha.chonboEntries) {
          const player = selectedPlayers.find((p) => p.id === entry.playerId);
          if (player) {
            await addPost(leagueId, {
              type: 'chonbo_flash',
              content: generateChonboFlash(player.name, entry.chonboType),
              triggeredBy: 'system',
              meta: { gameId, playerId: entry.playerId, chonboType: entry.chonboType },
            });
          }
        }
      }

      await closeSession(leagueId, seasonId, sessId);
      clearDraft();
      onSuccess();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // ── 役満ヘルパー ──────────────────────────────────────────
  const addYakumanEntry = () => {
    setCurrentYakuman((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random()}`,
        playerId: selectedPlayerIds[0] ?? '',
        yakumanList: [],
      },
    ]);
  };

  const updateYakumanEntry = (id: string, updates: Partial<Omit<DraftYakumanEntry, 'id'>>) => {
    setCurrentYakuman((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updates } : e))
    );
  };

  const removeYakumanEntry = (id: string) => {
    setCurrentYakuman((prev) => prev.filter((e) => e.id !== id));
  };

  // ── 途中保存ボタン（ヘッダー右上） ────────────────────────
  const DraftSaveButton = () => (
    <button
      onClick={handleSaveDraft}
      className="flex items-center gap-1.5 text-xs transition-colors"
      style={{ color: draftSavedMsg ? '#4ade80' : 'rgba(255,255,255,0.4)' }}
    >
      {draftSavedMsg ? (
        <>
          <Check className="w-3.5 h-3.5" />
          <span>保存済み</span>
        </>
      ) : (
        <>
          <Cloud className="w-3.5 h-3.5" />
          <span>途中保存</span>
        </>
      )}
    </button>
  );

  // ──────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* 進行ヘッダー（basic以外） */}
      {step !== 'basic' && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (step === 'seat' && currentHanchaIndex === 0) setStep('basic');
                else if (step === 'score' && isBlockStart(currentHanchaIndex)) setStep('seat');
              }}
              className="text-white/40 hover:text-white/70 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div>
              <p className="text-sm font-medium text-white">
                {step === 'seat'
                  ? `第${hanchaLabel}〜${hanchaLabel + 3}半荘 座席配置`
                  : `第${hanchaLabel}半荘 素点入力`}
              </p>
              {completedHancha.length > 0 && (
                <p className="text-[10px] text-white/30">
                  {completedHancha.length}半荘完了済み
                </p>
              )}
            </div>
          </div>
          <DraftSaveButton />
        </div>
      )}

      <AnimatePresence mode="wait">
        {/* ── Step: 基本設定 ─────────────────────────────── */}
        {step === 'basic' && (
          <motion.div
            key="basic"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-white/50 block mb-1.5">対局日</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="text-xs text-white/50 block mb-1.5">種別</label>
                <div className="flex gap-1.5 h-[38px]">
                  {(['south', 'east'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setGameType(type)}
                      className={`flex-1 rounded-xl border text-xs font-medium transition-all ${
                        gameType === type
                          ? 'bg-primary border-accent text-accent'
                          : 'bg-white/5 border-white/10 text-white/60'
                      }`}
                    >
                      {type === 'south' ? '半荘' : '東風'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs text-white/50 block mb-1.5">
                セッション名（任意）
              </label>
              <input
                type="text"
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                placeholder={`第${sessions.filter((s) => s.status === 'closed').length + 1}回`}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm placeholder-white/30 focus:outline-none focus:border-accent"
              />
            </div>

            <div>
              <p className="text-xs text-white/50 mb-2">
                参加メンバーを選択（{selectedPlayerIds.length}/4人）
              </p>
              <div className="space-y-2">
                {activePlayers.map((player) => {
                  const isSelected = selectedPlayerIds.includes(player.id);
                  const isDisabled = !isSelected && selectedPlayerIds.length >= 4;
                  return (
                    <button
                      key={player.id}
                      onClick={() => {
                        if (isDisabled) return;
                        setSelectedPlayerIds((prev) =>
                          isSelected
                            ? prev.filter((id) => id !== player.id)
                            : [...prev, player.id]
                        );
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'bg-accent/15 border-accent/50'
                          : isDisabled
                          ? 'bg-white/3 border-white/5 opacity-40 cursor-not-allowed'
                          : 'bg-white/5 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                        style={{ backgroundColor: player.color }}
                      >
                        {player.name[0]}
                      </div>
                      <span
                        className={`text-sm font-medium ${
                          isSelected ? 'text-white' : 'text-white/70'
                        }`}
                      >
                        {player.name}
                      </span>
                      {isSelected && (
                        <Check className="w-4 h-4 text-accent ml-auto" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <Button variant="ghost" className="flex-1" onClick={onCancel}>
                キャンセル
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                disabled={selectedPlayerIds.length !== 4}
                onClick={handleBasicNext}
              >
                座席を設定 →
              </Button>
            </div>
          </motion.div>
        )}

        {/* ── Step: 座席配置 ─────────────────────────────── */}
        {step === 'seat' && (
          <motion.div
            key="seat"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <p className="text-xs text-white/50 text-center">
              東1局での各プレイヤーの座席を設定してください
            </p>

            <MahjongTableSeat
              players={selectedPlayers}
              seatMap={currentSeatMap}
              onChange={setCurrentSeatMap}
            />

            <div className="flex gap-3 pt-1">
              <Button
                variant="ghost"
                className="flex-1"
                onClick={() =>
                  currentHanchaIndex === 0 ? setStep('basic') : setStep('score')
                }
              >
                <ChevronLeft className="w-4 h-4 mr-1" />戻る
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                disabled={!isSeatComplete}
                onClick={handleSeatConfirm}
              >
                確定して素点入力へ →
              </Button>
            </div>
          </motion.div>
        )}

        {/* ── Step: 素点入力 ─────────────────────────────── */}
        {step === 'score' && (
          <motion.div
            key={`score-${currentHanchaIndex}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            {/* 起家バッジ */}
            {oyaPlayer && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-900/20 border border-amber-500/30 rounded-xl">
                <span className="text-xs text-amber-400/80 shrink-0">起家:</span>
                <div
                  className="w-4 h-4 rounded-full shrink-0"
                  style={{ backgroundColor: oyaPlayer.color }}
                />
                <span className="text-sm font-medium text-amber-300">
                  {oyaPlayer.name}
                </span>
              </div>
            )}

            {/* 素点入力 */}
            <ScoreInput
              players={selectedPlayers}
              scores={currentScores}
              points={points}
              onChange={setCurrentScores}
              totalScore={totalScore}
              isValid={isValidTotal}
            />

            {/* 役満 */}
            <div>
              <p className="text-xs text-white/50 mb-2 font-medium">役満（任意）</p>
              <div className="space-y-2">
                {currentYakuman.map((entry) => (
                  <div
                    key={entry.id}
                    className="border border-white/10 rounded-xl p-3 space-y-2.5 bg-white/3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex gap-1.5 flex-wrap">
                        {selectedPlayers.map((p) => (
                          <button
                            key={p.id}
                            onClick={() =>
                              updateYakumanEntry(entry.id, {
                                playerId: p.id,
                                yakumanList: [],
                              })
                            }
                            className={`px-2.5 py-1 rounded-lg text-xs border transition-colors ${
                              entry.playerId === p.id
                                ? 'bg-accent/20 border-accent text-accent'
                                : 'bg-white/5 border-white/10 text-white/60'
                            }`}
                          >
                            {p.name}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => removeYakumanEntry(entry.id)}
                        className="text-white/30 hover:text-red-400 transition-colors shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <YakumanSelector
                      selected={entry.yakumanList}
                      onChange={(list) =>
                        updateYakumanEntry(entry.id, { yakumanList: list })
                      }
                    />
                  </div>
                ))}
              </div>
              <button
                onClick={addYakumanEntry}
                className="mt-2 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border border-dashed border-white/20 text-white/40 hover:text-white/60 text-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />役満を追加
              </button>
            </div>

            {/* チョンボ */}
            <div>
              <p className="text-xs text-white/50 mb-2 font-medium">チョンボ（任意）</p>
              <ChonboSelector
                players={selectedPlayers}
                value={currentChonbo}
                onChange={setCurrentChonbo}
              />
            </div>

            {/* メモ */}
            <div>
              <p className="text-xs text-white/50 mb-1.5 font-medium">メモ（任意）</p>
              <textarea
                value={currentNotes}
                onChange={(e) => setCurrentNotes(e.target.value)}
                placeholder="メモを入力…"
                rows={2}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/30 text-sm focus:outline-none focus:border-accent resize-none"
              />
            </div>

            {/* ボタン */}
            <div className="space-y-2 pt-1">
              <div className="flex gap-2">
                <Button
                  variant="primary"
                  className="flex-1"
                  disabled={!isValidTotal}
                  onClick={handleNextHancha}
                >
                  次の半荘へ →
                </Button>
                <Button
                  variant="gold"
                  className="flex-1"
                  disabled={!isValidTotal || saving}
                  loading={saving}
                  onClick={handleFinalSave}
                >
                  <Save className="w-3.5 h-3.5 mr-1" />保存して終了
                </Button>
              </div>
              <div className="flex items-center justify-between">
                {completedHancha.length > 0 ? (
                  <p className="text-[10px] text-white/30">
                    {completedHancha.length}半荘入力済み
                  </p>
                ) : (
                  <span />
                )}
                <button
                  onClick={handleSaveDraft}
                  className="flex items-center gap-1 text-[10px] text-white/30 hover:text-white/50 transition-colors"
                >
                  <Cloud className="w-3 h-3" />途中保存
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
