import { create } from 'zustand';
import {
  GoogleAuthProvider,
  signInWithPopup,
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
    try {
      const result = await signInWithPopup(auth, provider);
      console.log('ポップアップログイン成功:', result.user.email);
      useAuthStore.getState().setUser(result.user);
    } catch (error: any) {
      console.error('ログインエラー:', error.code, error.message);
      throw error;
    }
  },

  signOutUser: async () => {
    await signOut(auth);
    set({ user: null, loading: false });
  },
}));
