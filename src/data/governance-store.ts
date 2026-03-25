import { create } from "zustand";

interface GovernanceStore {
  enabled: boolean;
  toggle: () => void;
}

export const useGovernanceStore = create<GovernanceStore>((set) => ({
  enabled: false,
  toggle: () => set((s) => ({ enabled: !s.enabled })),
}));
