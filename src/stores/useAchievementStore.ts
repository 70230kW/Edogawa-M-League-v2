import { create } from 'zustand';
import { TrophyDefinition } from '@/types';

export interface AchievementToastItem {
  trophy: TrophyDefinition;
  playerName: string;
}

interface AchievementState {
  toastQueue: AchievementToastItem[];
  addToast: (trophy: TrophyDefinition, playerName: string) => void;
  dismissToast: () => void;
}

export const useAchievementStore = create<AchievementState>((set) => ({
  toastQueue: [],

  addToast: (trophy, playerName) =>
    set((state) => ({
      toastQueue: [...state.toastQueue, { trophy, playerName }],
    })),

  dismissToast: () =>
    set((state) => ({
      toastQueue: state.toastQueue.slice(1),
    })),
}));
