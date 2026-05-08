import { create } from 'zustand';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import { League, Player, Season, Standing, LeagueSettings } from '@/types';
import { M_LEAGUE_SETTINGS } from '@/utils/pointCalc';
import { removeUndefined } from '@/utils/firestore';
import { toDate } from '@/utils/dateUtils';
import { deleteTimelinePostsByGameId, deleteTimelinePostsBySessionId } from '@/utils/timelineCleanup';

interface LeagueState {
  league: League | null;
  players: Player[];
  seasons: Season[];
  currentSeason: Season | null;
  standings: Standing[];
  loading: boolean;

  setLeague: (league: League | null) => void;
  loadLeague: (leagueId: string) => Promise<void>;
  createLeague: (name: string, description: string, ownerId: string) => Promise<string>;
  updateLeagueSettings: (leagueId: string, settings: LeagueSettings) => Promise<void>;
  updateLeagueName: (leagueId: string, name: string, description: string) => Promise<void>;

  loadPlayers: (leagueId: string) => Promise<void>;
  addPlayer: (leagueId: string, name: string, color: string) => Promise<void>;
  updatePlayer: (leagueId: string, playerId: string, data: Partial<Player>) => Promise<void>;

  loadSeasons: (leagueId: string) => Promise<void>;
  createSeason: (leagueId: string, name: string, startDate: string) => Promise<string>;
  finishSeason: (leagueId: string, seasonId: string, endDate: string) => Promise<void>;
  setCurrentSeason: (season: Season | null) => void;

  loadStandings: (leagueId: string, seasonId: string) => Promise<void>;
  subscribeStandings: (leagueId: string, seasonId: string) => () => void;

  linkPlayerToUser: (leagueId: string, playerId: string, userId: string, userEmail: string) => Promise<void>;
  unlinkPlayer: (leagueId: string, playerId: string) => Promise<void>;

  deleteSeason: (leagueId: string, seasonId: string) => Promise<void>;
  clearLeague: () => void;
}

export const useLeagueStore = create<LeagueState>((set, get) => ({
  league: null,
  players: [],
  seasons: [],
  currentSeason: null,
  standings: [],
  loading: false,

  setLeague: (league) => set({ league }),

  loadLeague: async (leagueId) => {
    set({ loading: true });
    const snap = await getDoc(doc(db, 'leagues', leagueId));
    if (snap.exists()) {
      const data = snap.data();
      set({
        league: {
          id: snap.id,
          ...data,
          createdAt: toDate(data.createdAt),
        } as League,
      });
    }
    set({ loading: false });
  },

  createLeague: async (name, description, ownerId) => {
    const ref = await addDoc(collection(db, 'leagues'), removeUndefined({
      name,
      description,
      ownerId,
      createdAt: serverTimestamp(),
      settings: M_LEAGUE_SETTINGS,
    }));
    await setDoc(doc(db, 'leagues', ref.id, 'members', ownerId), {
      uid: ownerId,
      joinedAt: serverTimestamp(),
      role: 'owner',
    });
    // userLeagues にリーグIDを追記（複数大会対応）
    const userLeaguesRef = doc(db, 'userLeagues', ownerId);
    const userLeaguesSnap = await getDoc(userLeaguesRef);
    const existing: string[] = userLeaguesSnap.exists() ? (userLeaguesSnap.data().leagueIds ?? []) : [];
    if (!existing.includes(ref.id)) {
      await setDoc(userLeaguesRef, { leagueIds: [...existing, ref.id] });
    }
    return ref.id;
  },

  updateLeagueSettings: async (leagueId, settings) => {
    await updateDoc(doc(db, 'leagues', leagueId), { settings });
    set((state) => ({
      league: state.league ? { ...state.league, settings } : null,
    }));
  },

  updateLeagueName: async (leagueId, name, description) => {
    await updateDoc(doc(db, 'leagues', leagueId), removeUndefined({ name, description }));
    set((state) => ({
      league: state.league ? { ...state.league, name, description } : null,
    }));
  },

  loadPlayers: async (leagueId) => {
    const q = query(collection(db, 'leagues', leagueId, 'players'), orderBy('createdAt'));
    const snap = await getDocs(q);
    const players = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      createdAt: toDate(d.data().createdAt),
    })) as Player[];
    set({ players });
  },

  addPlayer: async (leagueId, name, color) => {
    await addDoc(collection(db, 'leagues', leagueId, 'players'), {
      name,
      color,
      isActive: true,
      createdAt: serverTimestamp(),
    });
    await get().loadPlayers(leagueId);
  },

  updatePlayer: async (leagueId, playerId, data) => {
    await updateDoc(doc(db, 'leagues', leagueId, 'players', playerId), data);
    await get().loadPlayers(leagueId);
  },

  loadSeasons: async (leagueId) => {
    const q = query(collection(db, 'leagues', leagueId, 'seasons'), orderBy('startDate', 'desc'));
    const snap = await getDocs(q);
    const seasons = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as Season[];
    const active = seasons.find((s) => s.isActive) ?? null;
    set({ seasons, currentSeason: active });
  },

  createSeason: async (leagueId, name, startDate) => {
    const ref = await addDoc(collection(db, 'leagues', leagueId, 'seasons'), {
      name,
      startDate,
      isActive: true,
      status: 'active',
    });
    await get().loadSeasons(leagueId);
    return ref.id;
  },

  finishSeason: async (leagueId, seasonId, endDate) => {
    await updateDoc(doc(db, 'leagues', leagueId, 'seasons', seasonId), {
      isActive: false,
      status: 'finished',
      endDate,
    });
    await get().loadSeasons(leagueId);
  },

  deleteSeason: async (leagueId, seasonId) => {
    // 対局・セッションに紐づくTL投稿を先に削除
    const gamesSnap = await getDocs(collection(db, 'leagues', leagueId, 'seasons', seasonId, 'games'));
    await Promise.all(gamesSnap.docs.map((d) => deleteTimelinePostsByGameId(leagueId, d.id)));

    const sessionsSnap = await getDocs(collection(db, 'leagues', leagueId, 'seasons', seasonId, 'sessions'));
    await Promise.all(sessionsSnap.docs.map((d) => deleteTimelinePostsBySessionId(leagueId, d.id)));

    const colPaths = ['games', 'standings', 'sessions'] as const;
    for (const col of colPaths) {
      const snap = await getDocs(collection(db, 'leagues', leagueId, 'seasons', seasonId, col));
      await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
    }
    // プレイヤートロフィーのうち該当シーズン分を削除
    const { players } = get();
    for (const player of players) {
      const snap = await getDocs(collection(db, 'leagues', leagueId, 'players', player.id, 'trophies'));
      const targets = snap.docs.filter((d) => d.data().seasonId === seasonId);
      await Promise.all(targets.map((d) => deleteDoc(d.ref)));
    }
    await deleteDoc(doc(db, 'leagues', leagueId, 'seasons', seasonId));
    set({ standings: [] });
    await get().loadSeasons(leagueId);
  },

  clearLeague: () => set({
    league: null,
    players: [],
    seasons: [],
    currentSeason: null,
    standings: [],
  }),

  setCurrentSeason: (season) => set({ currentSeason: season }),

  loadStandings: async (leagueId, seasonId) => {
    const snap = await getDocs(
      collection(db, 'leagues', leagueId, 'seasons', seasonId, 'standings')
    );
    const standings = snap.docs.map((d) => ({
      playerId: d.id,
      ...d.data(),
      lastUpdated: toDate(d.data().lastUpdated),
    })) as Standing[];
    set({ standings });
  },

  subscribeStandings: (leagueId, seasonId) => {
    const q = collection(db, 'leagues', leagueId, 'seasons', seasonId, 'standings');
    return onSnapshot(q, (snap) => {
      const standings = snap.docs.map((d) => ({
        playerId: d.id,
        ...d.data(),
        lastUpdated: toDate(d.data().lastUpdated),
      })) as Standing[];
      set({ standings });
    });
  },

  linkPlayerToUser: async (leagueId, playerId, userId, userEmail) => {
    const { players } = get();
    const alreadyLinked = players.find(
      (p) => p.id !== playerId && p.linkedUserId === userId
    );
    if (alreadyLinked) {
      throw new Error(`このアカウントはすでに「${alreadyLinked.name}」と連携されています`);
    }
    await updateDoc(doc(db, 'leagues', leagueId, 'players', playerId), {
      linkedUserId: userId,
      linkedUserEmail: userEmail,
    });
    await get().loadPlayers(leagueId);
  },

  unlinkPlayer: async (leagueId, playerId) => {
    await updateDoc(doc(db, 'leagues', leagueId, 'players', playerId), {
      linkedUserId: null,
      linkedUserEmail: null,
    });
    await get().loadPlayers(leagueId);
  },
}));
