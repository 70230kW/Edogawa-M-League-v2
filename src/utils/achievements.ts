import { GameRecord, TrophyDefinition, TrophyRank, YakumanType } from '@/types';

// ─────────────────────────────────────────────────────────────
// 全トロフィー定義
// ─────────────────────────────────────────────────────────────
export const TROPHY_DEFINITIONS: Record<string, TrophyDefinition> = {

  // ══════════════════════════════════════════════════════════
  // ブロンズ
  // ══════════════════════════════════════════════════════════
  b_first_top: {
    id: 'b_first_top', rank: 'bronze', icon: '🥇',
    name: 'まずは初トップ',
    description: '今シーズン、初めて1着で対局を終える',
    comment: '勝利の味はどうだ？この感覚を忘れるな。',
  },
  b_rentai: {
    id: 'b_rentai', rank: 'bronze', icon: '🎯',
    name: '連対達成',
    description: '1着または2着で対局を終える',
    comment: 'トップ2に入った。連対は雀士の基本だ。',
  },
  b_no_last: {
    id: 'b_no_last', rank: 'bronze', icon: '🛡️',
    name: 'ラス回避',
    description: '4着を回避して対局を終える',
    comment: 'ラスを踏まなかった。それだけで十分だ。',
  },
  b_plus_score: {
    id: 'b_plus_score', rank: 'bronze', icon: '💰',
    name: 'プラス収支',
    description: '持ち点が原点を1点でも上回って終了する',
    comment: 'プラスで終わった。麻雀の醍醐味を感じたか？',
  },
  b_wall_30k: {
    id: 'b_wall_30k', rank: 'bronze', icon: '🔔',
    name: '30,000点の壁',
    description: '終局時の持ち点が30,000点以上になる',
    comment: 'まずは原点超え。ここからが本番だ。',
  },
  b_wall_40k: {
    id: 'b_wall_40k', rank: 'bronze', icon: '⚡',
    name: '40,000点の壁',
    description: '終局時の持ち点が40,000点以上になる',
    comment: '40,000点。着実に力をつけている。',
  },
  b_stable_2nd: {
    id: 'b_stable_2nd', rank: 'bronze', icon: '🥈',
    name: '安定の2着',
    description: '2着で対局を終える',
    comment: '2着も立派な結果。安定感が光る。',
  },
  b_tenacious_3rd: {
    id: 'b_tenacious_3rd', rank: 'bronze', icon: '💪',
    name: '粘りの3着',
    description: '3着で対局を終える',
    comment: 'ギリギリで踏みとどまった。この粘りが大切だ。',
  },
  b_rocket_start: {
    id: 'b_rocket_start', rank: 'bronze', icon: '🚀',
    name: 'ロケットスタート',
    description: 'その日の最初の対局で1着を獲得する',
    comment: '最高のスタートを切った。勢いを維持しろ。',
  },
  b_graceful_end: {
    id: 'b_graceful_end', rank: 'bronze', icon: '🌸',
    name: '有終の美',
    description: 'その日の最後の対局で1着を獲得する',
    comment: '最後を飾る1着。美しい幕引きだ。',
  },
  b_day_plus: {
    id: 'b_day_plus', rank: 'bronze', icon: '📈',
    name: 'トータルプラス',
    description: 'その日の合計ポイントがプラスで試合を終える',
    comment: '今日はプラスで終わった。それで十分だ。',
  },
  b_revenge: {
    id: 'b_revenge', rank: 'bronze', icon: '🔥',
    name: 'リベンジ',
    description: '4着を取った対局の直後の対局で1着を取る',
    comment: '敗北の直後に雪辱を果たした。執念の勝利だ。',
  },
  b_downfall: {
    id: 'b_downfall', rank: 'bronze', icon: '💀',
    name: '都落ち',
    description: '1着を取った対局の直後の対局で4着になる',
    comment: '栄光の後の転落。麻雀の残酷さを味わった。',
  },
  b_constant: {
    id: 'b_constant', rank: 'bronze', icon: '📊',
    name: 'コンスタント',
    description: '2局連続で連対する（1着または2着）',
    comment: '連続で上位につけた。コンスタントな強さが出てきた。',
  },
  b_better_end: {
    id: 'b_better_end', rank: 'bronze', icon: '🎭',
    name: '終わり良ければすべて良し',
    description: '最後の対局を1着で終えたが、その日の試合では最下位',
    comment: '最後だけ輝いた。しかしそれでいい、終わりよければすべてよし。',
  },
  b_close_win: {
    id: 'b_close_win', rank: 'bronze', icon: '⚔️',
    name: '僅差の競り勝ち',
    description: '2着との差が3,000点以内という接戦で1着になる',
    comment: 'ギリギリの勝利。この緊張感がたまらない。',
  },
  b_big_win: {
    id: 'b_big_win', rank: 'bronze', icon: '👑',
    name: '圧倒的勝者',
    description: '2着と20,000点以上の大差をつけて1着になる',
    comment: '圧倒的な差をつけた。誰も追いつけなかった。',
  },
  b_double_header: {
    id: 'b_double_header', rank: 'bronze', icon: '🎪',
    name: 'ダブルヘッダー',
    description: '1日に2回以上、異なる試合に参加する（自己申告）',
    comment: '2試合こなした。体力も精神力もすごい。',
    manual: true,
  },
  b_yakuman_witness: {
    id: 'b_yakuman_witness', rank: 'bronze', icon: '👁️',
    name: '役満の目撃者',
    description: '同じ卓の誰かが役満をアガった対局に参加している',
    comment: '歴史的瞬間を目撃した。あなたはその場にいた。',
  },

  // ══════════════════════════════════════════════════════════
  // シルバー
  // ══════════════════════════════════════════════════════════
  s_wall_50k: {
    id: 's_wall_50k', rank: 'silver', icon: '🌟',
    name: '運か実力か',
    description: '終局時の持ち点が50,000点以上になる',
    comment: '50,000点超え。実力か、はたまた天運か。',
  },
  s_wall_60k: {
    id: 's_wall_60k', rank: 'silver', icon: '💫',
    name: '誰にも止められない',
    description: '終局時の持ち点が60,000点以上になる',
    comment: '60,000点。もはや誰も止められない存在だ。',
  },
  s_session_win2: {
    id: 's_session_win2', rank: 'silver', icon: '🏆',
    name: '連勝街道',
    description: '2試合連続で1着を獲得する',
    comment: '2連勝。この調子で突き進め。',
  },
  s_session_rentai3: {
    id: 's_session_rentai3', rank: 'silver', icon: '☀️',
    name: '安定の極み',
    description: '3試合連続で連対する（1着または2着）',
    comment: '3連続連対。安定感が際立っている。',
  },
  s_session_nolast4: {
    id: 's_session_nolast4', rank: 'silver', icon: '🌈',
    name: '鉄壁の守り',
    description: '4試合連続でラスを回避する',
    comment: '4連続ラスなし。鉄壁の守りを誇る。',
  },
  s_stepping_stone: {
    id: 's_stepping_stone', rank: 'silver', icon: '💎',
    name: '踏み台',
    description: '誰かがハコ下で終了した対局で1着になる',
    comment: '誰かの犠牲の上に立つ勝利。それが麻雀だ。',
  },
  s_dominate: {
    id: 's_dominate', rank: 'silver', icon: '🌊',
    name: '独壇場',
    description: '2着と30,000点以上の大差をつけて圧勝する',
    comment: 'ここは俺の独壇場だ。誰も追いつけない。',
  },
  s_super_close: {
    id: 's_super_close', rank: 'silver', icon: '🎯',
    name: '大接戦の勝者',
    description: '2着との差が1,000点以内という超僅差で1着になる',
    comment: '1000点以内の死闘。最後まで諦めなかった。',
  },
  s_comeback: {
    id: 's_comeback', rank: 'silver', icon: '🔄',
    name: '怒涛の巻き返し',
    description: 'その日の最初の対局で4着だったが、合計ポイントをプラスで試合を終える',
    comment: '最悪のスタートから逆転。これが真の実力だ。',
  },
  s_hot_day: {
    id: 's_hot_day', rank: 'silver', icon: '🌶️',
    name: '絶好調な一日',
    description: '1日に3半荘以上プレイし、平均順位が2.0以下で試合を終える',
    comment: '今日はノリに乗っている。止まらない日というのがある。',
  },
  s_perfect_day: {
    id: 's_perfect_day', rank: 'silver', icon: '✨',
    name: 'パーフェクト・デイ',
    description: '1日に2半荘以上プレイし、全半荘で1着になる',
    comment: '今日は無敵だ。全局1着。完璧な一日だった。',
  },
  s_muddy_win: {
    id: 's_muddy_win', rank: 'silver', icon: '🏔️',
    name: '泥沼を制す',
    description: '1着の持ち点が35,000点未満の拮抗した対局で1着になる',
    comment: '泥沼のような接戦を制した。これが本物の力だ。',
  },
  s_near_fly: {
    id: 's_near_fly', rank: 'silver', icon: '🕳️',
    name: '地底まであと10歩',
    description: '終局時の持ち点が0点〜1,000点の状態で対局を終える',
    comment: '崖っぷちでの生還。ギリギリで踏みとどまった。',
  },
  s_all_feelings: {
    id: 's_all_feelings', rank: 'silver', icon: '🎭',
    name: '喜怒哀楽',
    description: '1日のうちに1着、2着、3着、4着をすべて経験する',
    comment: '全順位を経験した。感情の起伏が激しい一日だ。',
  },
  s_monthly_profit: {
    id: 's_monthly_profit', rank: 'silver', icon: '📅',
    name: '黒字経営',
    description: '1ヶ月間の合計ポイントがプラスで終わる',
    comment: '月間黒字。安定した経営ができている。',
  },
  s_wins10: {
    id: 's_wins10', rank: 'silver', icon: '🏅',
    name: '通算10勝',
    description: 'シーズン中、10半荘で1着を獲得する',
    comment: '10回のトップ。勝負師の資格が見え始めた。',
  },
  s_veteran30: {
    id: 's_veteran30', rank: 'silver', icon: '📜',
    name: '歴戦の雀士',
    description: '30半荘に参加する',
    comment: '30戦。経験が積み上がってきた。',
  },
  s_round_score: {
    id: 's_round_score', rank: 'silver', icon: '🔢',
    name: '計算しやすそー',
    description: '終局時の持ち点が10,000点単位のキリのよい数字になる',
    comment: 'キリのいい数字。誰かが計算を簡単にしてくれた。',
  },

  // ══════════════════════════════════════════════════════════
  // ゴールド
  // ══════════════════════════════════════════════════════════
  g_wall_70k: {
    id: 'g_wall_70k', rank: 'gold', icon: '🌋',
    name: '70,000点の頂き',
    description: '終局時の持ち点が70,000点以上になる',
    comment: '70,000点の頂きへ。常人には届かない高みだ。',
  },
  g_wall_80k: {
    id: 'g_wall_80k', rank: 'gold', icon: '🏔️',
    name: '80,000点の絶景',
    description: '終局時の持ち点が80,000点以上になる',
    comment: '80,000点。この絶景を見られる者はほとんどいない。',
  },
  g_hat_trick: {
    id: 'g_hat_trick', rank: 'gold', icon: '🎩',
    name: 'ハットトリック',
    description: '3試合連続で1着を獲得する',
    comment: 'ハットトリック達成。三連覇の偉業だ。',
  },
  g_invincible5: {
    id: 'g_invincible5', rank: 'gold', icon: '🛡️',
    name: '無敗の進撃',
    description: '5試合連続で2着以内（連対）に入る',
    comment: '5連続連対。誰も倒せない無敵の存在だ。',
  },
  g_iron_wall10: {
    id: 'g_iron_wall10', rank: 'gold', icon: '🏰',
    name: '鉄壁',
    description: '10試合連続で4着（ラス）を回避する',
    comment: '10連続ラスなし。鉄壁の壁が築かれた。',
  },
  g_perfect_match: {
    id: 'g_perfect_match', rank: 'gold', icon: '👑',
    name: '完全試合',
    description: '1日に4試合以上プレイし、全試合で1着を獲得する',
    comment: '完全試合達成。今日は誰も君に勝てなかった。',
  },
  g_triple_score: {
    id: 'g_triple_score', rank: 'gold', icon: '💥',
    name: 'トリプルスコア',
    description: '2着に50,000点以上の絶望的な大差をつけて1着になる',
    comment: 'トリプルスコア。もはや同じ卓を共にする価値もない。',
  },
  g_all_minus: {
    id: 'g_all_minus', rank: 'gold', icon: '☠️',
    name: 'どういうこと？',
    description: '自分以外の3人全員がハコ下の状態で1着になる',
    comment: 'どういうこと？3人全員が飛んでいる中での勝利。',
  },
  g_above_origin: {
    id: 'g_above_origin', rank: 'gold', icon: '⚡',
    name: 'アガりすぎ',
    description: '自分以外の3人全員の持ち点が原点を下回った状態で1着になる',
    comment: 'アガりすぎだろ。3人まとめて原点割れにした。',
  },
  g_big_top: {
    id: 'g_big_top', rank: 'gold', icon: '💯',
    name: '大台突破',
    description: '1回の対局で獲得したポイントが+100.0を超える大トップを取る',
    comment: '+100超え。この対局は語り継がれるだろう。',
  },
  g_mvp_month: {
    id: 'g_mvp_month', rank: 'gold', icon: '🌙',
    name: '月間MVP級',
    description: '1ヶ月間の合計スコアが+300.0以上を記録して月を終える',
    comment: '月間+300。月MVP間違いなし。今月は君のものだ。',
  },
  g_clean_month: {
    id: 'g_clean_month', rank: 'gold', icon: '🌟',
    name: '無傷の月間',
    description: '1ヶ月間に5試合以上プレイし、一度も4着を取らずにその月を終える',
    comment: '1ヶ月ラスなし。無傷で戦い抜いた月間だ。',
  },
  g_cancel_out: {
    id: 'g_cancel_out', rank: 'gold', icon: '🔄',
    name: '帳消し麻雀',
    description: 'その日の最初の2試合で連続4着だったが、最終的に合計スコアをプラスに巻き返す（自己申告）',
    comment: '2連続4着から逆転プラス。奇跡の帳消しだ。',
    manual: true,
  },
  g_ace: {
    id: 'g_ace', rank: 'gold', icon: '♠️',
    name: 'エースの証明',
    description: '1日に3半荘以上プレイし、平均順位が1.5以下で試合を終える',
    comment: '平均順位1.5以下。エースの称号に相応しい実力だ。',
  },
  g_wins50: {
    id: 'g_wins50', rank: 'gold', icon: '🏆',
    name: '通算50勝',
    description: '累計50半荘で1着を獲得する',
    comment: '50回のトップ。真の勝負師の仲間入りだ。',
  },
  g_century: {
    id: 'g_century', rank: 'gold', icon: '💫',
    name: 'センチュリー・クラブ',
    description: '累計100半荘の対局結果を記録する',
    comment: '100戦。センチュリー・クラブへようこそ。',
  },
  g_half_million: {
    id: 'g_half_million', rank: 'gold', icon: '💰',
    name: 'ハーフ・ミリオネア',
    description: '累計獲得ポイントが+500.0の大台を突破する',
    comment: '+500突破。半ミリオネアの称号が君のものだ。',
  },
  g_top_ranker: {
    id: 'g_top_ranker', rank: 'gold', icon: '📊',
    name: 'トップランカー',
    description: '累計30半荘以上プレイした時点で、通算の平均順位が2.00以下をキープ',
    comment: '30戦超えで平均順位2.00以下。真のトップランカーだ。',
  },
  g_top_rate50: {
    id: 'g_top_rate50', rank: 'gold', icon: '🎲',
    name: '勝率5割の壁',
    description: '累計20半荘以上プレイした時点で、通算1着獲得率が50%以上',
    comment: 'トップ率50%。コインの表を半分以上出し続けた。',
  },

  // ══════════════════════════════════════════════════════════
  // プラチナ
  // ══════════════════════════════════════════════════════════
  p_four_gods: {
    id: 'p_four_gods', rank: 'platinum', icon: '⛩️',
    name: '四神降臨',
    description: '4試合連続で1着を獲得する',
    comment: '四神が降臨した。圧倒的な4連覇だ。',
  },
  p_five_emperors: {
    id: 'p_five_emperors', rank: 'platinum', icon: '🌌',
    name: '五帝の覇気',
    description: '5試合連続で1着を獲得する',
    comment: '五帝の覇気。5連勝はもはや人外の領域だ。',
  },
  p_divine_rentai: {
    id: 'p_divine_rentai', rank: 'platinum', icon: '🌠',
    name: '神域の連対',
    description: '10試合連続で2着以内（連対）に入る',
    comment: '10連続連対。神域の安定感を手に入れた。',
  },
  p_diamond_guard: {
    id: 'p_diamond_guard', rank: 'platinum', icon: '💠',
    name: '金剛不壊',
    description: '20試合連続で4着（ラス）を回避する',
    comment: '20連続ラスなし。金剛不壊の境地に達した者。',
  },
  p_wall_100k: {
    id: 'p_wall_100k', rank: 'platinum', icon: '🌈',
    name: 'やりすぎだよ～',
    description: '終局時の持ち点が100,000点以上になる（10万点オーバー）',
    comment: 'やりすぎだよ～！10万点超えは前代未聞だ。',
  },
  p_extreme: {
    id: 'p_extreme', rank: 'platinum', icon: '🚀',
    name: '異次元の大勝',
    description: '2着に60,000点以上の絶望的な大差をつけて1着になる',
    comment: '異次元の大勝。相手は同じ人間なのか疑いたくなる。',
  },
  p_absolute_king: {
    id: 'p_absolute_king', rank: 'platinum', icon: '👑',
    name: '絶対王者の証明',
    description: '累計で100回、1着を獲得する',
    comment: '100回のトップ。絶対王者の称号が君のものだ。',
  },
  p_mahjong_child: {
    id: 'p_mahjong_child', rank: 'platinum', icon: '🎴',
    name: '麻雀の申し子',
    description: '累計300半荘の対局結果を記録する',
    comment: '300戦。麻雀の申し子として生まれてきた者だ。',
  },
  p_grand_master: {
    id: 'p_grand_master', rank: 'platinum', icon: '⭐',
    name: 'グランドマスター',
    description: '累計100半荘以上で通算1着獲得率が40%以上',
    comment: '100戦超えでトップ率40%以上。グランドマスターの称号だ。',
  },
  p_iron_fortress: {
    id: 'p_iron_fortress', rank: 'platinum', icon: '🏰',
    name: '鉄壁の防空壕',
    description: '累計100半荘以上プレイした時点で、通算のラス率が10%以下をキープ',
    comment: '100戦超えでラス率10%以下。鉄壁の防空壕だ。',
  },
  p_above_clouds: {
    id: 'p_above_clouds', rank: 'platinum', icon: '☁️',
    name: '雲の上の存在',
    description: '累計の合計獲得スコアが+1,000.0を突破する',
    comment: '+1000突破。雲の上の存在となった。',
  },
  p_resurrection: {
    id: 'p_resurrection', rank: 'platinum', icon: '🌅',
    name: '絶望からの生還',
    description: 'その日の途中で合計スコアが-150.0を下回った状態から、最終的にプラスに巻き返す（自己申告）',
    comment: '-150からの生還。奇跡的な逆転劇だ。',
    manual: true,
  },
  p_perfect_month: {
    id: 'p_perfect_month', rank: 'platinum', icon: '🌙',
    name: '天下無双の月間',
    description: '1ヶ月間に10試合以上プレイし、一度も3着・4着を取らずにその月を終える（自己申告）',
    comment: '月間全連対。天下無双の一ヶ月を過ごした。',
    manual: true,
  },
  p_unlucky_runner: {
    id: 'p_unlucky_runner', rank: 'platinum', icon: '😤',
    name: '不運なる猛者',
    description: '終局時の持ち点が50,000点以上にもかかわらず、トップを逃して2着になる',
    comment: '50,000点超えで2着。運に見放された猛者よ。',
  },
  p_ice_table: {
    id: 'p_ice_table', rank: 'platinum', icon: '🧊',
    name: '氷のテーブル',
    description: '1着の持ち点が31,000点未満という極限のロースコア戦で1着になる',
    comment: '超接戦の氷のテーブル。薄氷の上の勝利だ。',
  },
  p_tied: {
    id: 'p_tied', rank: 'platinum', icon: '⚖️',
    name: '奇跡の一騎打ち',
    description: '同点1着で試合を終える',
    comment: '同点1着という奇跡。歴史に刻まれる一騎打ちだ。',
  },
  p_maestro: {
    id: 'p_maestro', rank: 'platinum', icon: '🎵',
    name: 'スコア・マエストロ',
    description: '1日の合計ポイントがプラスマイナス「0.0」ぴったりで終わる（最低3半荘以上プレイ）',
    comment: '±0.0ぴったり。スコアを操るマエストロだ。',
  },
  p_ten_game_day: {
    id: 'p_ten_game_day', rank: 'platinum', icon: '💪',
    name: '限界突破の十番勝負',
    description: '1日のうちに10半荘以上の対局結果を記録する',
    comment: '1日10局以上。限界を突破した猛者よ。',
  },
  p_four_seasons: {
    id: 'p_four_seasons', rank: 'platinum', icon: '🌸',
    name: '四季を巡る雀士',
    description: '12ヶ月連続で、毎月1回以上対局データを登録する（自己申告）',
    comment: '1年間欠かさず対局した。四季を巡った雀士よ。',
    manual: true,
  },
  p_edogawa: {
    id: 'p_edogawa', rank: 'platinum', icon: '📖',
    name: '江戸川の伝説',
    description: '対局データの登録日数が累計で100日を突破する',
    comment: '100日の記録。江戸川のように積み上げてきた伝説だ。',
  },

  // ══════════════════════════════════════════════════════════
  // スペシャル（役満）
  // ══════════════════════════════════════════════════════════
  sp_kokushi: {
    id: 'sp_kokushi', rank: 'special', icon: '💀',
    name: '終焉を刻む十三針',
    description: '国士無双を成就させる',
    comment: '十三の孤独な使徒が揃った時、終焉の扉が開く。',
  },
  sp_kokushi13: {
    id: 'sp_kokushi13', rank: 'special', icon: '☠️',
    name: '宿命を穿つ十三の星',
    description: '国士無双十三面待ちを成就させる（上位形）',
    comment: '十三面待ち。宿命が引き寄せた奇跡の形だ。',
  },
  sp_suanko: {
    id: 'sp_suanko', rank: 'special', icon: '🕶️',
    name: '静寂を切り裂く咆哮',
    description: '四暗刻を成就させる',
    comment: '四暗刻。沈黙の中に宿る絶対的な力。',
  },
  sp_suanko_tanki: {
    id: 'sp_suanko_tanki', rank: 'special', icon: '👑',
    name: '孤高なる王の玉座',
    description: '四暗刻単騎を成就させる（上位形）',
    comment: '皇帝は孤独だ。しかし、その孤独が最強を生む。',
  },
  sp_daisangen: {
    id: 'sp_daisangen', rank: 'special', icon: '🐉',
    name: '神域の三連祭壇',
    description: '大三元を成就させる',
    comment: '三元牌が揃った時、龍は空へと舞い上がる。',
  },
  sp_ryuiso: {
    id: 'sp_ryuiso', rank: 'special', icon: '🍀',
    name: '翡翠の絶対領域',
    description: '緑一色を成就させる',
    comment: '緑に染まった牌山。大地の色で染め上げた。',
  },
  sp_churenko: {
    id: 'sp_churenko', rank: 'special', icon: '🕯️',
    name: '至高へ至る九つの門',
    description: '九蓮宝燈を成就させる',
    comment: '九蓮の燈火が灯った時、神は微笑む。',
  },
  sp_churenko9: {
    id: 'sp_churenko9', rank: 'special', icon: '✨',
    name: '真理に到達せし九つの光',
    description: '純正九蓮宝燈（九面待ち）を成就させる（上位形）',
    comment: '九面待ち。真理に到達した者だけが見られる光。',
  },
  sp_chinroto: {
    id: 'sp_chinroto', rank: 'special', icon: '🐲',
    name: '歴史を刻む古の賢者',
    description: '清老頭を成就させる',
    comment: '老いた龍が最後に放つ咆哮。9と1だけの世界。',
  },
  sp_tsuiso: {
    id: 'sp_tsuiso', rank: 'special', icon: '🌀',
    name: '深淵からの呼び声',
    description: '字一色を成就させる',
    comment: '字牌のみで創り上げた宇宙。万象は無色に帰す。',
  },
  sp_shosushi: {
    id: 'sp_shosushi', rank: 'special', icon: '🌬️',
    name: '四方を駆け抜ける烈風',
    description: '小四喜を成就させる',
    comment: '風牌の三つが揃い、円舞曲が奏でられる。',
  },
  sp_daisushi: {
    id: 'sp_daisushi', rank: 'special', icon: '🌪️',
    name: '天地創造の四神',
    description: '大四喜を成就させる（上位形）',
    comment: '四つの風が揃い、嵐が生まれた。風神の降臨。',
  },
  sp_sikantu: {
    id: 'sp_sikantu', rank: 'special', icon: '🏰',
    name: '因果を捻じ曲げる四つの奇跡',
    description: '四槓子を成就させる',
    comment: '四つのカンで世界が開かれた。王者の証。',
  },
  sp_tenhou: {
    id: 'sp_tenhou', rank: 'special', icon: '⚡',
    name: '神に許されし第一手',
    description: '天和を成就させる',
    comment: '天の采配。神慮が下った瞬間を目撃した。',
  },
  sp_chihou: {
    id: 'sp_chihou', rank: 'special', icon: '🌍',
    name: '大地に眠る奇跡',
    description: '地和を成就させる',
    comment: '大地の奇跡。地和は運命が引き寄せた答え。',
  },
  sp_jinhou: {
    id: 'sp_jinhou', rank: 'special', icon: '🌑',
    name: '宵闇の凶弾',
    description: '人和を成就させる（自己申告）',
    comment: '人和。人間にできる最後の奇跡だ。',
    manual: true,
  },
  sp_kazoe: {
    id: 'sp_kazoe', rank: 'special', icon: '♾️',
    name: '天を衝く無限の連鎖',
    description: '数え役満（13翻以上）を成就させる（自己申告）',
    comment: '13翻以上。数えることさえ追いつかない連鎖だ。',
    manual: true,
  },
  sp_compound: {
    id: 'sp_compound', rank: 'special', icon: '🎆',
    name: '二重奏の神話',
    description: '複合役満（異なる役満の複合）を成就させる（自己申告）',
    comment: '複合役満。二重奏の神話がここに生まれた。',
    manual: true,
  },
  sp_triple_yakuman: {
    id: 'sp_triple_yakuman', rank: 'special', icon: '🌌',
    name: '宇宙（コスモ）の崩壊',
    description: 'トリプル役満以上を成就させる（自己申告）',
    comment: 'トリプル役満。宇宙さえも崩壊する威力だ。',
    manual: true,
  },
  sp_death_reaper: {
    id: 'sp_death_reaper', rank: 'special', icon: '🔱',
    name: '魂を刈る死神',
    description: '役満をアガり、同時に相手をハコ下にして対局を終了させる',
    comment: '役満で相手を飛ばした。死神が鎌を振るった。',
  },
  sp_first_yakuman: {
    id: 'sp_first_yakuman', rank: 'special', icon: '🌠',
    name: '伝説の幕開け',
    description: 'このリーグで初めて役満を記録する（自己申告）',
    comment: '伝説の幕が開いた。この一手が歴史を変えた。',
    manual: true,
  },

  // ══════════════════════════════════════════════════════════
  // アンダーグラウンド
  // ══════════════════════════════════════════════════════════
  ug_fly1: {
    id: 'ug_fly1', rank: 'underground', icon: '🪦',
    name: '地底人との出会い',
    description: 'シーズン中、初めてトビを記録する',
    comment: '地底人と出会ってしまった。ここが始まりだ。',
  },
  ug_fly2: {
    id: 'ug_fly2', rank: 'underground', icon: '🌑',
    name: '地底人との再会',
    description: 'シーズン中、2回目のトビを記録する',
    comment: 'また会った。地底人はあなたを待っていた。',
  },
  ug_fly3: {
    id: 'ug_fly3', rank: 'underground', icon: '🕳️',
    name: '地底人との友情',
    description: 'シーズン中、3回目のトビを記録する',
    comment: '3度の出会い。これはもう友情と呼んでいい。',
  },
  ug_fly5: {
    id: 'ug_fly5', rank: 'underground', icon: '🖤',
    name: '地底人との絆',
    description: 'シーズン中、5回目のトビを記録する',
    comment: '5回。地底人との絆は深まるばかりだ。',
  },
  ug_fly10: {
    id: 'ug_fly10', rank: 'underground', icon: '💍',
    name: '地底人との結婚',
    description: 'シーズン中、10回目のトビを記録する',
    comment: '10回ものトビ。地底人との結婚を余儀なくされた。',
  },
  ug_zone1: {
    id: 'ug_zone1', rank: 'underground', icon: '📡',
    name: '地底探索ツアー',
    description: '素点が-5,000点〜-1点で対局を終える',
    comment: 'ちょっとだけ地底を探索した。まだ引き返せる。',
  },
  ug_zone2: {
    id: 'ug_zone2', rank: 'underground', icon: '📶',
    name: '声も聞こえない',
    description: '素点が-10,000点〜-5,001点で対局を終える',
    comment: '-10,000点付近。声も届かない深さまで落ちた。',
  },
  ug_zone3: {
    id: 'ug_zone3', rank: 'underground', icon: '📵',
    name: '電波ですら怪しい',
    description: '素点が-15,000点〜-10,001点で対局を終える',
    comment: '-15,000点付近。もう電波も届かない深淵だ。',
  },
  ug_zone4: {
    id: 'ug_zone4', rank: 'underground', icon: '🏚️',
    name: '地底移住権獲得',
    description: '素点が-20,000点〜-15,001点で対局を終える',
    comment: '-20,000点付近。地底への移住権を獲得した。',
  },
  ug_zone5: {
    id: 'ug_zone5', rank: 'underground', icon: '🌍',
    name: '地底国籍取得',
    description: '素点が-20,001点以下で対局を終える',
    comment: '-20,001点以下。地底国の国籍を取得してしまった。',
  },

  // ══════════════════════════════════════════════════════════
  // インポッシブル
  // ══════════════════════════════════════════════════════════
  imp_all_equal: {
    id: 'imp_all_equal', rank: 'impossible', icon: '⚖️',
    name: '完全なる平和',
    description: '全員の持ち点が25,000点ちょうどで終了する',
    comment: '全員25,000点。数学的には可能だが…本当に起きた？',
  },
  imp_arithmetic: {
    id: 'imp_arithmetic', rank: 'impossible', icon: '📐',
    name: '等差の奇跡',
    description: '4人の持ち点が上から順に40,000、30,000、20,000、10,000で終了する',
    comment: '等差数列。神が用意したかのような完璧な配分。',
  },
  imp_zero_score: {
    id: 'imp_zero_score', rank: 'impossible', icon: '0️⃣',
    name: '絶対零度',
    description: '誰か一人の持ち点がピッタリ0点で終了する',
    comment: '0点。プラスでもマイナスでもない。絶対零度の境界線。',
  },
  imp_twins: {
    id: 'imp_twins', rank: 'impossible', icon: '👯',
    name: '双子の卓',
    description: '1位と2位、および3位と4位の持ち点がそれぞれ全く同じ点数で終了する',
    comment: '双子のようなスコア。偶然にしては出来すぎている。',
  },
  imp_all_round: {
    id: 'imp_all_round', rank: 'impossible', icon: '🎱',
    name: '神々の遊び',
    description: '4人全員の持ち点が10,000点単位のキリの良い数字で終了する',
    comment: '全員キリのいい数字。神々が遊んだ卓だ。',
  },
  imp_angel: {
    id: 'imp_angel', rank: 'impossible', icon: '😇',
    name: 'エンジェルナンバー',
    description: '自分の終了時の持ち点がゾロ目（11,100点、22,200点など）になる',
    comment: 'ゾロ目のスコア。天使からのメッセージを受け取った。',
  },
  imp_consecutive_digits: {
    id: 'imp_consecutive_digits', rank: 'impossible', icon: '📏',
    name: '一気通貫スコア',
    description: '自分の終了時の持ち点が連番の数字（12,300点、23,400点など）になる',
    comment: '連番スコア。一気通貫のように美しい数字の流れ。',
  },
  imp_stairs: {
    id: 'imp_stairs', rank: 'impossible', icon: '🪜',
    name: '奇跡の階段',
    description: '1位と2位の点差、2位と3位の点差、3位と4位の点差が全て完全に同じ点数になる',
    comment: '等間隔の階段スコア。この偶然は奇跡と呼ぶしかない。',
  },
  imp_triple_top: {
    id: 'imp_triple_top', rank: 'impossible', icon: '🏆',
    name: '究極のトップタイ',
    description: '4人中3人が同点トップ（1位タイ）で終了する',
    comment: '3人同点1着。こんな結末があったとは。',
  },
  imp_death_hand: {
    id: 'imp_death_hand', rank: 'impossible', icon: '💀',
    name: '死線の淵',
    description: '終了時の自分の持ち点が4だけで構成される（4,400点や44,400点など）',
    comment: '全てが4。死の数字が並んだ不吉なスコアだ。',
  },
  imp_lucky7: {
    id: 'imp_lucky7', rank: 'impossible', icon: '🍀',
    name: 'ラッキーセブン',
    description: '終了時の自分の持ち点が7だけで構成される（7,700点や77,700点など）',
    comment: '全てが7。ラッキーセブンが降り注いだ奇跡だ。',
  },
  imp_black_hole: {
    id: 'imp_black_hole', rank: 'impossible', icon: '🕳️',
    name: 'ブラックホール',
    description: '誰か1人の持ち点がマイナス30,000点を下回る記録的な大敗を喫する',
    comment: '-30,000点超えの大敗。ブラックホールに飲み込まれた。',
  },
  imp_origin: {
    id: 'imp_origin', rank: 'impossible', icon: '🔄',
    name: '原点回帰の呪縛',
    description: '終局時の持ち点が開始時の原点（25,000点）と100点単位まで狂わず同じになる',
    comment: '元通りの点数。まるで何も起きなかったかのように。',
  },
  imp_reincarnation: {
    id: 'imp_reincarnation', rank: 'impossible', icon: '♻️',
    name: '輪廻転生',
    description: '同じ日に4試合連続で1着→2着→3着→4着の順番に取る（どの順から始まっても可）（自己申告）',
    comment: '輪廻のように順位が巡った。これは運命か必然か。',
    manual: true,
  },
  imp_deja_vu: {
    id: 'imp_deja_vu', rank: 'impossible', icon: '🌀',
    name: 'デジャヴ',
    description: '同じ日に2試合連続で全く同じ持ち点・順位で終了する（自己申告）',
    comment: 'デジャヴ。まったく同じ試合が繰り返された。',
    manual: true,
  },
  imp_100pt_gap: {
    id: 'imp_100pt_gap', rank: 'impossible', icon: '🔬',
    name: '100点の極限',
    description: '1位から4位までの全員の点差がそれぞれ1,000点以内の超密着で終了する',
    comment: '全員が1,000点以内の超密着。これが麻雀の極限だ。',
  },
  imp_void: {
    id: 'imp_void', rank: 'impossible', icon: '🌫️',
    name: '無の境地',
    description: '全員の持ち点が原点（25,000点）からプラスマイナス1,000点以内の超僅差で終了する',
    comment: '全員が原点付近。何も変わらなかった、無の境地だ。',
  },
  imp_history_repeat: {
    id: 'imp_history_repeat', rank: 'impossible', icon: '📚',
    name: '歴史の反復',
    description: '過去の対局と4人の持ち点が100点単位まで完全一致する（自己申告）',
    comment: '歴史は繰り返す。全く同じスコアの対局が再び起きた。',
    manual: true,
  },
};

// ランク順序（表示用）
export const RANK_ORDER: TrophyRank[] = [
  'bronze', 'silver', 'gold', 'platinum', 'special', 'underground', 'impossible',
];

// ランク表示設定
export const RANK_META: Record<TrophyRank, { label: string; color: string; bg: string; border: string; glow: string }> = {
  bronze:     { label: '🥉 ブロンズ',         color: '#cd7f32', bg: 'rgba(205,127,50,0.15)',   border: 'rgba(205,127,50,0.4)',   glow: '0 0 15px rgba(205,127,50,0.4)' },
  silver:     { label: '🥈 シルバー',         color: '#c0c0c0', bg: 'rgba(192,192,192,0.12)',  border: 'rgba(192,192,192,0.35)', glow: '0 0 15px rgba(192,192,192,0.3)' },
  gold:       { label: '🥇 ゴールド',         color: '#ffd700', bg: 'rgba(255,215,0,0.15)',    border: 'rgba(255,215,0,0.4)',    glow: '0 0 20px rgba(255,215,0,0.5)' },
  platinum:   { label: '💠 プラチナ',         color: '#a8d8ff', bg: 'rgba(168,216,255,0.12)',  border: 'rgba(168,216,255,0.35)', glow: '0 0 20px rgba(168,216,255,0.4)' },
  special:    { label: '✨ スペシャル',       color: '#c084fc', bg: 'rgba(192,132,252,0.12)',  border: 'rgba(192,132,252,0.4)',  glow: '0 0 25px rgba(192,132,252,0.6)' },
  underground:{ label: '🌑 アンダーグラウンド', color: '#6b7280', bg: 'rgba(107,114,128,0.15)', border: 'rgba(107,114,128,0.4)',  glow: '0 0 10px rgba(107,114,128,0.3)' },
  impossible: { label: '🌈 インポッシブル',   color: '#f0abfc', bg: 'rgba(240,171,252,0.1)',   border: 'rgba(240,171,252,0.5)',  glow: '0 0 30px rgba(240,171,252,0.7)' },
};

// ─────────────────────────────────────────────────────────────
// ヘルパー関数
// ─────────────────────────────────────────────────────────────

function hasConsecutiveStreak(arr: number[], length: number, predicate: (v: number) => boolean): boolean {
  if (arr.length < length) return false;
  for (let i = 0; i <= arr.length - length; i++) {
    if (arr.slice(i, i + length).every(predicate)) return true;
  }
  return false;
}

function hasYakumanType(playerId: string, games: GameRecord[], type: YakumanType): boolean {
  return games.some(g =>
    g.events?.some(e =>
      e.type === 'yakuman' && e.playerId === playerId && e.yakumanList?.includes(type)
    )
  );
}

/** 日付とcreatedAtでゲームをソート */
function sortedByDateTime(games: GameRecord[]): GameRecord[] {
  return [...games].sort((a, b) => {
    const dateCmp = a.date.localeCompare(b.date);
    if (dateCmp !== 0) return dateCmp;
    return a.createdAt.getTime() - b.createdAt.getTime();
  });
}

/** 特定日の全プレイヤー日次ポイントを計算 */
function getDayTotals(date: string, allGames: GameRecord[]): Map<string, number> {
  const dayGames = allGames.filter(g => g.date === date);
  const totals = new Map<string, number>();
  for (const game of dayGames) {
    for (const p of game.players) {
      totals.set(p.playerId, (totals.get(p.playerId) ?? 0) + p.point);
    }
  }
  return totals;
}

/** 対局内での勝者（rank1）と2位の得点差を返す */
function getWinMargin(game: GameRecord): number | null {
  const sorted = [...game.players].sort((a, b) => a.rank - b.rank);
  if (sorted.length < 2) return null;
  return sorted[0].score - sorted[1].score;
}

/** 月初プレフィックス(YYYY-MM)でフィルタしてポイント合計 */
function getMonthlyTotal(playerId: string, allGames: GameRecord[], monthPrefix: string): number {
  return allGames
    .filter(g => g.date.startsWith(monthPrefix))
    .flatMap(g => g.players.filter(p => p.playerId === playerId))
    .reduce((sum, p) => sum + p.point, 0);
}

/** 日次ランク集計（プレイヤーごとの日次順位リスト） */
function computeDailyRanks(
  playerId: string,
  allGames: GameRecord[]
): Array<{ date: string; rank: number; totalPoint: number; gameCount: number }> {
  const dates = new Set(
    allGames
      .filter(g => g.players.some(p => p.playerId === playerId))
      .map(g => g.date)
  );
  const results: Array<{ date: string; rank: number; totalPoint: number; gameCount: number }> = [];

  for (const date of dates) {
    const dayTotals = getDayTotals(date, allGames);
    const myTotal = dayTotals.get(playerId) ?? 0;
    const dayPlayerGames = allGames.filter(g => g.date === date && g.players.some(p => p.playerId === playerId));

    let rank = 1;
    for (const [pid, total] of dayTotals) {
      if (pid !== playerId && total > myTotal) rank++;
    }
    results.push({ date, rank, totalPoint: myTotal, gameCount: dayPlayerGames.length });
  }
  return results.sort((a, b) => a.date.localeCompare(b.date));
}

/** スコアが「ゾロ目パターン」か検証（11100, 22200, etc.） */
function isAngel(score: number): boolean {
  if (score <= 0) return false;
  const s = score.toString();
  // パターン: 各桁が繰り返すパターン（例: 11100, 22200, 33300, 44400...）
  // より広義に: スコアが1100, 2200, 3300, 11100, 22200, 33300, 44400, 55500, 66600, 77700, 88800, 99900 など
  const patterns = [
    /^1+0*$/, /^2+0*$/, /^3+0*$/, /^4+0*$/, /^5+0*$/,
    /^6+0*$/, /^7+0*$/, /^8+0*$/, /^9+0*$/,
  ];
  return patterns.some(p => p.test(s));
}

/** スコアが連番か検証（12300, 23400, etc.） */
function isConsecutiveDigits(score: number): boolean {
  if (score <= 0) return false;
  const s = score.toString().replace(/0+$/, ''); // 末尾の0を除去
  if (s.length < 2) return false;
  for (let i = 1; i < s.length; i++) {
    if (parseInt(s[i]) !== parseInt(s[i - 1]) + 1) return false;
  }
  return true;
}

/** スコアが4だけで構成されるか */
function isDeathHand(score: number): boolean {
  if (score <= 0) return false;
  return score.toString().split('').every(c => c === '4' || c === '0') &&
    score.toString().includes('4');
}

/** スコアが7だけで構成されるか */
function isLucky7(score: number): boolean {
  if (score <= 0) return false;
  return score.toString().split('').every(c => c === '7' || c === '0') &&
    score.toString().includes('7');
}

// ─────────────────────────────────────────────────────────────
// 実績チェック（メイン）
// ─────────────────────────────────────────────────────────────
export function checkAchievementsForPlayer(
  playerId: string,
  allLeagueGames: GameRecord[],
  existingIds: Set<string>,
  triggerGameId: string
): { trophyId: string; gameId: string }[] {
  const sortedAll = sortedByDateTime(allLeagueGames);
  const playerGames = sortedAll.filter(g => g.players.some(p => p.playerId === playerId));
  const results = playerGames.map(g => g.players.find(p => p.playerId === playerId)!);

  const ranks = results.map(r => r.rank);
  const scores = results.map(r => r.score);
  const points = results.map(r => r.point);
  const totalGames = results.length;
  const totalPoint = points.reduce((s, v) => s + v, 0);
  const win1Count = ranks.filter(r => r === 1).length;
  const flyCount = scores.filter(s => s < 0).length;

  const triggerGame = sortedAll.find(g => g.id === triggerGameId);
  const triggerResult = triggerGame?.players.find(p => p.playerId === playerId);

  const newTrophies: { trophyId: string; gameId: string }[] = [];
  const unlock = (id: string) => {
    if (!existingIds.has(id) && TROPHY_DEFINITIONS[id] && !TROPHY_DEFINITIONS[id].manual) {
      newTrophies.push({ trophyId: id, gameId: triggerGameId });
    }
  };

  // 日次データ
  const dailyResults = computeDailyRanks(playerId, sortedAll);
  const dailyRanks = dailyResults.map(d => d.rank);
  const dailyPoints = dailyResults.map(d => d.totalPoint);

  // 今日の日付（直近の対局日）
  const latestDate = triggerGame?.date ?? '';
  const todayDayGames = playerGames.filter(g => g.date === latestDate);
  const todayAllGames = sortedAll.filter(g => g.date === latestDate);
  const todayRanksPlayer = todayDayGames.map(g => g.players.find(p => p.playerId === playerId)!.rank);
  const todayPoints = points.filter((_, i) => playerGames[i].date === latestDate);

  // ── ブロンズ ──────────────────────────────────────────────
  if (ranks.some(r => r === 1)) unlock('b_first_top');
  if (ranks.some(r => r <= 2)) unlock('b_rentai');
  if (ranks.some(r => r !== 4)) unlock('b_no_last');
  if (scores.some(s => s > 25000)) unlock('b_plus_score');
  if (scores.some(s => s >= 30000)) unlock('b_wall_30k');
  if (scores.some(s => s >= 40000)) unlock('b_wall_40k');
  if (ranks.some(r => r === 2)) unlock('b_stable_2nd');
  if (ranks.some(r => r === 3)) unlock('b_tenacious_3rd');

  // ロケットスタート: その日の最初の対局で1着
  if (latestDate && todayDayGames.length > 0) {
    const firstTodayResult = todayDayGames[0].players.find(p => p.playerId === playerId);
    if (firstTodayResult?.rank === 1) unlock('b_rocket_start');

    // 有終の美: その日の最後の対局で1着
    const lastTodayResult = todayDayGames[todayDayGames.length - 1].players.find(p => p.playerId === playerId);
    if (lastTodayResult?.rank === 1) unlock('b_graceful_end');

    // トータルプラス: その日の合計がプラス
    const todayTotal = todayPoints.reduce((s, v) => s + v, 0);
    if (todayDayGames.length >= 2 && todayTotal > 0) unlock('b_day_plus');

    // 終わり良ければすべて良し: 最後1着 but 日次ランク最下位
    if (lastTodayResult?.rank === 1) {
      const dayTotals = getDayTotals(latestDate, sortedAll);
      const myDayTotal = dayTotals.get(playerId) ?? 0;
      let dayRank = 1;
      for (const [pid, total] of dayTotals) {
        if (pid !== playerId && total > myDayTotal) dayRank++;
      }
      if (dayRank === dayTotals.size) unlock('b_better_end');
    }

    // 喜怒哀楽: その日に1〜4位を全部経験
    if (new Set(todayRanksPlayer).size === 4 && [1,2,3,4].every(r => todayRanksPlayer.includes(r))) {
      unlock('s_all_feelings');
    }

    // パーフェクト・デイ
    if (todayDayGames.length >= 2 && todayRanksPlayer.every(r => r === 1)) unlock('s_perfect_day');

    // 絶好調な一日: 3局以上で平均順位 ≤ 2.0
    if (todayDayGames.length >= 3) {
      const avg = todayRanksPlayer.reduce((s, v) => s + v, 0) / todayRanksPlayer.length;
      if (avg <= 2.0) unlock('s_hot_day');
    }

    // エースの証明: 3局以上で平均順位 ≤ 1.5
    if (todayDayGames.length >= 3) {
      const avg = todayRanksPlayer.reduce((s, v) => s + v, 0) / todayRanksPlayer.length;
      if (avg <= 1.5) unlock('g_ace');
    }

    // 完全試合: 4局以上で全て1着
    if (todayDayGames.length >= 4 && todayRanksPlayer.every(r => r === 1)) unlock('g_perfect_match');

    // 10局以上/日
    if (todayDayGames.length >= 10) unlock('p_ten_game_day');

    // スコア・マエストロ: 3局以上で日計 ±0.0
    if (todayDayGames.length >= 3) {
      const t = Math.round(todayPoints.reduce((s, v) => s + v, 0) * 10) / 10;
      if (t === 0) unlock('p_maestro');
    }

    // 怒涛の巻き返し: 最初が4着 → 日計プラス
    if (todayRanksPlayer[0] === 4 && todayPoints.reduce((s, v) => s + v, 0) > 0) {
      unlock('s_comeback');
    }
  }

  // リベンジ・都落ち（連続対局チェック）
  for (let i = 1; i < ranks.length; i++) {
    if (ranks[i - 1] === 4 && ranks[i] === 1) unlock('b_revenge');
    if (ranks[i - 1] === 1 && ranks[i] === 4) unlock('b_downfall');
  }

  // コンスタント: 2連続連対
  if (hasConsecutiveStreak(ranks, 2, r => r <= 2)) unlock('b_constant');

  // 僅差・大差チェック（全ゲーム）
  for (const game of playerGames) {
    const p = game.players.find(pp => pp.playerId === playerId)!;
    if (p.rank !== 1) continue;
    const margin = getWinMargin(game);
    if (margin === null) continue;
    if (margin <= 3000) unlock('b_close_win');
    if (margin >= 20000) unlock('b_big_win');
    if (margin >= 30000) unlock('s_dominate');
    if (margin <= 1000) unlock('s_super_close');
    if (margin >= 50000) unlock('g_triple_score');
    if (margin >= 60000) unlock('p_extreme');

    // 踏み台: 誰かがハコ下
    if (game.players.some(pp => pp.playerId !== playerId && pp.score < 0)) unlock('s_stepping_stone');

    // アガりすぎ: 3人全員が原点(30000)以下
    if (game.players.filter(pp => pp.playerId !== playerId).every(pp => pp.score < 30000)) {
      unlock('g_above_origin');
    }

    // どういうこと？: 3人全員がハコ下
    if (game.players.filter(pp => pp.playerId !== playerId).every(pp => pp.score < 0)) {
      unlock('g_all_minus');
    }

    // 泥沼を制す: 1着の点数 < 35000
    if (p.score < 35000) unlock('s_muddy_win');

    // 氷のテーブル: 1着の点数 < 31000
    if (p.score < 31000) unlock('p_ice_table');
  }

  // スコア系チェック（全ゲーム）
  for (let i = 0; i < scores.length; i++) {
    const s = scores[i];
    const pt = points[i];
    if (s >= 50000) unlock('s_wall_50k');
    if (s >= 60000) unlock('s_wall_60k');
    if (s >= 70000) unlock('g_wall_70k');
    if (s >= 80000) unlock('g_wall_80k');
    if (s >= 100000) unlock('p_wall_100k');
    if (s >= 0 && s <= 1000) unlock('s_near_fly');
    if (s > 0 && s % 10000 === 0) unlock('s_round_score');
    if (pt > 100) unlock('g_big_top');

    // 不運なる猛者: 2着なのに50000超え
    if (ranks[i] === 2 && s >= 50000) unlock('p_unlucky_runner');
  }

  // 役満目撃者
  if (playerGames.some(g => g.events?.some(e => e.type === 'yakuman' && e.playerId !== playerId))) {
    unlock('b_yakuman_witness');
  }

  // ── シルバー ──────────────────────────────────────────────
  if (win1Count >= 10) unlock('s_wins10');
  if (totalGames >= 30) unlock('s_veteran30');

  // 連勝街道・安定の極み・鉄壁の守り（日次ランク使用）
  if (hasConsecutiveStreak(dailyRanks, 2, r => r === 1)) unlock('s_session_win2');
  if (hasConsecutiveStreak(dailyRanks, 3, r => r <= 2)) unlock('s_session_rentai3');
  if (hasConsecutiveStreak(dailyRanks, 4, r => r < 4)) unlock('s_session_nolast4');

  // 月次チェック
  if (latestDate) {
    const monthPrefix = latestDate.slice(0, 7);
    const monthlyTotal = getMonthlyTotal(playerId, sortedAll, monthPrefix);
    if (monthlyTotal > 0) unlock('s_monthly_profit');
    if (monthlyTotal >= 300) unlock('g_mvp_month');

    // 無傷の月間（5試合=5日以上、ラスなし）
    const monthGames = playerGames.filter(g => g.date.startsWith(monthPrefix));
    const monthDates = new Set(monthGames.map(g => g.date));
    if (monthDates.size >= 5) {
      const monthRanks = monthGames.map(g => g.players.find(p => p.playerId === playerId)!.rank);
      if (monthRanks.every(r => r !== 4)) unlock('g_clean_month');
    }
    // 天下無双の月間（10試合=10日以上、3着・4着なし） ← manual
  }

  // ── ゴールド ──────────────────────────────────────────────
  if (totalGames >= 100) unlock('g_century');
  if (win1Count >= 50) unlock('g_wins50');
  if (totalPoint >= 500) unlock('g_half_million');

  // ハットトリック・無敗の進撃・鉄壁（日次ランク）
  if (hasConsecutiveStreak(dailyRanks, 3, r => r === 1)) unlock('g_hat_trick');
  if (hasConsecutiveStreak(dailyRanks, 5, r => r <= 2)) unlock('g_invincible5');
  if (hasConsecutiveStreak(dailyRanks, 10, r => r !== 4)) unlock('g_iron_wall10');

  // トップランカー: 30ゲーム以上 かつ 平均順位 ≤ 2.00
  if (totalGames >= 30) {
    const avgRank = ranks.reduce((s, v) => s + v, 0) / ranks.length;
    if (avgRank <= 2.0) unlock('g_top_ranker');
  }

  // 勝率5割: 20ゲーム以上 かつ トップ率 ≥ 50%
  if (totalGames >= 20 && win1Count / totalGames >= 0.5) unlock('g_top_rate50');

  // ── プラチナ ──────────────────────────────────────────────
  if (totalGames >= 300) unlock('p_mahjong_child');
  if (win1Count >= 100) unlock('p_absolute_king');
  if (totalPoint >= 1000) unlock('p_above_clouds');

  // 四神降臨〜金剛不壊（日次ランク）
  if (hasConsecutiveStreak(dailyRanks, 4, r => r === 1)) unlock('p_four_gods');
  if (hasConsecutiveStreak(dailyRanks, 5, r => r === 1)) unlock('p_five_emperors');
  if (hasConsecutiveStreak(dailyRanks, 10, r => r <= 2)) unlock('p_divine_rentai');
  if (hasConsecutiveStreak(dailyRanks, 20, r => r !== 4)) unlock('p_diamond_guard');

  // グランドマスター: 100ゲーム以上 かつ トップ率 ≥ 40%
  if (totalGames >= 100 && win1Count / totalGames >= 0.4) unlock('p_grand_master');

  // 鉄壁の防空壕: 100ゲーム以上 かつ ラス率 ≤ 10%
  if (totalGames >= 100) {
    const lastCount = ranks.filter(r => r === 4).length;
    if (lastCount / totalGames <= 0.1) unlock('p_iron_fortress');
  }

  // 同点1着
  for (const game of playerGames) {
    const p = game.players.find(pp => pp.playerId === playerId)!;
    if (p.rank !== 1) continue;
    const rank2 = game.players.find(pp => pp.rank === 2);
    if (rank2 && rank2.score === p.score) unlock('p_tied');
  }

  // 江戸川の伝説: 累計100日
  const distinctDays = new Set(playerGames.map(g => g.date)).size;
  if (distinctDays >= 100) unlock('p_edogawa');

  // アンダーグラウンド: フライ回数
  if (flyCount >= 1) unlock('ug_fly1');
  if (flyCount >= 2) unlock('ug_fly2');
  if (flyCount >= 3) unlock('ug_fly3');
  if (flyCount >= 5) unlock('ug_fly5');
  if (flyCount >= 10) unlock('ug_fly10');

  // アンダーグラウンド: スコアゾーン
  for (const s of scores) {
    if (s >= -5000 && s < 0)   unlock('ug_zone1');
    if (s >= -10000 && s < -5000)  unlock('ug_zone2');
    if (s >= -15000 && s < -10000) unlock('ug_zone3');
    if (s >= -20000 && s < -15000) unlock('ug_zone4');
    if (s < -20000) unlock('ug_zone5');
  }

  // ── スペシャル（役満）──────────────────────────────────
  if (hasYakumanType(playerId, playerGames, '国士無双'))     unlock('sp_kokushi');
  if (hasYakumanType(playerId, playerGames, '国士無双十三面')) unlock('sp_kokushi13');
  if (hasYakumanType(playerId, playerGames, '四暗刻'))       unlock('sp_suanko');
  if (hasYakumanType(playerId, playerGames, '四暗刻単騎'))   unlock('sp_suanko_tanki');
  if (hasYakumanType(playerId, playerGames, '大三元'))       unlock('sp_daisangen');
  if (hasYakumanType(playerId, playerGames, '緑一色'))       unlock('sp_ryuiso');
  if (hasYakumanType(playerId, playerGames, '九蓮宝燈'))     unlock('sp_churenko');
  if (hasYakumanType(playerId, playerGames, '純正九蓮宝燈')) unlock('sp_churenko9');
  if (hasYakumanType(playerId, playerGames, '清老頭'))       unlock('sp_chinroto');
  if (hasYakumanType(playerId, playerGames, '字一色'))       unlock('sp_tsuiso');
  if (hasYakumanType(playerId, playerGames, '小四喜'))       unlock('sp_shosushi');
  if (hasYakumanType(playerId, playerGames, '大四喜'))       unlock('sp_daisushi');
  if (hasYakumanType(playerId, playerGames, '四槓子'))       unlock('sp_sikantu');
  if (hasYakumanType(playerId, playerGames, '天和'))         unlock('sp_tenhou');
  if (hasYakumanType(playerId, playerGames, '地和'))         unlock('sp_chihou');

  // 魂を刈る死神: 役満 + 相手をハコ下に
  for (const game of playerGames) {
    const hasMyYakuman = game.events?.some(e => e.type === 'yakuman' && e.playerId === playerId && (e.yakumanList?.length ?? 0) > 0);
    if (hasMyYakuman && game.players.some(p => p.playerId !== playerId && p.score < 0)) {
      unlock('sp_death_reaper');
    }
  }

  // ── インポッシブル（トリガーゲームのみチェック）──────────
  if (triggerGame) {
    const tScores = triggerGame.players.map(p => p.score).sort((a, b) => b - a);
    const tPlayerScore = triggerResult?.score ?? -999999;

    // 完全なる平和: 全員25,000点
    if (tScores.every(s => s === 25000)) unlock('imp_all_equal');

    // 等差の奇跡: 40000, 30000, 20000, 10000
    if (tScores.length === 4 && tScores[0] === 40000 && tScores[1] === 30000 && tScores[2] === 20000 && tScores[3] === 10000) {
      unlock('imp_arithmetic');
    }

    // 絶対零度: 誰かが0点
    if (tScores.some(s => s === 0)) unlock('imp_zero_score');

    // 双子の卓: 1・2位同点 AND 3・4位同点
    if (tScores.length === 4 && tScores[0] === tScores[1] && tScores[2] === tScores[3]) {
      unlock('imp_twins');
    }

    // 神々の遊び: 全員 10000の倍数
    if (tScores.every(s => s > 0 && s % 10000 === 0)) unlock('imp_all_round');

    // エンジェルナンバー
    if (isAngel(tPlayerScore)) unlock('imp_angel');

    // 一気通貫スコア
    if (isConsecutiveDigits(tPlayerScore)) unlock('imp_consecutive_digits');

    // 奇跡の階段: 3つの差が全て同じ
    if (tScores.length === 4) {
      const d1 = tScores[0] - tScores[1];
      const d2 = tScores[1] - tScores[2];
      const d3 = tScores[2] - tScores[3];
      if (d1 === d2 && d2 === d3 && d1 > 0) unlock('imp_stairs');
    }

    // 究極のトップタイ: 3人が同点1着
    const topScore = tScores[0];
    if (tScores.filter(s => s === topScore).length >= 3) unlock('imp_triple_top');

    // 死線の淵: 4だけの数字
    if (isDeathHand(tPlayerScore)) unlock('imp_death_hand');

    // ラッキーセブン: 7だけの数字
    if (isLucky7(tPlayerScore)) unlock('imp_lucky7');

    // ブラックホール: 誰かが-30000未満
    if (tScores.some(s => s < -30000)) unlock('imp_black_hole');

    // 原点回帰の呪縛: プレイヤーのスコアが25000 ± 100
    if (Math.abs(tPlayerScore - 25000) <= 100 && tPlayerScore !== 0) unlock('imp_origin');

    // 100点の極限: 全員の点差 ≤ 1000
    if (tScores.length === 4 && tScores[0] - tScores[3] <= 1000) unlock('imp_100pt_gap');

    // 無の境地: 全員が25000から±1000以内
    if (tScores.every(s => Math.abs(s - 25000) <= 1000)) unlock('imp_void');
  }

  return newTrophies;
}

// ─────────────────────────────────────────────────────────────
// ランク別グループ化
// ─────────────────────────────────────────────────────────────
export function getTrophiesByRank(): Record<TrophyRank, TrophyDefinition[]> {
  const result = {} as Record<TrophyRank, TrophyDefinition[]>;
  for (const rank of RANK_ORDER) result[rank] = [];
  for (const def of Object.values(TROPHY_DEFINITIONS)) {
    result[def.rank].push(def);
  }
  return result;
}
