import { create } from 'zustand';
import {
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { auth, googleProvider } from '@/firebase/config';

interface AuthState {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
  initialize: () => () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,

  signInWithGoogle: async () => {
    await signInWithRedirect(auth, googleProvider);
  },

  signOutUser: async () => {
    await signOut(auth);
    set({ user: null });
  },

  initialize: () => {
    // リダイレクト後の認証結果を処理する
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          console.log('ログイン成功:', result.user.email);
        }
      })
      .catch(console.error);

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      set({ user, loading: false });
    });
    return unsubscribe;
  },
}));
