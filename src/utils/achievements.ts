import { GameRecord, TrophyDefinition, TrophyRank, YakumanType } from '@/types';

// ─────────────────────────────────────────────────────────────
// 全トロフィー定義
// ─────────────────────────────────────────────────────────────
export const TROPHY_DEFINITIONS: Record<string, TrophyDefinition> = {
  // ── ブロンズ ──────────────────────────────────────────────
  first_game: {
    id: 'first_game', rank: 'bronze', icon: '🀄',
    name: '雀卓への第一歩',
    description: '初めて対局結果を記録する',
    comment: '長い旅路の始まり。これが全ての始まりだ。',
  },
  first_win: {
    id: 'first_win', rank: 'bronze', icon: '🥇',
    name: '初陣の凱歌',
    description: '初めて1位（トップ）を獲得する',
    comment: '勝利の味はどうだ？この感覚を忘れるな。',
  },
  first_last: {
    id: 'first_last', rank: 'bronze', icon: '💀',
    name: '洗礼',
    description: '初めて4位（ラス）を経験する',
    comment: '誰でも最初はここから。敗北を知れ。',
  },
  game_10: {
    id: 'game_10', rank: 'bronze', icon: '🎯',
    name: '運命の輪は廻り始めた',
    description: '合計10回対局する',
    comment: '10回の対局。牌の声が聞こえ始めた気がする。',
  },
  score_50k: {
    id: 'score_50k', rank: 'bronze', icon: '⚡',
    name: '天運の兆し',
    description: '1回の対局で素点が50,000点を超える',
    comment: '天は見ている。今日はあなたの日だ。',
  },
  point_minus_30: {
    id: 'point_minus_30', rank: 'bronze', icon: '💸',
    name: '参加費ごちそうさまです',
    description: '1回の対局の収支が-30.0を下回る',
    comment: 'ごちそうさまでした。次は逆に貢いでもらおう。',
  },

  // ── シルバー ──────────────────────────────────────────────
  wins_10: {
    id: 'wins_10', rank: 'silver', icon: '🏆',
    name: '勝利の味を知った者',
    description: '通算トップ回数が10回に到達する',
    comment: '10回のトップ。勝負師の資格が見え始めた。',
  },
  no_last_5: {
    id: 'no_last_5', rank: 'silver', icon: '☀️',
    name: '沈まぬ太陽',
    description: '5回連続でラスを回避する（3位以上）',
    comment: '5連続で沈まない太陽のような存在。',
  },
  yakuman_any: {
    id: 'yakuman_any', rank: 'silver', icon: '🌸',
    name: '夢の花、咲く',
    description: '役満を和了る',
    comment: '役満。麻雀の夢が現実となった瞬間。',
  },
  game_50: {
    id: 'game_50', rank: 'silver', icon: '📜',
    name: '五十戦の刻印',
    description: '合計50回対局する',
    comment: '50戦。その経験はもはや語り草だ。',
  },
  point_plus_50: {
    id: 'point_plus_50', rank: 'silver', icon: '💥',
    name: '力の奔流',
    description: '1回の対局でプラス収支が+50.0を超える',
    comment: '圧倒的な力の奔流。場を支配した証。',
  },

  // ── ゴールド ──────────────────────────────────────────────
  game_100: {
    id: 'game_100', rank: 'gold', icon: '⚔️',
    name: '百戦錬磨',
    description: '合計100回対局する',
    comment: '100戦。あなたはもう立派なリーグ戦士だ。',
  },
  consecutive_wins_3: {
    id: 'consecutive_wins_3', rank: 'gold', icon: '🔥',
    name: '破竹の勢い',
    description: '3連続でトップを獲得する',
    comment: '三連続トップ。誰もあなたを止められない。',
  },
  no_last_10: {
    id: 'no_last_10', rank: 'gold', icon: '💎',
    name: '絶対的ラス回避能力者',
    description: '10回連続でラスを回避する',
    comment: '10連続ラスなし。もはや別次元の存在。',
  },
  monthly_top: {
    id: 'monthly_top', rank: 'gold', icon: '🌙',
    name: '月下の勝者',
    description: '月間収支で1位になる',
    comment: '月の頂点に立った者。今月はあなたのものだ。',
  },

  // ── プラチナ ──────────────────────────────────────────────
  annual_top: {
    id: 'annual_top', rank: 'platinum', icon: '⭐',
    name: '星霜の覇者',
    description: '年間収支で1位になる',
    comment: '年間覇者。一年を通じて最強であることを証明した。',
  },
  consecutive_wins_5: {
    id: 'consecutive_wins_5', rank: 'platinum', icon: '🏛️',
    name: '神に愛されし五連祭壇',
    description: '5連続でトップを獲得する',
    comment: '5連続トップ。神に愛された者だけが到達できる境地。',
  },
  point_1000: {
    id: 'point_1000', rank: 'platinum', icon: '🔭',
    name: '盤上の天文学者',
    description: '通算収支が+1000.0を超える',
    comment: '1000ポイント超え。宇宙の法則を手中に収めた。',
  },
  game_500: {
    id: 'game_500', rank: 'platinum', icon: '🗡️',
    name: '五百戦の修羅',
    description: '合計500回対局する',
    comment: '500戦の修羅道。あなたは麻雀に人生を懸けた。',
  },
  no_last_20: {
    id: 'no_last_20', rank: 'platinum', icon: '🌌',
    name: '天衣無縫',
    description: '20回連続でラスを回避する',
    comment: '20連続ラスなし。天衣無縫の境地に達した者。',
  },

  // ── クリスタル ────────────────────────────────────────────
  yakuman_tenhou: {
    id: 'yakuman_tenhou', rank: 'crystal', icon: '⚡',
    name: '天和ノ神慮',
    description: '天和を和了る',
    comment: '天の采配。神慮が下った瞬間を目撃した。',
  },
  yakuman_chihou: {
    id: 'yakuman_chihou', rank: 'crystal', icon: '🌍',
    name: '地和ノ奇跡',
    description: '地和を和了る',
    comment: '大地の奇跡。地和は運命が引き寄せた答え。',
  },
  yakuman_suanko: {
    id: 'yakuman_suanko', rank: 'crystal', icon: '🕶️',
    name: '闇に潜む暗殺者',
    description: '四暗刻を和了る',
    comment: '四暗刻。沈黙の中に宿る絶対的な力。',
  },
  yakuman_daisangen: {
    id: 'yakuman_daisangen', rank: 'crystal', icon: '🐉',
    name: '三元龍ノ集結',
    description: '大三元を和了る',
    comment: '三元牌が揃った時、龍は空へと舞い上がる。',
  },
  yakuman_ryuiso: {
    id: 'yakuman_ryuiso', rank: 'crystal', icon: '🍀',
    name: '緑一色ノ衝撃',
    description: '緑一色を和了る',
    comment: '緑に染まった牌山。大地の色で染め上げた。',
  },
  yakuman_tsuiso: {
    id: 'yakuman_tsuiso', rank: 'crystal', icon: '🌀',
    name: '万象無色ノ刻',
    description: '字一色を和了る',
    comment: '字牌のみで創り上げた宇宙。万象は無色に帰す。',
  },
  yakuman_chinroto: {
    id: 'yakuman_chinroto', rank: 'crystal', icon: '🐲',
    name: '老いたる龍ノ咆哮',
    description: '清老頭を和了る',
    comment: '老いた龍が最後に放つ咆哮。9と1だけの世界。',
  },
  yakuman_shosushi: {
    id: 'yakuman_shosushi', rank: 'crystal', icon: '🌬️',
    name: '風ノ円舞曲',
    description: '小四喜を和了る',
    comment: '風牌の三つが揃い、円舞曲が奏でられる。',
  },
  yakuman_sikantu: {
    id: 'yakuman_sikantu', rank: 'crystal', icon: '🏰',
    name: '四天開闢ノ王',
    description: '四槓子を和了る',
    comment: '四つのカンで世界が開かれた。王者の証。',
  },
  game_1000: {
    id: 'game_1000', rank: 'crystal', icon: '🌠',
    name: '無窮の探求者',
    description: '合計1000回対局する',
    comment: '1000戦。終わりなき探求の果てに何を見た？',
  },

  // ── カオス ────────────────────────────────────────────────
  yakuman_kokushi: {
    id: 'yakuman_kokushi', rank: 'chaos', icon: '💀',
    name: '終焉を告げる十三の使徒',
    description: '国士無双を和了る',
    comment: '十三の孤独な使徒が揃った時、終焉の扉が開く。',
  },
  yakuman_churenko: {
    id: 'yakuman_churenko', rank: 'chaos', icon: '🕯️',
    name: '神ノ燈火',
    description: '九蓮宝燈を和了る',
    comment: '九蓮の燈火が灯った時、神は微笑む。',
  },
  yakuman_daisushi: {
    id: 'yakuman_daisushi', rank: 'chaos', icon: '🌪️',
    name: '四喜ノ風神',
    description: '大四喜を和了る',
    comment: '四つの風が揃い、嵐が生まれた。風神の降臨。',
  },
  chaos_suanko_tanki: {
    id: 'chaos_suanko_tanki', rank: 'chaos', icon: '👑',
    name: '孤独なる皇帝',
    description: '四暗刻単騎待ちを和了る（自己申告）',
    comment: '皇帝は孤独だ。しかし、その孤独が最強を生む。',
    manual: true,
  },
  chaos_ron_discard: {
    id: 'chaos_ron_discard', rank: 'chaos', icon: '🎁',
    name: '最高の贈り物',
    description: '役満を放銃する（自己申告）',
    comment: '最高の贈り物を届けてしまった。次は受け取る番だ。',
    manual: true,
  },
  last_3_consecutive: {
    id: 'last_3_consecutive', rank: 'chaos', icon: '🌑',
    name: '奈落の三連星',
    description: '3連続でラスを経験する',
    comment: '三連続ラス。奈落の底で三つの星が瞬く。',
  },
  daily_all_ranks: {
    id: 'daily_all_ranks', rank: 'chaos', icon: '🎭',
    name: '人生の縮図',
    description: '1日でトップ・2位・3位・ラスを全て経験する',
    comment: '一日で全順位を経験した。人生とはかくも不条理だ。',
  },
  point_minus_100: {
    id: 'point_minus_100', rank: 'chaos', icon: '🕳️',
    name: '全ての理不尽をその身に受けし者',
    description: '収支が-100.0を下回る',
    comment: '理不尽の極み。しかし、ここから復活する者こそが真の猛者だ。',
  },
};

// ランク順序（表示用）
export const RANK_ORDER: TrophyRank[] = ['bronze', 'silver', 'gold', 'platinum', 'crystal', 'chaos'];

// ランク表示設定
export const RANK_META: Record<TrophyRank, { label: string; color: string; bg: string; border: string; glow: string }> = {
  bronze:   { label: '🥉 ブロンズ',   color: '#cd7f32', bg: 'rgba(205,127,50,0.15)',   border: 'rgba(205,127,50,0.4)',   glow: '0 0 15px rgba(205,127,50,0.4)' },
  silver:   { label: '🥈 シルバー',   color: '#c0c0c0', bg: 'rgba(192,192,192,0.12)',  border: 'rgba(192,192,192,0.35)', glow: '0 0 15px rgba(192,192,192,0.3)' },
  gold:     { label: '🥇 ゴールド',   color: '#ffd700', bg: 'rgba(255,215,0,0.15)',    border: 'rgba(255,215,0,0.4)',    glow: '0 0 20px rgba(255,215,0,0.5)' },
  platinum: { label: '💠 プラチナ',   color: '#a8d8ff', bg: 'rgba(168,216,255,0.12)',  border: 'rgba(168,216,255,0.35)', glow: '0 0 20px rgba(168,216,255,0.4)' },
  crystal:  { label: '✨ クリスタル', color: '#00ffcc', bg: 'rgba(0,255,204,0.12)',    border: 'rgba(0,255,204,0.35)',   glow: '0 0 25px rgba(0,255,204,0.5)' },
  chaos:    { label: '🌀 カオス',     color: '#ff00ff', bg: 'rgba(255,0,255,0.12)',    border: 'rgba(255,0,255,0.35)',   glow: '0 0 25px rgba(255,0,255,0.5)' },
};

// ─────────────────────────────────────────────────────────────
// ヘルパー
// ─────────────────────────────────────────────────────────────
function hasConsecutiveStreak(
  arr: number[],
  length: number,
  predicate: (v: number) => boolean
): boolean {
  if (arr.length < length) return false;
  for (let i = 0; i <= arr.length - length; i++) {
    if (arr.slice(i, i + length).every(predicate)) return true;
  }
  return false;
}

function hasYakumanType(
  playerId: string,
  games: GameRecord[],
  type: YakumanType
): boolean {
  return games.some(g =>
    g.events?.some(e =>
      e.type === 'yakuman' &&
      e.playerId === playerId &&
      e.yakumanList?.includes(type)
    )
  );
}

function isTopInPeriod(
  playerId: string,
  allGames: GameRecord[],
  periodPrefix: string  // 'YYYY-MM' or 'YYYY'
): boolean {
  const periodGames = allGames.filter(g => g.date.startsWith(periodPrefix));
  if (periodGames.length === 0) return false;

  const allPlayerIds = new Set<string>();
  periodGames.forEach(g => g.players.forEach(p => allPlayerIds.add(p.playerId)));
  if (allPlayerIds.size < 2) return false; // 比較相手がいない

  const getTotal = (pid: string) =>
    periodGames
      .flatMap(g => g.players.filter(p => p.playerId === pid))
      .reduce((sum, p) => sum + p.point, 0);

  const myTotal = getTotal(playerId);
  if (myTotal <= 0) return false;

  for (const pid of allPlayerIds) {
    if (pid !== playerId && getTotal(pid) >= myTotal) return false;
  }
  return true;
}

// ─────────────────────────────────────────────────────────────
// 実績チェック（メイン）
// allLeagueGames: リーグ内の全対局（日付昇順）
// existingIds:   既に解除済みのトロフィーID
// triggerGameId: 今回追加された対局のID
// ─────────────────────────────────────────────────────────────
export function checkAchievementsForPlayer(
  playerId: string,
  allLeagueGames: GameRecord[],
  existingIds: Set<string>,
  triggerGameId: string
): { trophyId: string; gameId: string }[] {
  // 日付昇順でソート
  const sortedGames = [...allLeagueGames].sort((a, b) => a.date.localeCompare(b.date));

  // このプレイヤーが参加した対局のみ
  const playerGames = sortedGames.filter(g =>
    g.players.some(p => p.playerId === playerId)
  );
  // プレイヤーの結果（順番通り）
  const results = playerGames.map(g =>
    g.players.find(p => p.playerId === playerId)!
  );

  const ranks = results.map(r => r.rank);
  const scores = results.map(r => r.score);
  const points = results.map(r => r.point);
  const totalGames = results.length;
  const totalPoint = points.reduce((s, v) => s + v, 0);
  const win1Count = ranks.filter(r => r === 1).length;

  const newTrophies: { trophyId: string; gameId: string }[] = [];

  const unlock = (id: string) => {
    if (!existingIds.has(id) && TROPHY_DEFINITIONS[id] && !TROPHY_DEFINITIONS[id].manual) {
      newTrophies.push({ trophyId: id, gameId: triggerGameId });
    }
  };

  // ── ブロンズ ──────────────────────────────────────────────
  if (totalGames >= 1) unlock('first_game');
  if (ranks.some(r => r === 1)) unlock('first_win');
  if (ranks.some(r => r === 4)) unlock('first_last');
  if (totalGames >= 10) unlock('game_10');
  if (scores.some(s => s > 50000)) unlock('score_50k');
  if (points.some(p => p < -30)) unlock('point_minus_30');

  // ── シルバー ──────────────────────────────────────────────
  if (win1Count >= 10) unlock('wins_10');
  if (hasConsecutiveStreak(ranks, 5, r => r !== 4)) unlock('no_last_5');
  // 役満（いずれかの種類）
  if (playerGames.some(g => g.events?.some(e => e.type === 'yakuman' && e.playerId === playerId && (e.yakumanList?.length ?? 0) > 0))) {
    unlock('yakuman_any');
  }
  if (totalGames >= 50) unlock('game_50');
  if (points.some(p => p > 50)) unlock('point_plus_50');

  // ── ゴールド ──────────────────────────────────────────────
  if (totalGames >= 100) unlock('game_100');
  if (hasConsecutiveStreak(ranks, 3, r => r === 1)) unlock('consecutive_wins_3');
  if (hasConsecutiveStreak(ranks, 10, r => r !== 4)) unlock('no_last_10');
  // 月間1位（直近の対局の月で判定）
  const latestGame = playerGames[playerGames.length - 1];
  if (latestGame) {
    const month = latestGame.date.slice(0, 7); // YYYY-MM
    if (isTopInPeriod(playerId, sortedGames, month)) unlock('monthly_top');
  }

  // ── プラチナ ──────────────────────────────────────────────
  if (totalGames >= 500) unlock('game_500');
  if (hasConsecutiveStreak(ranks, 5, r => r === 1)) unlock('consecutive_wins_5');
  if (totalPoint >= 1000) unlock('point_1000');
  if (hasConsecutiveStreak(ranks, 20, r => r !== 4)) unlock('no_last_20');
  // 年間1位
  if (latestGame) {
    const year = latestGame.date.slice(0, 4); // YYYY
    if (isTopInPeriod(playerId, sortedGames, year)) unlock('annual_top');
  }

  // ── クリスタル（役満種別）────────────────────────────────
  if (hasYakumanType(playerId, playerGames, '天和')) unlock('yakuman_tenhou');
  if (hasYakumanType(playerId, playerGames, '地和')) unlock('yakuman_chihou');
  if (hasYakumanType(playerId, playerGames, '四暗刻')) unlock('yakuman_suanko');
  if (hasYakumanType(playerId, playerGames, '大三元')) unlock('yakuman_daisangen');
  if (hasYakumanType(playerId, playerGames, '緑一色')) unlock('yakuman_ryuiso');
  if (hasYakumanType(playerId, playerGames, '字一色')) unlock('yakuman_tsuiso');
  if (hasYakumanType(playerId, playerGames, '清老頭')) unlock('yakuman_chinroto');
  if (hasYakumanType(playerId, playerGames, '小四喜')) unlock('yakuman_shosushi');
  if (hasYakumanType(playerId, playerGames, '四槓子')) unlock('yakuman_sikantu');
  if (totalGames >= 1000) unlock('game_1000');

  // ── カオス ────────────────────────────────────────────────
  if (hasYakumanType(playerId, playerGames, '国士無双')) unlock('yakuman_kokushi');
  if (hasYakumanType(playerId, playerGames, '九蓮宝燈')) unlock('yakuman_churenko');
  if (hasYakumanType(playerId, playerGames, '大四喜')) unlock('yakuman_daisushi');
  // 3連続ラス
  if (hasConsecutiveStreak(ranks, 3, r => r === 4)) unlock('last_3_consecutive');
  // 1日で全順位
  if (latestGame) {
    const sameDay = playerGames.filter(g => g.date === latestGame.date);
    const dayRanks = new Set(sameDay.map(g => g.players.find(p => p.playerId === playerId)?.rank));
    if ([1, 2, 3, 4].every(r => dayRanks.has(r))) unlock('daily_all_ranks');
  }
  // 通算-100以下
  if (totalPoint < -100) unlock('point_minus_100');

  return newTrophies;
}

// ─────────────────────────────────────────────────────────────
// ランク別にトロフィーをグループ化
// ─────────────────────────────────────────────────────────────
export function getTrophiesByRank(): Record<TrophyRank, TrophyDefinition[]> {
  const result = {} as Record<TrophyRank, TrophyDefinition[]>;
  for (const rank of RANK_ORDER) result[rank] = [];
  for (const def of Object.values(TROPHY_DEFINITIONS)) {
    result[def.rank].push(def);
  }
  return result;
}
