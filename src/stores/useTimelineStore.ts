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
  doc,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  DocumentSnapshot,
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import { TimelinePost } from '@/types';

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
    return onSnapshot(q, (snap) => {
      const posts = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        createdAt: d.data().createdAt?.toDate() ?? new Date(),
      })) as TimelinePost[];
      set({ posts, lastDoc: snap.docs[snap.docs.length - 1] ?? null });
    });
  },

  loadMorePosts: async (leagueId) => {
    const { lastDoc, posts } = get();
    if (!lastDoc) return;
    set({ loading: true });
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
      createdAt: d.data().createdAt?.toDate() ?? new Date(),
    })) as TimelinePost[];
    set({
      posts: [...posts, ...newPosts],
      lastDoc: snap.docs[snap.docs.length - 1] ?? null,
      hasMore: snap.docs.length === PAGE_SIZE,
      loading: false,
    });
  },

  addPost: async (leagueId, post) => {
    const ref = await addDoc(collection(db, 'leagues', leagueId, 'timeline'), {
      ...post,
      createdAt: serverTimestamp(),
      reactions: {},
    });
    return ref.id;
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
