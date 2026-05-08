import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { type LucideIcon, BookOpen, Search, BarChart2, AlertTriangle, Shield, HelpCircle, Swords } from 'lucide-react';
import { calcPoint, M_LEAGUE_SETTINGS } from '@/utils/pointCalc';

// ---- Tab types ----
type Tab = 'calc' | 'yaku' | 'penalty' | 'basic' | 'faq';

const TABS: { id: Tab; label: string; Icon: LucideIcon }[] = [
  { id: 'calc', label: '計算方法', Icon: BarChart2 },
  { id: 'yaku', label: '役一覧', Icon: Swords },
  { id: 'penalty', label: '罰則', Icon: AlertTriangle },
  { id: 'basic', label: '基本ルール', Icon: Shield },
  { id: 'faq', label: 'よくある疑問', Icon: HelpCircle },
];

// ---- Yaku data ----
const YAKU_LIST = [
  { name: 'リーチ', han: 1, closed: true, note: '門前限定' },
  { name: 'メンゼンツモ', han: 1, closed: true, note: '門前限定' },
  { name: 'タンヤオ', han: 1, closed: false, note: '' },
  { name: 'ピンフ', han: 1, closed: true, note: '門前限定' },
  { name: '一盃口', han: 1, closed: true, note: '門前限定' },
  { name: '役牌（自風）', han: 1, closed: false, note: '' },
  { name: '役牌（場風）', han: 1, closed: false, note: '' },
  { name: '役牌（三元牌）', han: 1, closed: false, note: '' },
  { name: 'チャンタ', han: 2, closed: false, note: '食い下がり1翻' },
  { name: '三色同順', han: 2, closed: false, note: '食い下がり1翻' },
  { name: '一気通貫', han: 2, closed: false, note: '食い下がり1翻' },
  { name: 'トイトイ', han: 2, closed: false, note: '' },
  { name: '三暗刻', han: 2, closed: false, note: '' },
  { name: '三槓子', han: 2, closed: false, note: '' },
  { name: '三色同刻', han: 2, closed: false, note: '' },
  { name: '小三元', han: 2, closed: false, note: '' },
  { name: 'ダブルリーチ', han: 2, closed: true, note: '門前限定' },
  { name: 'チーイートー', han: 2, closed: true, note: '門前限定' },
  { name: 'ホンイツ', han: 3, closed: false, note: '食い下がり2翻' },
  { name: '純チャン', han: 3, closed: false, note: '食い下がり2翻' },
  { name: '二盃口', han: 3, closed: true, note: '門前限定' },
  { name: 'チンイツ', han: 6, closed: false, note: '食い下がり5翻' },
  { name: '天和', han: 99, closed: true, note: '役満' },
  { name: '地和', han: 99, closed: true, note: '役満' },
  { name: '国士無双', han: 99, closed: true, note: '役満' },
  { name: '四暗刻', han: 99, closed: true, note: '役満' },
  { name: '大三元', han: 99, closed: false, note: '役満' },
  { name: '緑一色', han: 99, closed: false, note: '役満' },
  { name: '字一色', han: 99, closed: false, note: '役満' },
  { name: '小四喜', han: 99, closed: false, note: '役満' },
  { name: '大四喜', han: 99, closed: false, note: '役満（ダブル）' },
  { name: '清老頭', han: 99, closed: false, note: '役満' },
  { name: '四槓子', han: 99, closed: false, note: '役満' },
  { name: '九蓮宝燈', han: 99, closed: true, note: '役満' },
];

// ---- 検索インデックス ----
interface SearchItem {
  category: string;
  title: string;
  body?: string;
  tag?: string;
}

const SEARCH_INDEX: SearchItem[] = [
  // 基本ルール
  { category: '基本ルール', title: '競技形式', body: '半荘戦（東南戦）。4人打ち。' },
  { category: '基本ルール', title: '原点', body: '25,000点' },
  { category: '基本ルール', title: '返し点', body: '30,000点' },
  { category: '基本ルール', title: 'ドラ', body: '赤ドラあり・裏ドラあり' },
  { category: '基本ルール', title: '途中流局', body: 'なし（九種九牌・四風連打・三家和・四槓散了 を除く）' },
  { category: '基本ルール', title: '同点処理', body: '上家優先（起家から時計回り）' },
  { category: '基本ルール', title: 'リーチ棒', body: 'アガりプレイヤーが取得。流局時は供託に積み続ける' },
  { category: '基本ルール', title: '積み棒', body: '1本場ごとに300点加算（全員から100点ずつ）' },
  // 罰則
  { category: '罰則', title: 'チョンボ（−20pt）', body: '誤ロン・ノーテンリーチ・リーチ後不正カン・牌山崩し など' },
  { category: '罰則', title: '誤ロン', body: 'ロン和了の誤申告' },
  { category: '罰則', title: 'ノーテンリーチ', body: 'テンパイしていないのにリーチ' },
  { category: '罰則', title: 'リーチ後不正カン', body: 'リーチ後のカン牌が手牌を変更する' },
  { category: '罰則', title: 'アガリ放棄', body: '不法なアガリ宣言・手牌変更カン・正当ロン見逃し（フリテン）' },
  // FAQ
  { category: 'よくある疑問', title: '飛び（持ち点が0以下）', body: '対局終了。飛ばしたプレイヤーが1位。飛んだプレイヤーは点数順で順位決定。最終素点は0点として扱う。' },
  { category: 'よくある疑問', title: '同点の場合', body: '起家（東）から時計回りに上位を優先。' },
  { category: 'よくある疑問', title: 'リーチ棒', body: 'アガったプレイヤーが取得する。流局時は次局に持ち越し（供託）。' },
  { category: 'よくある疑問', title: 'チョンボのペナルティ', body: '誤りが発生した局終了時に−20ptが適用される。素点への直接影響はなくポイントに反映。' },
  { category: 'よくある疑問', title: 'オカ', body: '(返し点30,000 − 原点25,000) × 4人 ÷ 1,000 = 20pt が1位に加算されるボーナス。' },
  { category: 'よくある疑問', title: '東風戦と半荘戦の違い', body: '東風戦は東場のみ（4局程度）。半荘戦は東場＋南場（8局程度）。Mリーグは半荘戦。' },
  // 役一覧（YAKU_LISTから）
  ...YAKU_LIST.map((y) => ({
    category: '役一覧',
    title: y.name,
    body: y.note || undefined,
    tag: y.han === 99 ? '役満' : `${y.han}翻`,
  })),
];

function highlight(text: string, query: string) {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-accent/30 text-accent rounded px-0.5">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  );
}

const CATEGORY_COLORS: Record<string, string> = {
  '役一覧': 'text-purple-300 bg-purple-900/20 border-purple-500/20',
  '基本ルール': 'text-blue-300 bg-blue-900/20 border-blue-500/20',
  '罰則': 'text-danger bg-danger/10 border-danger/20',
  'よくある疑問': 'text-accent bg-accent/10 border-accent/20',
};

const SearchResults: React.FC<{ query: string }> = ({ query }) => {
  const q = query.trim().toLowerCase();
  const results = SEARCH_INDEX.filter(
    (item) =>
      item.title.toLowerCase().includes(q) ||
      (item.body ?? '').toLowerCase().includes(q) ||
      (item.tag ?? '').toLowerCase().includes(q)
  );

  if (results.length === 0) {
    return (
      <div className="text-center py-12 text-white/30">
        <Search className="w-8 h-8 mx-auto mb-2 opacity-30" />
        <p className="text-sm">「{query}」に一致するルールが見つかりませんでした</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-white/30">{results.length}件ヒット</p>
      {results.map((item, i) => (
        <div key={i} className="bg-bg-card border border-white/10 rounded-xl px-4 py-3 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[10px] px-1.5 py-0.5 rounded border ${CATEGORY_COLORS[item.category] ?? 'text-white/40 border-white/10'}`}>
              {item.category}
            </span>
            {item.tag && (
              <span className="text-[10px] px-1.5 py-0.5 rounded border border-white/10 text-white/40">
                {item.tag}
              </span>
            )}
          </div>
          <p className="text-white font-medium text-sm">{highlight(item.title, query.trim())}</p>
          {item.body && (
            <p className="text-white/50 text-xs leading-relaxed">{highlight(item.body, query.trim())}</p>
          )}
        </div>
      ))}
    </div>
  );
};

const HAN_FILTER_OPTIONS = [
  { label: 'すべて', value: 0 },
  { label: '1翻', value: 1 },
  { label: '2翻', value: 2 },
  { label: '3翻', value: 3 },
  { label: '6翻', value: 6 },
  { label: '役満', value: 99 },
];

// ---- PointSimulator ----
const PointSimulator: React.FC = () => {
  const [score, setScore] = useState(30000);
  const [rank, setRank] = useState(1);

  const point = calcPoint(score, rank, M_LEAGUE_SETTINGS);

  return (
    <div className="bg-white/5 border border-accent/20 rounded-2xl p-4 space-y-4">
      <h3 className="text-sm font-bold text-accent">ポイントシミュレーター</h3>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-white/50 block mb-1">素点</label>
          <input
            type="number"
            value={score}
            step={100}
            onChange={(e) => setScore(Number(e.target.value))}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-right focus:outline-none focus:border-accent"
          />
        </div>
        <div>
          <label className="text-xs text-white/50 block mb-1">順位</label>
          <select
            value={rank}
            onChange={(e) => setRank(Number(e.target.value))}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-accent"
          >
            {[1, 2, 3, 4].map((r) => (
              <option key={r} value={r} className="bg-gray-900">{r}位</option>
            ))}
          </select>
        </div>
      </div>

      <div className="text-center bg-bg rounded-xl p-4 border border-white/10">
        <p className="text-xs text-white/40 mb-1">最終ポイント</p>
        <p className={`text-4xl font-black ${point >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {point > 0 ? '+' : ''}{point.toFixed(1)}
          <span className="text-lg ml-1">pt</span>
        </p>
        <p className="text-xs text-white/30 mt-2">
          素点換算: {((score - 30000) / 1000).toFixed(1)} ＋ 順位点: {M_LEAGUE_SETTINGS.rankPoints[rank - 1]}
          {rank === 1 ? ` ＋ オカ: ${M_LEAGUE_SETTINGS.oka}` : ''}
        </p>
      </div>
    </div>
  );
};

// ---- Tabs ----
const CalcTab: React.FC = () => (
  <div className="space-y-4">
    <PointSimulator />

    <div className="bg-bg-card border border-white/10 rounded-2xl p-4 space-y-3">
      <h3 className="text-sm font-bold text-white/70">計算式</h3>
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-white/60">
          <span className="bg-white/10 px-2 py-1 rounded text-xs font-mono">素点換算</span>
          <span>= (素点 − 30,000) ÷ 1,000</span>
        </div>
        <div className="flex items-center gap-2 text-white/60">
          <span className="bg-white/10 px-2 py-1 rounded text-xs font-mono">最終ポイント</span>
          <span>= 素点換算 ＋ 順位点 ＋ オカ（1位のみ）</span>
        </div>
      </div>
    </div>

    <div className="bg-bg-card border border-white/10 rounded-2xl p-4">
      <h3 className="text-sm font-bold text-white/70 mb-3">順位点表</h3>
      <div className="grid grid-cols-4 gap-2">
        {[
          { rank: '1位', point: '+50', color: 'text-yellow-400 bg-yellow-900/20 border-yellow-500/30' },
          { rank: '2位', point: '+10', color: 'text-gray-300 bg-gray-700/20 border-gray-500/30' },
          { rank: '3位', point: '−10', color: 'text-orange-400 bg-orange-900/20 border-orange-500/30' },
          { rank: '4位', point: '−30', color: 'text-red-400 bg-red-900/20 border-red-500/30' },
        ].map((item) => (
          <div
            key={item.rank}
            className={`text-center p-3 rounded-xl border ${item.color}`}
          >
            <p className="text-xs opacity-70">{item.rank}</p>
            <p className="text-lg font-bold">{item.point}</p>
            <p className="text-[10px] opacity-50">pt</p>
          </div>
        ))}
      </div>
    </div>

    <div className="bg-bg-card border border-white/10 rounded-2xl p-4 space-y-2 text-sm text-white/60">
      <p><span className="text-accent font-bold">オカ</span>：(返し点 − 原点) × 人数 ÷ 1000 = 20pt を1位に加算</p>
      <p><span className="text-danger font-bold">チョンボ</span>：−20pt（ペナルティ）</p>
    </div>
  </div>
);

const YakuTab: React.FC = () => {
  const [hanFilter, setHanFilter] = useState(0);

  const filtered = YAKU_LIST.filter((y) => hanFilter === 0 || y.han === hanFilter);

  return (
    <div className="space-y-3">
      <div className="flex gap-1 overflow-x-auto pb-1">
        {HAN_FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setHanFilter(opt.value)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs border transition-colors ${
              hanFilter === opt.value
                ? 'bg-accent/20 border-accent/50 text-accent'
                : 'border-white/10 text-white/50'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="space-y-1.5">
        {filtered.map((y) => (
          <div
            key={y.name}
            className="flex items-center justify-between bg-bg-card border border-white/10 rounded-xl px-4 py-3"
          >
            <div>
              <p className="text-white font-medium text-sm">{y.name}</p>
              {y.note && <p className="text-xs text-white/40">{y.note}</p>}
            </div>
            <div className="text-right">
              <span
                className={`text-xs font-bold px-2 py-1 rounded-lg ${
                  y.han === 99
                    ? 'bg-accent/20 text-accent border border-accent/30'
                    : y.han >= 6
                    ? 'bg-purple-900/30 text-purple-300 border border-purple-500/30'
                    : y.han >= 3
                    ? 'bg-blue-900/30 text-blue-300 border border-blue-500/30'
                    : 'bg-white/10 text-white/70'
                }`}
              >
                {y.han === 99 ? '役満' : `${y.han}翻`}
              </span>
              {y.closed && (
                <p className="text-[10px] text-white/30 mt-0.5">◎ 門前</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const PenaltyTab: React.FC = () => (
  <div className="space-y-4">
    <div className="bg-danger/10 border border-danger/30 rounded-2xl p-4 space-y-3">
      <h3 className="text-danger font-bold text-sm flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5" />チョンボ（−20pt）</h3>
      {[
        ['誤ロン', 'ロン和了の誤申告'],
        ['ノーテンリーチ', 'テンパイしていないのにリーチ'],
        ['リーチ後不正カン', 'リーチ後のカン牌が手牌を変更する'],
        ['牌山崩し', '牌山を崩した場合'],
        ['その他', '競技規則に反する行為'],
      ].map(([type, desc]) => (
        <div key={type} className="flex items-start gap-3">
          <span className="text-danger text-sm mt-0.5">●</span>
          <div>
            <p className="text-white font-medium text-sm">{type}</p>
            <p className="text-white/50 text-xs">{desc}</p>
          </div>
        </div>
      ))}
    </div>

    <div className="bg-orange-900/10 border border-orange-500/20 rounded-2xl p-4 space-y-3">
      <h3 className="text-orange-400 font-bold text-sm flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5" />アガリ放棄</h3>
      {[
        '不法なアガリを宣言した場合',
        'リーチ後、手牌を変更するカンを行った場合',
        '正当なロンを見逃した場合（フリテン）',
      ].map((item) => (
        <div key={item} className="flex items-start gap-3">
          <span className="text-orange-400 text-sm mt-0.5">●</span>
          <p className="text-white/70 text-sm">{item}</p>
        </div>
      ))}
    </div>
  </div>
);

const BasicTab: React.FC = () => (
  <div className="space-y-3">
    {[
      { title: '競技形式', content: '半荘戦（東南戦）。4人打ち。' },
      { title: '原点', content: '25,000点' },
      { title: '返し点', content: '30,000点' },
      { title: 'ドラ', content: '赤ドラあり・裏ドラあり' },
      { title: '途中流局', content: 'なし（九種九牌・四風連打・三家和・四槓散了 を除く）' },
      { title: '同点処理', content: '上家優先（起家から時計回り）' },
      { title: 'リーチ棒', content: 'アガりプレイヤーが取得。流局時は供託に積み続ける' },
      { title: '積み棒', content: '1本場ごとに300点加算（全員から100点ずつ）' },
    ].map((item) => (
      <div
        key={item.title}
        className="bg-bg-card border border-white/10 rounded-xl px-4 py-3"
      >
        <p className="text-xs text-white/40 mb-1">{item.title}</p>
        <p className="text-white text-sm">{item.content}</p>
      </div>
    ))}
  </div>
);

const FaqTab: React.FC = () => (
  <div className="space-y-3">
    {[
      {
        q: '飛んだ場合（持ち点が0以下）はどうなる？',
        a: '対局終了。飛ばしたプレイヤーが1位、飛んだプレイヤーは点数順で順位決定。最終素点は0点として扱う。',
      },
      {
        q: '同点の場合はどうなる？',
        a: '起家（東）から時計回りに上位を優先。例えば同点なら起家が上位。',
      },
      {
        q: 'リーチ棒はどこへ行く？',
        a: 'アガったプレイヤーが取得する。流局時は次局に持ち越し（供託）。',
      },
      {
        q: 'チョンボのペナルティはいつ適用される？',
        a: '誤りが発生した局終了時に−20ptが適用される。素点への直接影響はなくポイントに反映。',
      },
      {
        q: 'オカとは何？',
        a: '(返し点30,000 − 原点25,000) × 4人 ÷ 1,000 = 20pt が1位に加算されるボーナス。',
      },
      {
        q: '東風戦と半荘戦の違いは？',
        a: '東風戦は東場のみ（4局程度）。半荘戦は東場＋南場（8局程度）。Mリーグは半荘戦。',
      },
    ].map((item) => (
      <div
        key={item.q}
        className="bg-bg-card border border-white/10 rounded-2xl p-4 space-y-2"
      >
        <p className="text-accent font-medium text-sm">Q. {item.q}</p>
        <p className="text-white/70 text-sm leading-relaxed">A. {item.a}</p>
      </div>
    ))}
  </div>
);

// ---- Main page ----
export const Rules: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab') as Tab | null;
  const queryParam = searchParams.get('q') ?? '';

  const [activeTab, setActiveTab] = useState<Tab>(tabParam ?? 'calc');
  const [search, setSearch] = useState(queryParam);

  const switchTab = (id: Tab) => {
    setActiveTab(id);
    setSearchParams({ tab: id });
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold text-white flex items-center gap-2">
        <BookOpen className="w-5 h-5 text-accent" />
        ルール確認
      </h1>

      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 w-4 h-4" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ルールを検索… (チョンボ、役満、など)"
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-accent text-sm"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1 -mx-4 px-4">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => switchTab(tab.id)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
              activeTab === tab.id
                ? 'bg-primary border-accent/40 text-accent'
                : 'bg-white/5 border-white/10 text-white/50'
            }`}
          >
            <tab.Icon className="w-3.5 h-3.5" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content / Search results */}
      <div>
        {search.trim() ? (
          <SearchResults query={search} />
        ) : (
          <>
            {activeTab === 'calc' && <CalcTab />}
            {activeTab === 'yaku' && <YakuTab />}
            {activeTab === 'penalty' && <PenaltyTab />}
            {activeTab === 'basic' && <BasicTab />}
            {activeTab === 'faq' && <FaqTab />}
          </>
        )}
      </div>
    </div>
  );
};
