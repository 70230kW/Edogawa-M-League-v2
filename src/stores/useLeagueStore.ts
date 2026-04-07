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

  loadPlayers: (leagueId: string) => Promise<void>;
  addPlayer: (leagueId: string, name: string, color: string) => Promise<void>;
  updatePlayer: (leagueId: string, playerId: string, data: Partial<Player>) => Promise<void>;

  loadSeasons: (leagueId: string) => Promise<void>;
  createSeason: (leagueId: string, name: string, startDate: string) => Promise<string>;
  finishSeason: (leagueId: string, seasonId: string, endDate: string) => Promise<void>;
  setCurrentSeason: (season: Season | null) => void;

  loadStandings: (leagueId: string, seasonId: string) => Promise<void>;
  subscribeStandings: (leagueId: string, seasonId: string) => () => void;
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
          createdAt: data.createdAt?.toDate() ?? new Date(),
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
    // Add owner as member
    await setDoc(doc(db, 'leagues', ref.id, 'members', ownerId), {
      uid: ownerId,
      joinedAt: serverTimestamp(),
      role: 'owner',
    });
    return ref.id;
  },

  updateLeagueSettings: async (leagueId, settings) => {
    await updateDoc(doc(db, 'leagues', leagueId), { settings });
    set((state) => ({
      league: state.league ? { ...state.league, settings } : null,
    }));
  },

  loadPlayers: async (leagueId) => {
    const q = query(collection(db, 'leagues', leagueId, 'players'), orderBy('createdAt'));
    const snap = await getDocs(q);
    const players = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      createdAt: d.data().createdAt?.toDate() ?? new Date(),
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
    set({ seasons });
    const active = seasons.find((s) => s.isActive);
    if (active) set({ currentSeason: active });
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

  setCurrentSeason: (season) => set({ currentSeason: season }),

  loadStandings: async (leagueId, seasonId) => {
    const snap = await getDocs(
      collection(db, 'leagues', leagueId, 'seasons', seasonId, 'standings')
    );
    const standings = snap.docs.map((d) => ({
      playerId: d.id,
      ...d.data(),
      lastUpdated: d.data().lastUpdated?.toDate() ?? new Date(),
    })) as Standing[];
    set({ standings });
  },

  subscribeStandings: (leagueId, seasonId) => {
    const q = collection(db, 'leagues', leagueId, 'seasons', seasonId, 'standings');
    return onSnapshot(q, (snap) => {
      const standings = snap.docs.map((d) => ({
        playerId: d.id,
        ...d.data(),
        lastUpdated: d.data().lastUpdated?.toDate() ?? new Date(),
      })) as Standing[];
      set({ standings });
    });
  },
}));
