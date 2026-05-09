import { create } from 'zustand';
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  startAfter,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  arrayUnion,
  arrayRemove,
  DocumentSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import { TimelinePost } from '@/types';
import { removeUndefined } from '@/utils/firestore';

function safeToDate(value: any): Date {
  if (!value) return new Date();
  if (value instanceof Timestamp) return value.toDate();
  if (value instanceof Date) return value;
  if (typeof value?.toDate === 'function') return value.toDate();
  if (typeof value?.seconds === 'number') return new Date(value.seconds * 1000);
  return new Date();
}

interface TimelineState {
  posts: TimelinePost[];
  loading: boolean;
  hasMore: boolean;
  lastDoc: DocumentSnapshot | null;
  subscribePosts: (leagueId: string) => () => void;
  loadMorePosts: (leagueId: string) => Promise<void>;
  addPost: (
    leagueId: string,
    post: Omit<TimelinePost, 'id' | 'createdAt' | 'reactions'>
  ) => Promise<string>;
  updatePost: (leagueId: string, postId: string, content: string) => Promise<void>;
  deletePost: (leagueId: string, postId: string) => Promise<void>;
  toggleReaction: (leagueId: string, postId: string, emoji: string, userId: string) => Promise<void>;
}

const PAGE_SIZE = 20;

export const useTimelineStore = create<TimelineState>((set, get) => ({
  posts: [],
  loading: false,
  hasMore: true,
  lastDoc: null,

  subscribePosts: (leagueId) => {
    const q = query(
      collection(db, 'leagues', leagueId, 'timeline'),
      orderBy('createdAt', 'desc'),
      limit(PAGE_SIZE)
    );
    return onSnapshot(
      q,
      (snap) => {
        try {
          const posts = snap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
            createdAt: safeToDate(d.data().createdAt),
          })) as TimelinePost[];
          set({ posts, lastDoc: snap.docs[snap.docs.length - 1] ?? null });
        } catch (err) {
          console.error('Timeline snapshot parse error:', err);
          set({ posts: [] });
        }
      },
      (err) => {
        console.error('Timeline snapshot error:', err);
        set({ posts: [], loading: false });
      }
    );
  },

  loadMorePosts: async (leagueId) => {
    const { lastDoc, posts } = get();
    if (!lastDoc) return;
    set({ loading: true });
    try {
      const q = query(
        collection(db, 'leagues', leagueId, 'timeline'),
        orderBy('createdAt', 'desc'),
        startAfter(lastDoc),
        limit(PAGE_SIZE)
      );
      const snap = await getDocs(q);
      const newPosts = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        createdAt: safeToDate(d.data().createdAt),
      })) as TimelinePost[];
      set({
        posts: [...posts, ...newPosts],
        lastDoc: snap.docs[snap.docs.length - 1] ?? null,
        hasMore: snap.docs.length === PAGE_SIZE,
        loading: false,
      });
    } catch (err) {
      console.error('loadMorePosts error:', err);
      set({ loading: false });
    }
  },

  addPost: async (leagueId, post) => {
    // serverTimestamp()はpending writes時にnullになるためクライアント時刻を使用
    const ref = await addDoc(
      collection(db, 'leagues', leagueId, 'timeline'),
      removeUndefined({
        ...post,
        createdAt: Timestamp.fromDate(new Date()),
        reactions: {},
      })
    );
    return ref.id;
  },

  updatePost: async (leagueId, postId, content) => {
    const postRef = doc(db, 'leagues', leagueId, 'timeline', postId);
    await updateDoc(postRef, { content });
  },

  deletePost: async (leagueId, postId) => {
    const postRef = doc(db, 'leagues', leagueId, 'timeline', postId);
    await deleteDoc(postRef);
  },

  toggleReaction: async (leagueId, postId, emoji, userId) => {
    const { posts } = get();
    const post = posts.find((p) => p.id === postId);
    if (!post) return;
    const currentUsers = post.reactions[emoji] ?? [];
    const hasReacted = currentUsers.includes(userId);
    const postRef = doc(db, 'leagues', leagueId, 'timeline', postId);
    if (hasReacted) {
      await updateDoc(postRef, { [`reactions.${emoji}`]: arrayRemove(userId) });
    } else {
      await updateDoc(postRef, { [`reactions.${emoji}`]: arrayUnion(userId) });
    }
  },
}));
