import { create } from "zustand";
import { technicalMappings as seedData, type TechnicalMapping, type ERPModule, MODULES } from "./mock-data";

interface TechnicalMappingStore {
  mappings: TechnicalMapping[];
  addMapping: (m: Omit<TechnicalMapping, "id">) => void;
  updateMapping: (id: string, updates: Partial<TechnicalMapping>) => void;
  removeMapping: (id: string) => void;
}

let counter = 20;

export const useTechnicalMappingStore = create<TechnicalMappingStore>((set) => ({
  mappings: seedData,
  addMapping: (m) =>
    set((s) => ({
      mappings: [...s.mappings, { ...m, id: `TM${++counter}` }],
    })),
  updateMapping: (id, updates) =>
    set((s) => ({
      mappings: s.mappings.map((m) => (m.id === id ? { ...m, ...updates } : m)),
    })),
  removeMapping: (id) =>
    set((s) => ({ mappings: s.mappings.filter((m) => m.id !== id) })),
}));
