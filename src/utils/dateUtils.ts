import { format, isToday, isYesterday, differenceInDays } from 'date-fns';
import { ja } from 'date-fns/locale';

export function formatRelativeDate(date: Date): string {
  if (isToday(date)) return '今日';
  if (isYesterday(date)) return '昨日';
  const diff = differenceInDays(new Date(), date);
  if (diff < 7) return `${diff}日前`;
  return format(date, 'M月d日', { locale: ja });
}

export function formatFullDate(date: Date): string {
  return format(date, 'yyyy年M月d日(E)', { locale: ja });
}

export function formatTime(date: Date): string {
  return format(date, 'HH:mm', { locale: ja });
}

export function todayString(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export function isLateNight(date: Date): boolean {
  return date.getHours() >= 23;
}
