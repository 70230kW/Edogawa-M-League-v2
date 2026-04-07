import { create } from 'zustand';
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  setDoc,
  getDoc,
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import { GameRecord, GamePlayer, GameEvent, LeagueSettings, Standing } from '@/types';
import { calcPoint } from '@/utils/pointCalc';
import { removeUndefined } from '@/utils/firestore';

interface GameState {
  games: GameRecord[];
  loading: boolean;
  loadGames: (leagueId: string, seasonId: string) => Promise<void>;
  subscribeGames: (leagueId: string, seasonId: string) => () => void;
  addGame: (
    leagueId: string,
    seasonId: string,
    data: {
      date: string;
      gameType: 'east' | 'south';
      players: GamePlayer[];
      events?: GameEvent[];
      notes?: string;
    },
    settings: LeagueSettings,
    createdBy: string
  ) => Promise<string>;
  deleteGame: (leagueId: string, seasonId: string, gameId: string) => Promise<void>;
}

async function recalcStandings(
  leagueId: string,
  seasonId: string
): Promise<void> {
  const gamesSnap = await getDocs(
    query(
      collection(db, 'leagues', leagueId, 'seasons', seasonId, 'games'),
      orderBy('date')
    )
  );

  const playerStats: Record<string, {
    totalGames: number;
    totalPoint: number;
    rankCounts: number[];
  }> = {};

  for (const gameDoc of gamesSnap.docs) {
    const game = gameDoc.data();
    for (const p of game.players as GamePlayer[]) {
      if (!playerStats[p.playerId]) {
        playerStats[p.playerId] = { totalGames: 0, totalPoint: 0, rankCounts: [0, 0, 0, 0] };
      }
      playerStats[p.playerId].totalGames++;
      playerStats[p.playerId].totalPoint += p.point;
      playerStats[p.playerId].rankCounts[p.rank - 1]++;
    }
  }

  for (const [playerId, stats] of Object.entries(playerStats)) {
    const totalGames = stats.totalGames;
    const standing: Standing = {
      playerId,
      totalGames,
      totalPoint: Math.round(stats.totalPoint * 10) / 10,
      avgRank: totalGames > 0
        ? Math.round((stats.rankCounts.reduce((s, c, i) => s + c * (i + 1), 0) / totalGames) * 100) / 100
        : 0,
      top1Rate: totalGames > 0 ? Math.round((stats.rankCounts[0] / totalGames) * 1000) / 10 : 0,
      top2Rate: totalGames > 0 ? Math.round(((stats.rankCounts[0] + stats.rankCounts[1]) / totalGames) * 1000) / 10 : 0,
      lastRate: totalGames > 0 ? Math.round((stats.rankCounts[3] / totalGames) * 1000) / 10 : 0,
      lastUpdated: new Date(),
    };
    await setDoc(
      doc(db, 'leagues', leagueId, 'seasons', seasonId, 'standings', playerId),
      { ...standing, lastUpdated: serverTimestamp() }
    );
  }
}

export const useGameStore = create<GameState>((set) => ({
  games: [],
  loading: false,

  loadGames: async (leagueId, seasonId) => {
    set({ loading: true });
    const q = query(
      collection(db, 'leagues', leagueId, 'seasons', seasonId, 'games'),
      orderBy('date', 'desc')
    );
    const snap = await getDocs(q);
    const games = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      createdAt: d.data().createdAt?.toDate() ?? new Date(),
    })) as GameRecord[];
    set({ games, loading: false });
  },

  subscribeGames: (leagueId, seasonId) => {
    const q = query(
      collection(db, 'leagues', leagueId, 'seasons', seasonId, 'games'),
      orderBy('date', 'desc')
    );
    return onSnapshot(q, (snap) => {
      const games = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        createdAt: d.data().createdAt?.toDate() ?? new Date(),
      })) as GameRecord[];
      set({ games });
    });
  },

  addGame: async (leagueId, seasonId, data, settings, createdBy) => {
    const playersWithPoints = data.players.map((p) => ({
      ...p,
      point: calcPoint(p.score, p.rank, settings),
    }));

    const ref = await addDoc(
      collection(db, 'leagues', leagueId, 'seasons', seasonId, 'games'),
      removeUndefined({
        ...data,
        players: playersWithPoints,
        createdAt: serverTimestamp(),
        createdBy,
      })
    );

    await recalcStandings(leagueId, seasonId);
    return ref.id;
  },

  deleteGame: async (leagueId, seasonId, gameId) => {
    await deleteDoc(
      doc(db, 'leagues', leagueId, 'seasons', seasonId, 'games', gameId)
    );
    await recalcStandings(leagueId, seasonId);
  },
}));
