import { Player, YakumanType } from '@/types';
import { formatDateJa } from './pointCalc';

export function generateDailyReport(
  dateStr: string,
  results: { player: Player; totalPoint: number }[]
): string {
  const sorted = [...results].sort((a, b) => b.totalPoint - a.totalPoint);
  const rankEmojis = ['🥇', '🥈', '🥉', '4️⃣'];
  const lines = sorted.map((r, i) => {
    const sign = r.totalPoint > 0 ? '+' : '';
    return `${rankEmojis[i]} ${r.player.name}　${sign}${r.totalPoint.toFixed(1)} pt`;
  });
  const winner = sorted[0].player.name;
  return [
    `皆様、お疲れ様です！`,
    `${formatDateJa(dateStr)}の対局結果です。\n`,
    ...lines,
    `\n${winner}さん、おめでとうございます！🎉`,
    `次回の対局も頑張りましょう！`,
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
