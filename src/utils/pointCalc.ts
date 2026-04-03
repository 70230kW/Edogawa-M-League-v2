import { LeagueSettings } from '@/types';

export const M_LEAGUE_SETTINGS: LeagueSettings = {
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

/**
 * Mリーグ公式ポイント計算
 * 例: 35800点 2位 → (35800-30000)/1000 + 10 = +15.8p
 *     41600点 1位 → (41600-30000)/1000 + 50 + 20 = +81.6p
 */
export function calcPoint(
  score: number,
  rank: number,
  settings: LeagueSettings = M_LEAGUE_SETTINGS
): number {
  const basePoint = Math.round((score - settings.returnPoints) / 100) / 10;
  const rankPoint = settings.rankPoints[rank - 1];
  const okaPoint = rank === 1 ? settings.oka : 0;
  return Math.round((basePoint + rankPoint + okaPoint) * 10) / 10;
}

/** 点数整合性チェック：4人の素点合計 = 100,000点 */
export function validateTotalScore(scores: number[]): boolean {
  return scores.reduce((a, b) => a + b, 0) === 100000;
}

/** 日本語曜日付き日付フォーマット */
const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];
export function formatDateJa(dateStr: string): string {
  const d = new Date(dateStr);
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const day = d.getDate();
  const w = WEEKDAYS[d.getDay()];
  return `${y}年${m}月${day}日(${w})`;
}

/** ポイントの符号付き文字列 */
export function formatPoint(point: number): string {
  if (point > 0) return `+${point.toFixed(1)}`;
  return point.toFixed(1);
}

/** 累積ポイントを計算 */
export function calcCumulativePoints(
  games: Array<{ players: Array<{ playerId: string; point: number }> }>,
  playerId: string
): number[] {
  let cumulative = 0;
  const result: number[] = [];
  for (const game of games) {
    const player = game.players.find((p) => p.playerId === playerId);
    if (player) {
      cumulative += player.point;
      result.push(Math.round(cumulative * 10) / 10);
    }
  }
  return result;
}
