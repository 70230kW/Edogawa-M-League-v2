/**
 * Demo data seed script
 * Usage: npm run seed
 * Requires VITE_FIREBASE_* env vars in .env.local
 */

import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  setDoc,
  doc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ---- Settings ----
const M_LEAGUE_SETTINGS = {
  startPoints: 25000,
  returnPoints: 30000,
  rankPoints: [50, 10, -10, -30],
  oka: 20,
  playerCount: 4,
  gameType: 'south',
  hasRedDora: true,
  hasUraDora: true,
  chonboPenalty: -20,
};

function calcPoint(score: number, rank: number): number {
  const basePoint = Math.round((score - 30000) / 100) / 10;
  const rankPoint = M_LEAGUE_SETTINGS.rankPoints[rank - 1];
  const okaPoint = rank === 1 ? 20 : 0;
  return Math.round((basePoint + rankPoint + okaPoint) * 10) / 10;
}

// ---- Players ----
const PLAYERS = [
  { name: '太郎', color: '#e74c3c' },
  { name: '花子', color: '#3498db' },
  { name: '一郎', color: '#2ecc71' },
  { name: '二郎', color: '#f1c40f' },
];

// ---- Game data (15 games) ----
// Each game: array of [playerId_index, score] sorted by rank
const GAME_DATA: Array<{
  date: string;
  results: [number, number][];  // [playerIndex, score]
  events?: Array<{ type: 'yakuman' | 'chonbo'; playerIndex: number; yakumanList?: string[]; chonboType?: string }>;
  notes?: string;
}> = [
  { date: '2026-03-01', results: [[0, 38200], [1, 27800], [3, 21500], [2, 12500]] },
  { date: '2026-03-01', results: [[2, 41600], [0, 27400], [1, 18800], [3, 12200]] },
  { date: '2026-03-08', results: [[1, 35800], [3, 28400], [0, 22600], [2, 13200]] },
  { date: '2026-03-08', results: [[3, 44200], [0, 25800], [2, 20400], [1, 9600]] },
  { date: '2026-03-15', results: [[0, 47000], [2, 26200], [1, 19000], [3, 7800]], events: [
    { type: 'yakuman', playerIndex: 0, yakumanList: ['四暗刻'] }
  ], notes: '太郎が四暗刻！' },
  { date: '2026-03-15', results: [[1, 33600], [0, 28400], [2, 24000], [3, 14000]] },
  { date: '2026-03-22', results: [[2, 39400], [3, 27600], [1, 21200], [0, 11800]] },
  { date: '2026-03-22', results: [[3, 36000], [1, 29600], [0, 20800], [2, 13600]] },
  { date: '2026-03-29', results: [[0, 42800], [2, 28200], [3, 18600], [1, 10400]], events: [
    { type: 'chonbo', playerIndex: 1, chonboType: 'ノーテンリーチ' }
  ] },
  { date: '2026-03-29', results: [[1, 38600], [3, 26400], [0, 22000], [2, 13000]] },
  { date: '2026-04-01', results: [[2, 45200], [0, 25800], [1, 18600], [3, 10400]], events: [
    { type: 'yakuman', playerIndex: 2, yakumanList: ['大三元', '字一色'] }
  ], notes: '花子ダブル役満！伝説の一局' },
  { date: '2026-04-01', results: [[3, 37400], [2, 28800], [0, 21000], [1, 12800]] },
  { date: '2026-04-02', results: [[0, 40200], [1, 27600], [3, 22400], [2, 9800]] },
  { date: '2026-04-02', results: [[1, 34800], [0, 29200], [2, 23400], [3, 12600]] },
  { date: '2026-04-03', results: [[2, 48000], [3, 26400], [0, 16600], [1, 9000]] },
];

// ---- Main ----
async function seed() {
  console.log('🀄 MahjongLeague シードデータ投入開始...');

  const DEMO_OWNER_ID = 'seed-demo-owner';

  // Create league
  const leagueRef = await addDoc(collection(db, 'leagues'), {
    name: 'デモリーグ 2026',
    description: 'シードデータのデモリーグです',
    ownerId: DEMO_OWNER_ID,
    createdAt: serverTimestamp(),
    settings: M_LEAGUE_SETTINGS,
  });
  const leagueId = leagueRef.id;
  console.log(`✅ リーグ作成: ${leagueId}`);

  // Add owner as member
  await setDoc(doc(db, 'leagues', leagueId, 'members', DEMO_OWNER_ID), {
    uid: DEMO_OWNER_ID,
    joinedAt: serverTimestamp(),
    role: 'owner',
  });

  // Create players
  const playerIds: string[] = [];
  for (const p of PLAYERS) {
    const ref = await addDoc(collection(db, 'leagues', leagueId, 'players'), {
      ...p,
      isActive: true,
      createdAt: serverTimestamp(),
    });
    playerIds.push(ref.id);
    console.log(`  👤 プレイヤー追加: ${p.name} (${ref.id})`);
  }

  // Create season
  const seasonRef = await addDoc(collection(db, 'leagues', leagueId, 'seasons'), {
    name: '2026年春季リーグ',
    startDate: '2026-03-01',
    isActive: true,
    status: 'active',
  });
  const seasonId = seasonRef.id;
  console.log(`✅ シーズン作成: ${seasonId}`);

  // Create games
  const playerStats: Record<string, { totalGames: number; totalPoint: number; rankCounts: number[] }> = {};
  for (const pid of playerIds) {
    playerStats[pid] = { totalGames: 0, totalPoint: 0, rankCounts: [0, 0, 0, 0] };
  }

  for (let i = 0; i < GAME_DATA.length; i++) {
    const gd = GAME_DATA[i];

    // Assign ranks by score (highest score = rank 1)
    const sorted = [...gd.results].sort((a, b) => b[1] - a[1]);
    const players = sorted.map(([pidx, score], rank) => ({
      playerId: playerIds[pidx],
      rank: rank + 1,
      score,
      point: calcPoint(score, rank + 1),
      isFly: score <= 0,
    }));

    const events = (gd.events ?? []).map((e) => ({
      type: e.type,
      playerId: playerIds[e.playerIndex],
      ...(e.yakumanList ? { yakumanList: e.yakumanList } : {}),
      ...(e.chonboType ? { chonboType: e.chonboType } : {}),
    }));

    await addDoc(
      collection(db, 'leagues', leagueId, 'seasons', seasonId, 'games'),
      {
        date: gd.date,
        gameType: 'south',
        players,
        events,
        notes: gd.notes ?? '',
        createdAt: serverTimestamp(),
        createdBy: DEMO_OWNER_ID,
      }
    );

    // Update stats
    for (const p of players) {
      playerStats[p.playerId].totalGames++;
      playerStats[p.playerId].totalPoint += p.point;
      playerStats[p.playerId].rankCounts[p.rank - 1]++;
    }

    if (i % 5 === 0) console.log(`  🎮 ${i + 1}/${GAME_DATA.length} 対局追加済み`);
  }
  console.log(`✅ ${GAME_DATA.length}対局追加完了`);

  // Write standings
  for (const [pid, stats] of Object.entries(playerStats)) {
    const total = stats.totalGames;
    const standing = {
      playerId: pid,
      totalGames: total,
      totalPoint: Math.round(stats.totalPoint * 10) / 10,
      avgRank: total > 0
        ? Math.round((stats.rankCounts.reduce((s, c, i) => s + c * (i + 1), 0) / total) * 100) / 100
        : 0,
      top1Rate: total > 0 ? Math.round((stats.rankCounts[0] / total) * 1000) / 10 : 0,
      top2Rate: total > 0 ? Math.round(((stats.rankCounts[0] + stats.rankCounts[1]) / total) * 1000) / 10 : 0,
      lastRate: total > 0 ? Math.round((stats.rankCounts[3] / total) * 1000) / 10 : 0,
      lastUpdated: serverTimestamp(),
    };
    await setDoc(
      doc(db, 'leagues', leagueId, 'seasons', seasonId, 'standings', pid),
      standing
    );
  }
  console.log('✅ 成績集計完了');

  // Add timeline posts
  await addDoc(collection(db, 'leagues', leagueId, 'timeline'), {
    type: 'yakuman_flash',
    content: '【役満速報⚡】\n太郎 さんが、\n四暗刻 を和了しました！\nおめでとうございます！🀄',
    createdAt: Timestamp.fromDate(new Date('2026-03-15T19:30:00')),
    triggeredBy: 'system',
    meta: { gameId: 'seed', playerId: playerIds[0], yakumanList: ['四暗刻'] },
    reactions: {},
  });

  await addDoc(collection(db, 'leagues', leagueId, 'timeline'), {
    type: 'yakuman_flash',
    content: '【ダブル役満速報🔥】\n一郎 さんが、\n大三元 + 字一色 を和了しました！\nおめでとうございます！🀄',
    createdAt: Timestamp.fromDate(new Date('2026-04-01T20:15:00')),
    triggeredBy: 'system',
    meta: { gameId: 'seed', playerId: playerIds[2], yakumanList: ['大三元', '字一色'] },
    reactions: { '🎉': [playerIds[0], playerIds[1]], '😮': [playerIds[3]] },
  });

  await addDoc(collection(db, 'leagues', leagueId, 'timeline'), {
    type: 'manual',
    content: 'デモリーグへようこそ！🀄\nこのデータはシードスクリプトで自動生成されたものです。',
    createdAt: Timestamp.fromDate(new Date('2026-03-01T18:00:00')),
    triggeredBy: DEMO_OWNER_ID,
    meta: { authorId: DEMO_OWNER_ID },
    reactions: { '👍': [playerIds[1], playerIds[2]] },
  });

  console.log('✅ タイムライン投稿追加完了');
  console.log('\n🎉 シードデータ投入完了！');
  console.log(`\nリーグID: ${leagueId}`);
  console.log('Firebase ConsoleでリーグのIDを確認し、アプリに反映してください。');

  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ エラー:', err);
  process.exit(1);
});
