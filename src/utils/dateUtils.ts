import { format, isToday, isYesterday, differenceInDays } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Timestamp } from 'firebase/firestore';

export function toDate(value: any): Date {
  if (!value) return new Date();
  if (value instanceof Timestamp) return value.toDate();
  if (value instanceof Date) return value;
  if (typeof value === 'string') return new Date(value);
  if (typeof value?.toDate === 'function') return value.toDate();
  // Firestore Timestamp がシリアライズされたプレーンオブジェクト {seconds, nanoseconds} の場合
  if (typeof value?.seconds === 'number') return new Date(value.seconds * 1000);
  return new Date(value);
}

export function formatRelativeDate(value: any): string {
  const date = toDate(value);
  if (isToday(date)) return '今日';
  if (isYesterday(date)) return '昨日';
  const diff = differenceInDays(new Date(), date);
  if (diff < 7) return `${diff}日前`;
  return format(date, 'M月d日', { locale: ja });
}

export function formatFullDate(value: any): string {
  const date = toDate(value);
  return format(date, 'yyyy年M月d日(E)', { locale: ja });
}

export function formatTime(value: any): string {
  const date = toDate(value);
  return format(date, 'HH:mm', { locale: ja });
}

export function todayString(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export function isLateNight(date: Date): boolean {
  return date.getHours() >= 23;
}
