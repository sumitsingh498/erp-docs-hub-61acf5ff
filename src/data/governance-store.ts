import { create } from "zustand";

export type SystemMode = "Development" | "Testing" | "Go-Live";

interface GovernanceStore {
  enabled: boolean;
  systemMode: SystemMode;
  toggle: () => void;
  setSystemMode: (mode: SystemMode) => void;
}

export const useGovernanceStore = create<GovernanceStore>((set) => ({
  enabled: false,
  systemMode: "Development",
  toggle: () => set((s) => ({ enabled: !s.enabled })),
  setSystemMode: (mode) => set({ systemMode: mode, enabled: mode === "Go-Live" }),
}));
