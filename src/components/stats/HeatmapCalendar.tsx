import React from 'react';
import { GameRecord } from '@/types';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from 'date-fns';
import { ja } from 'date-fns/locale';

interface HeatmapCalendarProps {
  games: GameRecord[];
  month: Date;
}

export const HeatmapCalendar: React.FC<HeatmapCalendarProps> = ({ games, month }) => {
  const start = startOfMonth(month);
  const end = endOfMonth(month);
  const days = eachDayOfInterval({ start, end });

  const gamesByDate = new Map<string, number>();
  for (const g of games) {
    gamesByDate.set(g.date, (gamesByDate.get(g.date) ?? 0) + 1);
  }

  const startDow = getDay(start); // 0=Sun
  const weekdays = ['日', '月', '火', '水', '木', '金', '土'];

  const intensityClass = (count: number) => {
    if (count === 0) return 'bg-white/5';
    if (count === 1) return 'bg-green-900/60';
    if (count === 2) return 'bg-green-700/70';
    return 'bg-green-500/80';
  };

  return (
    <div>
      <p className="text-sm font-medium text-white/70 mb-3">
        {format(month, 'yyyy年M月', { locale: ja })}
      </p>
      <div className="grid grid-cols-7 gap-1">
        {weekdays.map((d) => (
          <p key={d} className="text-center text-[10px] text-white/30 pb-1">{d}</p>
        ))}
        {Array.from({ length: startDow }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {days.map((day) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const count = gamesByDate.get(dateStr) ?? 0;
          return (
            <div
              key={dateStr}
              title={count > 0 ? `${count}対局` : ''}
              className={`aspect-square rounded-md flex items-center justify-center text-[10px] font-medium transition-colors ${intensityClass(count)} ${count > 0 ? 'text-white' : 'text-white/20'}`}
            >
              {format(day, 'd')}
            </div>
          );
        })}
      </div>
    </div>
  );
};
