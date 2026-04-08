import React, { useState, useMemo } from 'react';
import { Star, Trophy, FileText, ChevronLeft, ChevronRight, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Player, YakumanType, ChonboType, GamePlayer, GameEvent, LeagueSettings } from '@/types';
import { Button } from '@/components/ui/Button';
import { YakumanSelector } from './YakumanSelector';
import { ChonboSelector } from './ChonboSelector';
import { ScoreInput } from './ScoreInput';
import { calcPoint, validateTotalScore } from '@/utils/pointCalc';
import { todayString } from '@/utils/dateUtils';
import { useGameStore } from '@/stores/useGameStore';
import { useLeagueStore } from '@/stores/useLeagueStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { useTimelineStore } from '@/stores/useTimelineStore';
import { generateYakumanFlash } from '@/utils/timelineGenerator';

interface GameFormProps {
  leagueId: string;
  seasonId: string;
  onSuccess: () => void;
  onCancel: () => void;
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
  playerId: string;
  yakumanList: YakumanType[];
}

const STEPS = ['基本情報', '点数入力', '特記事項', '確認'];

export const GameForm: React.FC<GameFormProps> = ({
  leagueId,
  seasonId,
  onSuccess,
  onCancel,
}) => {
  const { players, league } = useLeagueStore();
  const { addGame } = useGameStore();
  const { addPost } = useTimelineStore();
  const { user } = useAuthStore();

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState(todayString());
  const [gameType, setGameType] = useState<'east' | 'south'>('south');

  const activePlayers = players.filter((p) => p.isActive).slice(0, 4);

  const [scores, setScores] = useState<ScoreEntry[]>(
    activePlayers.map((p, i) => ({
      playerId: p.id,
      score: 0,
      rank: i + 1,
      isFly: false,
    }))
  );

  const [yakumanEntries, setYakumanEntries] = useState<YakumanEntry[]>([]);
  const [chonboEntries, setChonboEntries] = useState<ChonboEntry[]>([]);
  const [selectedPlayerForYakuman, setSelectedPlayerForYakuman] = useState<string>(
    activePlayers[0]?.id ?? ''
  );
  const [notes, setNotes] = useState('');

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
  const isValidTotal = validateTotalScore(scores.map((s) => s.score));

  const points = useMemo(
    () => scores.map((s) => calcPoint(s.score, s.rank, settings)),
    [scores, settings]
  );

  const currentYakumanForPlayer = yakumanEntries.find(
    (e) => e.playerId === selectedPlayerForYakuman
  )?.yakumanList ?? [];

  const updateYakumanForPlayer = (playerId: string, yakumanList: YakumanType[]) => {
    const existing = yakumanEntries.find((e) => e.playerId === playerId);
    if (existing) {
      if (yakumanList.length === 0) {
        setYakumanEntries(yakumanEntries.filter((e) => e.playerId !== playerId));
      } else {
        setYakumanEntries(yakumanEntries.map((e) =>
          e.playerId === playerId ? { ...e, yakumanList } : e
        ));
      }
    } else if (yakumanList.length > 0) {
      setYakumanEntries([...yakumanEntries, { playerId, yakumanList }]);
    }
  };

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

      const events: GameEvent[] = [
        ...yakumanEntries.map((e) => ({
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

      const gameId = await addGame(
        leagueId,
        seasonId,
        { date, gameType, players: gamePlayers, events, notes },
        settings,
        user.uid
      );

      // Post yakuman flash to timeline
      for (const entry of yakumanEntries) {
        const player = activePlayers.find((p) => p.id === entry.playerId);
        if (player && entry.yakumanList.length > 0) {
          const flashMeta = {
            gameId: gameId || '',
            playerId: entry.playerId || '',
            yakumanList: entry.yakumanList || [],
          };
          await addPost(leagueId, {
            type: 'yakuman_flash',
            content: generateYakumanFlash(player.name, entry.yakumanList),
            triggeredBy: 'system',
            meta: flashMeta,
          });
        }
      }

      onSuccess();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const canProceed = [
    true, // Step 0: always ok
    isValidTotal && scores.some((s) => s.score > 0), // Step 1
    true, // Step 2
    !loading, // Step 3
  ][step];

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
        {/* Step 0: 基本情報 */}
        {step === 0 && (
          <motion.div
            key="step0"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div>
              <label className="text-sm text-white/60 block mb-2">対局日</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="text-sm text-white/60 block mb-2">種別</label>
              <div className="grid grid-cols-2 gap-2">
                {(['south', 'east'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setGameType(type)}
                    className={`py-3 rounded-xl border text-sm font-medium transition-all ${
                      gameType === type
                        ? 'bg-primary border-accent text-accent'
                        : 'bg-white/5 border-white/10 text-white/60'
                    }`}
                  >
                    {type === 'south' ? '半荘戦' : '東風戦'}
                  </button>
                ))}
              </div>
            </div>
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
              players={activePlayers}
              scores={scores}
              points={points}
              onChange={setScores}
              totalScore={totalScore}
              isValid={isValidTotal}
            />
          </motion.div>
        )}

        {/* Step 2: 特記事項 */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div>
              <p className="text-sm font-medium text-white/70 mb-2">役満の記録（任意）</p>
              <div className="flex gap-2 mb-3 flex-wrap">
                {activePlayers.map((p) => {
                  const hasYakuman = yakumanEntries.some((e) => e.playerId === p.id && e.yakumanList.length > 0);
                  return (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPlayerForYakuman(p.id)}
                      className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                        selectedPlayerForYakuman === p.id
                          ? 'bg-accent/20 border-accent text-accent'
                          : 'bg-white/5 border-white/10 text-white/60'
                      }`}
                    >
                      {hasYakuman && <Star className="w-3 h-3 inline mr-0.5 text-yellow-400" />}{p.name}
                    </button>
                  );
                })}
              </div>
              <YakumanSelector
                selected={currentYakumanForPlayer}
                onChange={(list) => updateYakumanForPlayer(selectedPlayerForYakuman, list)}
              />
            </div>

            <div>
              <p className="text-sm font-medium text-white/70 mb-2">チョンボの記録（任意）</p>
              <ChonboSelector
                players={activePlayers}
                value={chonboEntries}
                onChange={setChonboEntries}
              />
            </div>

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
            <p className="text-white/60 text-sm">{date} / {gameType === 'south' ? '半荘' : '東風'}</p>

            {scores
              .slice()
              .sort((a, b) => a.rank - b.rank)
              .map((s) => {
                const player = activePlayers.find((p) => p.id === s.playerId);
                const point = calcPoint(s.score, s.rank, settings);
                const rankColors = ['text-yellow-400', 'text-gray-300', 'text-amber-600', 'text-red-400'];
                const hasYakuman = yakumanEntries.find((e) => e.playerId === s.playerId);
                return (
                  <div
                    key={s.playerId}
                    className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-3 border border-white/10"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`font-bold text-lg ${rankColors[s.rank - 1]}`}>
                        {s.rank}位
                      </span>
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: player?.color }}
                      />
                      <span className="text-white font-medium">{player?.name}</span>
                      {hasYakuman && (
                        <span className="text-xs text-accent flex items-center gap-1"><Trophy className="w-3 h-3" />{hasYakuman.yakumanList.join('・')}</span>
                      )}
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

      {/* Navigation buttons */}
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
            onClick={() => setStep(step + 1)}
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
