import { YakumanType, ChonboType } from '@/types';

export type SeatWind = 'east' | 'south' | 'west' | 'north';

export const WIND_ORDER: SeatWind[] = ['east', 'south', 'west', 'north'];

export const WIND_LABELS: Record<SeatWind, string> = {
  east: '東',
  south: '南',
  west: '西',
  north: '北',
};

export interface DraftScoreEntry {
  playerId: string;
  score: number;
  rank: number;
  isFly: boolean;
}

export interface DraftYakumanEntry {
  id: string;
  playerId: string;
  yakumanList: YakumanType[];
}

export interface DraftChonboEntry {
  playerId: string;
  chonboType: ChonboType;
  note?: string;
}

export interface DraftHanchaEntry {
  hanchaIndex: number;
  scores: DraftScoreEntry[];
  yakumanEntries: DraftYakumanEntry[];
  chonboEntries: DraftChonboEntry[];
  notes: string;
}

export interface DraftSessionData {
  leagueId: string;
  seasonId: string;
  date: string;
  sessionName: string;
  selectedPlayerIds: string[];
  // キー: ブロック開始インデックスの文字列 ("0", "4", "8", ...) → 座席マップ
  seatMaps: Record<string, Record<string, SeatWind>>;
  completedHancha: DraftHanchaEntry[];
  // 現在入力中の状態
  currentHanchaIndex: number;
  currentStep: 'seat' | 'score';
  currentSeatMap: Record<string, SeatWind>;
  currentScores: DraftScoreEntry[];
  currentYakuman: DraftYakumanEntry[];
  currentChonbo: DraftChonboEntry[];
  currentNotes: string;
  savedAt: string;
}

const DRAFT_KEY = 'session_wizard_draft';

export function saveDraft(data: Omit<DraftSessionData, 'savedAt'>): void {
  try {
    localStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({ ...data, savedAt: new Date().toISOString() })
    );
  } catch {}
}

export function loadDraft(): DraftSessionData | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? (JSON.parse(raw) as DraftSessionData) : null;
  } catch {
    return null;
  }
}

export function clearDraft(): void {
  localStorage.removeItem(DRAFT_KEY);
}

export function getBlockStart(hanchaIndex: number): number {
  return Math.floor(hanchaIndex / 4) * 4;
}

/** 半荘インデックスから起家のプレイヤーIDを取得 */
export function getOyaPlayerId(
  hanchaIndex: number,
  seatMaps: Record<string, Record<string, SeatWind>>
): string | null {
  const blockStart = getBlockStart(hanchaIndex);
  const seatMap = seatMaps[String(blockStart)];
  if (!seatMap) return null;
  const wind = WIND_ORDER[hanchaIndex % 4];
  return Object.entries(seatMap).find(([, w]) => w === wind)?.[0] ?? null;
}

export function isBlockStart(hanchaIndex: number): boolean {
  return hanchaIndex % 4 === 0;
}
