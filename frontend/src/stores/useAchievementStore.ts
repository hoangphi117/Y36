import { create } from "zustand";

interface Achievement {
  id: string;
  name: string;
  description: string;
  code: string;
}

interface AchievementStore {
  queue: Achievement[];
  addAchievement: (ach: Achievement) => void;
  removeFirst: () => void;
}

export const useAchievementStore = create<AchievementStore>((set) => ({
  queue: [],
  addAchievement: (ach) => set((state) => ({ queue: [...state.queue, ach] })),
  removeFirst: () => set((state) => ({ queue: state.queue.slice(1) })),
}));
