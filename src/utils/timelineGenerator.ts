import { Player, YakumanType } from '@/types';
import { formatDateJa } from './pointCalc';

export function generateGameReport(
  dateStr: string,
  gameNumber: number,
  results: { player: Player; rank: number; point: number }[]
): string {
  const sorted = [...results].sort((a, b) => a.rank - b.rank);
  const rankLabels = ['1位', '2位', '3位', '4位'];
  const lines = sorted.map((r) => {
    const sign = r.point > 0 ? '+' : '';
    return `${rankLabels[r.rank - 1]}：${r.player.name} ${sign}${r.point.toFixed(1)}pt`;
  });
  const winner = sorted[0].player.name;
  return [
    `1半荘の結果報告です！`,
    `${formatDateJa(dateStr)} 第${gameNumber}局\n`,
    ...lines,
    `\n${winner}さん、おめでとうございます！`,
  ].join('\n');
}

export function generateDailyReport(
  dateStr: string,
  totalGames: number,
  results: { player: Player; totalPoint: number; gamesPlayed: number }[]
): string {
  const sorted = [...results].sort((a, b) => b.totalPoint - a.totalPoint);
  const rankLabels = ['1位', '2位', '3位', '4位'];
  const lines = sorted.map((r, i) => {
    const sign = r.totalPoint > 0 ? '+' : '';
    return `${rankLabels[i]}：${r.player.name} ${sign}${r.totalPoint.toFixed(1)}pt（${r.gamesPlayed}局）`;
  });
  const winner = sorted[0].player.name;
  return [
    `皆様、お疲れ様です！`,
    `${formatDateJa(dateStr)}の対局結果です。（全${totalGames}局）\n`,
    `【累計ポイント】`,
    ...lines,
    `\n${winner}さん、おめでとうございます！`,
    `次回の対局も頑張りましょう！`,
  ].join('\n');
}

export function generateSessionReport(
  sessionName: string,
  dateStr: string,
  totalGames: number,
  results: { player: Player; totalPoint: number; gamesPlayed: number }[]
): string {
  const sorted = [...results].sort((a, b) => b.totalPoint - a.totalPoint);
  const rankLabels = ['1位', '2位', '3位', '4位'];
  const lines = sorted.map((r, i) => {
    const sign = r.totalPoint > 0 ? '+' : '';
    return `${rankLabels[i]}：${r.player.name} ${sign}${r.totalPoint.toFixed(1)}pt（${r.gamesPlayed}局）`;
  });
  const winner = sorted[0].player.name;
  return [
    `【セッション結果】`,
    `${formatDateJa(dateStr)}　${sessionName}（全${totalGames}局）\n`,
    `【累計ポイント】`,
    ...lines,
    `\n${winner}さん、おめでとうございます！`,
    `次回の対局も頑張りましょう！`,
  ].join('\n');
}

export function generateChonboFlash(
  playerName: string,
  chonboType: string,
): string {
  return [
    `【チョンボ速報⚡】`,
    `${playerName} さんが、チョンボをしました！`,
    `（内容：${chonboType}）`,
    `-20ptのペナルティです。`,
  ].join('\n');
}

export function generateYakumanFlash(
  playerName: string,
  yakumanList: YakumanType[]
): string {
  const isDouble = yakumanList.length >= 2;
  const yakuStr = yakumanList.join(' + ');
  const prefix = isDouble ? `【ダブル役満速報🔥】` : `【役満速報⚡】`;
  return [
    prefix,
    `${playerName} さんが、`,
    `${yakuStr} を和了しました！`,
    `おめでとうございます！🀄`,
  ].join('\n');
}
