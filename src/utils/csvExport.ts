import { GameRecord, Player } from '@/types';
import { formatDateJa } from './pointCalc';

export function exportGamesToCSV(games: GameRecord[], players: Player[]): string {
  const header = ['日付', '種別', '1位', '素点', '2位', '素点', '3位', '素点', '4位', '素点'].join(',');
  const playerMap = new Map(players.map((p) => [p.id, p.name]));

  const rows = games.map((g) => {
    const sorted = [...g.players].sort((a, b) => a.rank - b.rank);
    const cols = [
      g.date,
      g.gameType === 'south' ? '半荘' : '東風',
      ...sorted.flatMap((p) => [playerMap.get(p.playerId) ?? '?', p.score.toString()]),
    ];
    return cols.join(',');
  });

  return [header, ...rows].join('\n');
}

export function downloadCSV(content: string, filename: string): void {
  const bom = '\uFEFF';
  const blob = new Blob([bom + content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
