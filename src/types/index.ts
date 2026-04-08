// 役満
export type YakumanType =
  | '天和' | '地和' | '国士無双' | '四暗刻'
  | '大三元' | '緑一色' | '字一色'
  | '小四喜' | '大四喜' | '清老頭'
  | '四槓子' | '九蓮宝燈';

// チョンボ種別
export type ChonboType =
  | '誤ロン' | 'ノーテンリーチ' | 'リーチ後不正カン'
  | '牌山崩し' | 'その他';

// 対局内イベント
export interface GameEvent {
  type: 'yakuman' | 'chonbo';
  playerId: string;
  yakumanList?: YakumanType[];
  chonboType?: ChonboType;
  chonboNote?: string;
}

// 対局プレイヤー
export interface GamePlayer {
  playerId: string;
  rank: number;
  score: number;
  point: number;
  isFly?: boolean;
}

// 対局記録
export interface GameRecord {
  id: string;
  date: string;
  gameType: 'east' | 'south';
  players: GamePlayer[];
  events?: GameEvent[];
  notes?: string;
  createdAt: Date;
  createdBy: string;
}

// タイムライン投稿メタ
export interface DailyReportMeta {
  date: string;
  results: { playerId: string; rank: number; totalPoint: number }[];
}

export interface YakumanFlashMeta {
  gameId: string;
  playerId: string;
  yakumanList: YakumanType[];
}

export interface ManualMeta {
  authorId: string;
}

// タイムライン投稿
export interface TimelinePost {
  id: string;
  type: 'daily_report' | 'yakuman_flash' | 'manual';
  content: string;
  createdAt: Date;
  triggeredBy: 'system' | string;
  meta: DailyReportMeta | YakumanFlashMeta | ManualMeta;
  reactions: Record<string, string[]>;
}

// プレイヤー
export interface Player {
  id: string;
  name: string;
  color: string;
  createdAt: Date;
  isActive: boolean;
}

// シーズン
export interface Season {
  id: string;
  name: string;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  status: 'active' | 'finished';
}

// 成績集計
export interface Standing {
  playerId: string;
  totalGames: number;
  totalPoint: number;
  avgRank: number;
  top1Rate: number;
  top2Rate: number;
  lastRate: number;
  lastUpdated: Date;
}

// リーグ設定
export interface LeagueSettings {
  startPoints: number;
  returnPoints: number;
  rankPoints: number[];
  oka: number;
  playerCount: number;
  gameType: 'east' | 'south';
  hasRedDora: boolean;
  hasUraDora: boolean;
  chonboPenalty: number;
}

// リーグ
export interface League {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  ownerId: string;
  settings: LeagueSettings;
}

// トロフィー
export type TrophyRank = 'bronze' | 'silver' | 'gold' | 'platinum' | 'crystal' | 'chaos';

export interface TrophyDefinition {
  id: string;
  name: string;
  description: string;
  comment: string;
  rank: TrophyRank;
  icon: string;
  manual?: boolean; // true = 自己申告のみ（自動検出不可）
}

export interface UnlockedTrophy {
  trophyId: string;
  unlockedAt: Date;
  gameId?: string;
}

// 招待コード
export interface InviteCode {
  id: string;
  leagueId: string;
  createdBy: string;
  createdAt: Date;
  expiresAt: Date;
  usedBy: string[];
}
