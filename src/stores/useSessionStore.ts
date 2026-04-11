import { create } from 'zustand';
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  arrayUnion,
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import { Session } from '@/types';
import { toDate, todayString } from '@/utils/dateUtils';

interface SessionState {
  sessions: Session[];
  currentSession: Session | null;
  subscribeSessions: (leagueId: string, seasonId: string) => () => void;
  createSession: (leagueId: string, seasonId: string, name: string, createdBy: string) => Promise<string>;
  addGameToSession: (leagueId: string, seasonId: string, sessionId: string, gameId: string) => Promise<void>;
  closeSession: (leagueId: string, seasonId: string, sessionId: string) => Promise<void>;
}

export const useSessionStore = create<SessionState>((set) => ({
  sessions: [],
  currentSession: null,

  subscribeSessions: (leagueId, seasonId) => {
    const q = query(
      collection(db, 'leagues', leagueId, 'seasons', seasonId, 'sessions'),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, (snap) => {
      const sessions = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        createdAt: toDate(d.data().createdAt),
      })) as Session[];
      const currentSession = sessions.find((s) => s.status === 'active') ?? null;
      set({ sessions, currentSession });
    });
  },

  createSession: async (leagueId, seasonId, name, createdBy) => {
    const ref = await addDoc(
      collection(db, 'leagues', leagueId, 'seasons', seasonId, 'sessions'),
      {
        name,
        date: todayString(),
        gameIds: [],
        status: 'active',
        createdAt: serverTimestamp(),
        createdBy,
      }
    );
    return ref.id;
  },

  addGameToSession: async (leagueId, seasonId, sessionId, gameId) => {
    await updateDoc(
      doc(db, 'leagues', leagueId, 'seasons', seasonId, 'sessions', sessionId),
      { gameIds: arrayUnion(gameId) }
    );
  },

  closeSession: async (leagueId, seasonId, sessionId) => {
    await updateDoc(
      doc(db, 'leagues', leagueId, 'seasons', seasonId, 'sessions', sessionId),
      { status: 'closed' }
    );
  },
}));
