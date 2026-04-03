import { GameRecord, Player, Trophy, TrophyId } from '@/types';

export const TROPHY_DEFINITIONS: Record<TrophyId, Omit<Trophy, 'earnedAt'>> = {
  first_win: { id: 'first_win', name: '初優勝', emoji: '🏆', description: '初めて1位を獲得した' },
  three_consecutive_wins: { id: 'three_consecutive_wins', name: '3連勝', emoji: '🔥', description: '3連続で1位を獲得した' },
  ten_no_last: { id: 'ten_no_last', name: '10連続ラスなし', emoji: '💎', description: '10対局連続でラスを引かなかった' },
  season_champion: { id: 'season_champion', name: 'シーズン優勝', emoji: '👑', description: 'シーズン最終ポイント1位' },
  perfect_season: { id: 'perfect_season', name: 'パーフェクト', emoji: '🐉', description: 'シーズン全対局で1位' },
  max_score: { id: 'max_score', name: '最大素点', emoji: '💸', description: 'リーグ史上最高素点を記録' },
  first_fly: { id: 'first_fly', name: '初飛び', emoji: '☠️', description: '初めて飛んだ' },
  exact_zero: { id: 'exact_zero', name: 'ちょうど0点', emoji: '🎯', description: '素点がちょうど0点だった' },
  late_night: { id: 'late_night', name: '深夜の対局', emoji: '🌙', description: '23時以降の対局を記録した' },
  most_games: { id: 'most_games', name: '最多対局者', emoji: '📅', description: 'シーズン最多対局数を記録' },
  yakuman: { id: 'yakuman', name: '役満達成', emoji: '🀄', description: '役満を和了した' },
  double_yakuman: { id: 'double_yakuman', name: 'ダブル役満', emoji: '🔥', description: 'ダブル役満を和了した' },
  triple_yakuman: { id: 'triple_yakuman', name: 'トリプル役満', emoji: '🌟', description: 'トリプル役満を和了した' },
};

export function checkNewTrophies(
  games: GameRecord[],
  playerId: string,
  existingTrophies: TrophyId[]
): TrophyId[] {
  const newTrophies: TrophyId[] = [];
  const playerGames = games.filter((g) =>
    g.players.some((p) => p.playerId === playerId)
  );

  const playerResults = playerGames.map((g) =>
    g.players.find((p) => p.playerId === playerId)!
  );

  // 初優勝
  if (!existingTrophies.includes('first_win')) {
    if (playerResults.some((p) => p.rank === 1)) {
      newTrophies.push('first_win');
    }
  }

  // 3連勝
  if (!existingTrophies.includes('three_consecutive_wins')) {
    const sortedResults = playerResults.slice(-3);
    if (sortedResults.length >= 3 && sortedResults.every((p) => p.rank === 1)) {
      newTrophies.push('three_consecutive_wins');
    }
  }

  // 10連続ラスなし
  if (!existingTrophies.includes('ten_no_last')) {
    const recent10 = playerResults.slice(-10);
    if (recent10.length >= 10 && recent10.every((p) => p.rank !== 4)) {
      newTrophies.push('ten_no_last');
    }
  }

  // 初飛び
  if (!existingTrophies.includes('first_fly')) {
    if (playerResults.some((p) => p.isFly)) {
      newTrophies.push('first_fly');
    }
  }

  // ちょうど0点
  if (!existingTrophies.includes('exact_zero')) {
    if (playerResults.some((p) => p.score === 0)) {
      newTrophies.push('exact_zero');
    }
  }

  // 役満関連
  const yakumanGames = games.filter((g) =>
    g.events?.some(
      (e) => e.type === 'yakuman' && e.playerId === playerId && (e.yakumanList?.length ?? 0) > 0
    )
  );

  if (!existingTrophies.includes('yakuman') && yakumanGames.length > 0) {
    newTrophies.push('yakuman');
  }
  if (!existingTrophies.includes('double_yakuman')) {
    if (yakumanGames.some((g) =>
      g.events?.some(
        (e) => e.type === 'yakuman' && e.playerId === playerId && (e.yakumanList?.length ?? 0) >= 2
      )
    )) {
      newTrophies.push('double_yakuman');
    }
  }
  if (!existingTrophies.includes('triple_yakuman')) {
    if (yakumanGames.some((g) =>
      g.events?.some(
        (e) => e.type === 'yakuman' && e.playerId === playerId && (e.yakumanList?.length ?? 0) >= 3
      )
    )) {
      newTrophies.push('triple_yakuman');
    }
  }

  return newTrophies;
}
