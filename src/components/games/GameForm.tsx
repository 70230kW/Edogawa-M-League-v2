import React, { useState, useMemo, useEffect } from 'react';
import { Trophy, FileText, ChevronLeft, ChevronRight, Save, Users, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Player, YakumanType, ChonboType, GamePlayer, GameEvent, LeagueSettings, GameRecord } from '@/types';
import { Button } from '@/components/ui/Button';
import { YakumanSelector } from './YakumanSelector';
import { ChonboSelector } from './ChonboSelector';
import { ScoreInput } from './ScoreInput';
import { calcPoint, validateTotalScore } from '@/utils/pointCalc';
import { todayString } from '@/utils/dateUtils';
import { useGameStore } from '@/stores/useGameStore';
import { useLeagueStore } from '@/stores/useLeagueStore';
import { useSessionStore } from '@/stores/useSessionStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { useTimelineStore } from '@/stores/useTimelineStore';
import { generateYakumanFlash, generateChonboFlash } from '@/utils/timelineGenerator';

interface GameFormProps {
  leagueId: string;
  seasonId: string;
  onSuccess: () => void;
  onCancel: () => void;
  initialGame?: GameRecord;
}

interface ScoreEntry {
  playerId: string;
  score: number;
  rank: number;
  isFly: boolean;
}

interface ChonboEntry {
  playerId: string;
  chonboType: ChonboType;
  note?: string;
}

interface YakumanEntry {
  id: string;
  playerId: string;
  yakumanList: YakumanType[];
}

const STEPS = ['参加者選択', '点数入力', '補足情報', '確認'];

export const GameForm: React.FC<GameFormProps> = ({
  leagueId,
  seasonId,
  onSuccess,
  onCancel,
  initialGame,
}) => {
  const { players, league } = useLeagueStore();
  const { addGame, updateGame } = useGameStore();
  const { sessions, currentSession, createSession, addGameToSession } = useSessionStore();
  const { addPost } = useTimelineStore();
  const { user } = useAuthStore();

  const activePlayers = players.filter((p) => p.isActive);
  const isEditMode = !!initialGame;

  const [step, setStep] = useState(0);
  const [date, setDate] = useState(todayString());
  const [gameType, setGameType] = useState<'east' | 'south'>('south');
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);

  // Auto-select all when exactly 4 active members (new game only)
  useEffect(() => {
    if (!isEditMode && activePlayers.length === 4 && selectedPlayerIds.length === 0) {
      setSelectedPlayerIds(activePlayers.map((p) => p.id));
    }
  }, [activePlayers.length]);

  // Pre-populate from initialGame in edit mode
  useEffect(() => {
    if (!initialGame) return;
    setDate(initialGame.date);
    setGameType(initialGame.gameType);
    setSelectedPlayerIds(initialGame.players.map((p) => p.playerId));
    setScores(initialGame.players.map((p) => ({
      playerId: p.playerId,
      score: p.score,
      rank: p.rank,
      isFly: p.isFly,
    })));
    setYakumanEntries(
      (initialGame.events ?? [])
        .filter((e) => e.type === 'yakuman')
        .map((e) => ({
          id: `${Date.now()}-${Math.random()}`,
          playerId: e.playerId,
          yakumanList: e.yakumanList ?? [],
        }))
    );
    setChonboEntries(
      (initialGame.events ?? [])
        .filter((e) => e.type === 'chonbo')
        .map((e) => ({
          playerId: e.playerId,
          chonboType: e.chonboType!,
          note: e.chonboNote,
        }))
    );
    setNotes(initialGame.notes ?? '');
    setOya(initialGame.oya ?? null);
  }, [initialGame?.id]);

  const selectedPlayers = selectedPlayerIds
    .map((id) => activePlayers.find((p) => p.id === id))
    .filter(Boolean) as Player[];

  // Session selection: 'existing' = add to currentSession, 'new' = create new session
  type SessionMode = 'existing' | 'new';
  const [sessionMode, setSessionMode] = useState<SessionMode>(currentSession ? 'existing' : 'new');
  const [newSessionName, setNewSessionName] = useState('');

  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [yakumanEntries, setYakumanEntries] = useState<YakumanEntry[]>([]);
  const [chonboEntries, setChonboEntries] = useState<ChonboEntry[]>([]);
  const [notes, setNotes] = useState('');
  const [oya, setOya] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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

  const totalScore = scores.reduce((s, e) => s + e.score, 0);
  const isValidTotal = scores.length > 0 && validateTotalScore(scores.map((s) => s.score));
  const points = useMemo(
    () => scores.map((s) => calcPoint(s.score, s.rank, settings)),
    [scores, settings]
  );

  // ── Player selection ──────────────────────────────────────────────────────
  const togglePlayerSelection = (playerId: string) => {
    setSelectedPlayerIds((prev) => {
      if (prev.includes(playerId)) return prev.filter((id) => id !== playerId);
      if (prev.length >= 4) return prev;
      return [...prev, playerId];
    });
  };

  const handleProceedToStep1 = () => {
    const prevPlayerIds = scores.map((s) => s.playerId);
    const selectionChanged =
      selectedPlayerIds.length !== prevPlayerIds.length ||
      selectedPlayerIds.some((id) => !prevPlayerIds.includes(id));
    if (selectionChanged) {
      setScores(
        selectedPlayerIds.map((id, i) => ({
          playerId: id,
          score: 0,
          rank: i + 1,
          isFly: false,
        }))
      );
      setYakumanEntries([]);
      setChonboEntries([]);
    }
    setStep(1);
  };

  // ── Yakuman entries ───────────────────────────────────────────────────────
  const addYakumanEntry = () => {
    setYakumanEntries((prev) => [
      ...prev,
      { id: `${Date.now()}-${Math.random()}`, playerId: selectedPlayerIds[0] ?? '', yakumanList: [] },
    ]);
  };

  const updateYakumanEntry = (id: string, updates: Partial<Omit<YakumanEntry, 'id'>>) => {
    setYakumanEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updates } : e))
    );
  };

  const removeYakumanEntry = (id: string) => {
    setYakumanEntries((prev) => prev.filter((e) => e.id !== id));
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const gamePlayers: GamePlayer[] = scores.map((s) => ({
        playerId: s.playerId,
        rank: s.rank,
        score: s.score,
        point: calcPoint(s.score, s.rank, settings),
        isFly: s.isFly,
      }));

      const validYakuman = yakumanEntries.filter((e) => e.yakumanList.length > 0);
      const events: GameEvent[] = [
        ...validYakuman.map((e) => ({
          type: 'yakuman' as const,
          playerId: e.playerId,
          yakumanList: e.yakumanList,
        })),
        ...chonboEntries.map((e) => ({
          type: 'chonbo' as const,
          playerId: e.playerId,
          chonboType: e.chonboType,
          chonboNote: e.note,
        })),
      ];

      if (isEditMode && initialGame) {
        // Edit mode: update existing game
        await updateGame(
          leagueId,
          seasonId,
          initialGame.id,
          { date, gameType, oya: oya ?? undefined, players: gamePlayers, events, notes },
          settings
        );
      } else {
        // Add mode: create new game, assign session, post flashes
        const gameId = await addGame(
          leagueId,
          seasonId,
          { date, gameType, oya: oya ?? undefined, players: gamePlayers, events, notes },
          settings,
          user.uid
        );

        // Assign game to session
        if (sessionMode === 'existing' && currentSession) {
          await addGameToSession(leagueId, seasonId, currentSession.id, gameId);
        } else if (sessionMode === 'new') {
          const closedCount = sessions.filter((s) => s.status === 'closed').length;
          const name = newSessionName.trim() || `第${closedCount + 1}回`;
          const newSessId = await createSession(leagueId, seasonId, name, user.uid);
          await addGameToSession(leagueId, seasonId, newSessId, gameId);
        }

        // Post yakuman flash for each entry
        for (const entry of validYakuman) {
          const player = selectedPlayers.find((p) => p.id === entry.playerId);
          if (player) {
            await addPost(leagueId, {
              type: 'yakuman_flash',
              content: generateYakumanFlash(player.name, entry.yakumanList),
              triggeredBy: 'system',
              meta: {
                gameId: gameId || '',
                playerId: entry.playerId,
                yakumanList: entry.yakumanList,
              },
            });
          }
        }

        // Post chonbo flash for each entry
        for (const entry of chonboEntries) {
          const player = selectedPlayers.find((p) => p.id === entry.playerId);
          if (player) {
            await addPost(leagueId, {
              type: 'chonbo_flash',
              content: generateChonboFlash(player.name, entry.chonboType),
              triggeredBy: 'system',
              meta: {
                gameId: gameId || '',
                playerId: entry.playerId,
                chonboType: entry.chonboType,
              },
            });
          }
        }
      }

      onSuccess();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const canProceed = (
    [
      selectedPlayerIds.length === 4,
      isValidTotal && scores.some((s) => s.score > 0),
      true,
      !loading,
    ] as const
  )[step] ?? false;

  const rankColors = ['text-yellow-400', 'text-gray-300', 'text-amber-600', 'text-red-400'];

  return (
    <div className="space-y-4">
      {/* Step indicator */}
      <div className="flex items-center gap-1 px-1">
        {STEPS.map((label, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div
              className={`w-full h-1 rounded-full transition-colors duration-300 ${
                i <= step ? 'bg-accent' : 'bg-white/20'
              }`}
            />
            <p className={`text-[10px] ${i === step ? 'text-accent' : 'text-white/30'}`}>
              {label}
            </p>
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Step 0: 参加者選択 */}
        {step === 0 && (
          <motion.div
            key="step0"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            {/* Session selection - hidden in edit mode */}
            {!isEditMode && <div>
              <p className="text-xs text-white/50 mb-2">セッション</p>
              <div className="flex gap-2">
                {currentSession && (
                  <button
                    onClick={() => setSessionMode('existing')}
                    className={`flex-1 py-2.5 px-3 rounded-xl border text-xs font-medium text-left transition-all ${
                      sessionMode === 'existing'
                        ? 'bg-accent/15 border-accent/50 text-accent'
                        : 'bg-white/5 border-white/10 text-white/60'
                    }`}
                  >
                    <span className="block text-[10px] text-white/40 mb-0.5">現在のセッション</span>
                    {currentSession.name}（{currentSession.gameIds.length}局済）
                  </button>
                )}
                <button
                  onClick={() => setSessionMode('new')}
                  className={`flex-1 py-2.5 px-3 rounded-xl border text-xs font-medium transition-all ${
                    sessionMode === 'new'
                      ? 'bg-accent/15 border-accent/50 text-accent'
                      : 'bg-white/5 border-white/10 text-white/60'
                  }`}
                >
                  新しいセッションを開始
                </button>
              </div>
              {sessionMode === 'new' && (
                <input
                  type="text"
                  value={newSessionName}
                  onChange={(e) => setNewSessionName(e.target.value)}
                  placeholder={`セッション名（省略: 第${sessions.filter((s) => s.status === 'closed').length + 1}回）`}
                  className="mt-2 w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-xs placeholder-white/30 focus:outline-none focus:border-accent"
                />
              )}
            </div>}

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
                <div className="flex gap-1.5">
                  {(['south', 'east'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setGameType(type)}
                      className={`flex-1 py-2 rounded-xl border text-xs font-medium transition-all ${
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
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-white/70 flex items-center gap-1.5">
                  <Users className="w-4 h-4" />参加メンバーを選択
                </p>
                <p className="text-xs text-white/40">
                  {selectedPlayerIds.length}人 / {activePlayers.length}人中
                </p>
              </div>
              <div className="space-y-2">
                {activePlayers.map((player) => {
                  const isSelected = selectedPlayerIds.includes(player.id);
                  const isDisabled = !isSelected && selectedPlayerIds.length >= 4;
                  return (
                    <button
                      key={player.id}
                      onClick={() => !isDisabled && togglePlayerSelection(player.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'bg-accent/15 border-accent/50'
                          : isDisabled
                          ? 'bg-white/3 border-white/5 opacity-40 cursor-not-allowed'
                          : 'bg-white/5 border-white/10 hover:border-white/20 cursor-pointer'
                      }`}
                    >
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                        style={{ backgroundColor: player.color }}
                      >
                        {player.name[0]}
                      </div>
                      <span className={`text-sm font-medium flex-1 ${isSelected ? 'text-white' : 'text-white/70'}`}>
                        {player.name}
                      </span>
                      {isSelected && (
                        <span className="text-xs text-accent font-bold">
                          {selectedPlayerIds.indexOf(player.id) + 1}番目
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              {activePlayers.length === 4 && (
                <p className="text-xs text-white/30 mt-2 text-center">全員自動選択済み（変更可能）</p>
              )}
            </div>

            {/* 起家選択 */}
            {selectedPlayerIds.length === 4 && (
              <div>
                <p className="text-xs text-white/50 mb-2">起家（最初の親）</p>
                <div className="flex gap-2 flex-wrap">
                  {selectedPlayerIds.map((id) => {
                    const p = activePlayers.find((pl) => pl.id === id);
                    if (!p) return null;
                    return (
                      <button
                        key={id}
                        onClick={() => setOya((prev) => prev === id ? null : id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                          oya === id
                            ? 'bg-accent/15 border-accent/50 text-accent'
                            : 'bg-white/5 border-white/10 text-white/60 hover:border-white/20'
                        }`}
                      >
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
                        {p.name}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[10px] text-white/25 mt-1">省略可</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Step 1: 点数入力 */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <ScoreInput
              players={selectedPlayers}
              scores={scores}
              points={points}
              onChange={setScores}
              totalScore={totalScore}
              isValid={isValidTotal}
            />
          </motion.div>
        )}

        {/* Step 2: 補足情報 */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            {/* 役満 - 複数エントリ */}
            <div>
              <p className="text-sm font-medium text-white/70 mb-2">役満の記録（任意）</p>

              <div className="space-y-3">
                {yakumanEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="border border-white/10 rounded-xl p-3 space-y-3 bg-white/3"
                  >
                    {/* Player selector + remove */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex gap-1.5 flex-wrap">
                        {selectedPlayers.map((p) => (
                          <button
                            key={p.id}
                            onClick={() => updateYakumanEntry(entry.id, { playerId: p.id, yakumanList: [] })}
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
                        className="text-white/30 hover:text-red-400 transition-colors flex-shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <YakumanSelector
                      selected={entry.yakumanList}
                      onChange={(list) => updateYakumanEntry(entry.id, { yakumanList: list })}
                    />
                  </div>
                ))}
              </div>

              <button
                onClick={addYakumanEntry}
                className="mt-2 w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-dashed border-white/20 text-white/40 hover:text-white/60 hover:border-white/30 text-sm transition-colors"
              >
                <Plus className="w-4 h-4" />役満を追加
              </button>
            </div>

            {/* チョンボ */}
            <div>
              <p className="text-sm font-medium text-white/70 mb-2">チョンボの記録（任意）</p>
              <ChonboSelector
                players={selectedPlayers}
                value={chonboEntries}
                onChange={setChonboEntries}
              />
            </div>

            {/* メモ */}
            <div>
              <p className="text-sm font-medium text-white/70 mb-2">対局メモ（任意）</p>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="メモを入力…"
                rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-accent resize-none"
              />
            </div>
          </motion.div>
        )}

        {/* Step 3: 確認 */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-3"
          >
            <p className="text-white/60 text-sm">
              {date} / {gameType === 'south' ? '半荘' : '東風'} ／{' '}
              {selectedPlayers.map((p) => p.name).join('・')}
              {oya && (
                <> ／ 起家: {selectedPlayers.find((p) => p.id === oya)?.name}</>
              )}
            </p>

            {scores
              .slice()
              .sort((a, b) => a.rank - b.rank)
              .map((s) => {
                const player = selectedPlayers.find((p) => p.id === s.playerId);
                const point = calcPoint(s.score, s.rank, settings);
                const playerYakuman = yakumanEntries.filter(
                  (e) => e.playerId === s.playerId && e.yakumanList.length > 0
                );
                return (
                  <div
                    key={s.playerId}
                    className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-3 border border-white/10"
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`font-bold text-lg ${rankColors[s.rank - 1]}`}>
                        {s.rank}位
                      </span>
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: player?.color }} />
                      <span className="text-white font-medium">{player?.name}</span>
                      {playerYakuman.map((e, i) => (
                        <span key={i} className="text-xs text-accent flex items-center gap-0.5">
                          <Trophy className="w-3 h-3" />
                          {e.yakumanList.join('・')}
                        </span>
                      ))}
                      {s.isFly && <span className="text-xs text-red-400">飛び</span>}
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-white/50">{s.score.toLocaleString()}点</p>
                      <p className={`font-bold ${point >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {point > 0 ? '+' : ''}{point.toFixed(1)}p
                      </p>
                    </div>
                  </div>
                );
              })}

            {notes && (
              <p className="text-white/50 text-sm bg-white/5 rounded-xl px-4 py-2 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 flex-shrink-0" />{notes}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex gap-3 pt-2">
        <Button
          variant="ghost"
          className="flex-1"
          onClick={step === 0 ? onCancel : () => setStep(step - 1)}
        >
          {step === 0 ? 'キャンセル' : <><ChevronLeft className="w-4 h-4 inline" />戻る</>}
        </Button>
        {step < 3 ? (
          <Button
            variant="primary"
            className="flex-1"
            onClick={step === 0 ? handleProceedToStep1 : () => setStep(step + 1)}
            disabled={!canProceed}
          >
            次へ<ChevronRight className="w-4 h-4 inline" />
          </Button>
        ) : (
          <Button
            variant="gold"
            className="flex-1"
            onClick={handleSubmit}
            loading={loading}
            disabled={!canProceed}
          >
            <Save className="w-4 h-4 mr-1" />保存する
          </Button>
        )}
      </div>
    </div>
  );
};
