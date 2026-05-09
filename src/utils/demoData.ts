import {
  collection,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import { Player, LeagueSettings } from '@/types';
import { calcPoint } from './pointCalc';
import { recalcStandings } from '@/stores/useGameStore';

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateScores(
  playerIds: string[],
  startPoints: number,
): Array<{ playerId: string; score: number; rank: number; isFly: boolean }> {
  const n = playerIds.length;
  const shuffled = [...playerIds].sort(() => Math.random() - 0.5);

  // sum of deltas = 0 を保証しつつ、各順位らしいスコア差を生成
  let deltas: number[];
  if (n === 4) {
    const d1 = randInt(8000, 25000);
    const d2 = randInt(-3000, 8000);
    const d3 = randInt(-13000, -2000);
    deltas = [d1, d2, d3, -(d1 + d2 + d3)];
  } else if (n === 3) {
    const d1 = randInt(6000, 18000);
    const d2 = randInt(-4000, 4000);
    deltas = [d1, d2, -(d1 + d2)];
  } else {
    // 5人以上: 簡易生成
    deltas = [];
    let sum = 0;
    for (let i = 0; i < n - 1; i++) {
      const d = randInt(-10000, 15000);
      deltas.push(d);
      sum += d;
    }
    deltas.push(-sum);
  }

  deltas.sort((a, b) => b - a);

  return shuffled.map((id, i) => {
    const score = startPoints + deltas[i];
    return { playerId: id, score, rank: i + 1, isFly: score < 0 };
  });
}

export async function generateDemoData(
  leagueId: string,
  seasonId: string,
  players: Player[],
  settings: LeagueSettings,
  sessionCount = 16,
): Promise<{ sessions: number; games: number }> {
  const activePlayers = players.filter((p) => p.isActive);
  const pc = Math.min(settings.playerCount, activePlayers.length);
  if (pc < 2) throw new Error('アクティブなプレイヤーが2人以上必要です');

  // 過去6か月に sessionCount 回分の日付を生成
  const now = new Date();
  const msSpan = 6 * 30 * 24 * 60 * 60 * 1000;
  const startMs = now.getTime() - msSpan;

  const dates: string[] = Array.from({ length: sessionCount }, (_, i) => {
    const ms = startMs + Math.round((msSpan / sessionCount) * i) + randInt(0, 2) * 86400000;
    return new Date(ms).toISOString().slice(0, 10);
  }).sort();

  let totalGames = 0;

  for (let s = 0; s < sessionCount; s++) {
    const date = dates[s];
    const gamesPerSession = randInt(3, 5); // 3〜5局/セッション
    const gameIds: string[] = [];

    // セッション毎に参加プレイヤーをランダムに pc 人選ぶ
    const sessionPlayers = [...activePlayers]
      .sort(() => Math.random() - 0.5)
      .slice(0, pc);
    const playerIds = sessionPlayers.map((p) => p.id);

    for (let g = 0; g < gamesPerSession; g++) {
      const scoreData = generateScores(playerIds, settings.startPoints);

      const events: Array<{ type: string; playerId: string }> = [];
      if (Math.random() < 0.06) {
        events.push({ type: 'yakuman', playerId: scoreData[0].playerId });
      }
      if (Math.random() < 0.04) {
        events.push({ type: 'chonbo', playerId: scoreData[pc - 1].playerId });
      }

      const playersWithPoints = scoreData.map((p) => ({
        ...p,
        point: calcPoint(p.score, p.rank, settings),
      }));

      const gameRef = await addDoc(
        collection(db, 'leagues', leagueId, 'seasons', seasonId, 'games'),
        {
          date,
          gameType: settings.gameType ?? 'south',
          players: playersWithPoints,
          events,
          notes: '',
          createdAt: serverTimestamp(),
          createdBy: 'demo',
        },
      );
      gameIds.push(gameRef.id);
      totalGames++;
    }

    await addDoc(
      collection(db, 'leagues', leagueId, 'seasons', seasonId, 'sessions'),
      {
        name: `第${s + 1}セッション`,
        date,
        gameIds,
        status: 'closed',
        createdAt: serverTimestamp(),
        createdBy: 'demo',
      },
    );
  }

  // 全対局挿入後に一括でstandings再計算
  await recalcStandings(leagueId, seasonId);

  return { sessions: sessionCount, games: totalGames };
}
