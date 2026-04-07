import { create } from 'zustand';
import {
  GoogleAuthProvider,
  signInWithRedirect,
  signOut,
  User,
} from 'firebase/auth';
import { auth } from '@/firebase/config';

interface AuthState {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,

  setUser: (user) => set({ user, loading: false }),

  signInWithGoogle: async () => {
    const provider = new GoogleAuthProvider();
    await signInWithRedirect(auth, provider);
  },

  signOutUser: async () => {
    await signOut(auth);
    set({ user: null, loading: false });
  },
}));
