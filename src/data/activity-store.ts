import { create } from "zustand";

export interface ActivityEntry {
  id: string;
  user: string;
  action: string;
  entity: string;
  entityId: string;
  module: string;
  timestamp: string;
}

interface ActivityStore {
  activities: ActivityEntry[];
  addActivity: (a: Omit<ActivityEntry, "id" | "timestamp">) => void;
}

let counter = 20;

const seedActivities: ActivityEntry[] = [
  { id: "ACT-001", user: "Rajesh K.", action: "Updated status to Active", entity: "Item Master Entry", entityId: "ERP0000000074", module: "Master", timestamp: "2026-03-23T09:15:00Z" },
  { id: "ACT-002", user: "Priya M.", action: "Added requirement REQ-004", entity: "FG Stock Adjustment", entityId: "ERP0000000112", module: "Finance", timestamp: "2026-03-23T08:30:00Z" },
  { id: "ACT-003", user: "Amit S.", action: "Reported issue ISS-001", entity: "Item Master Entry", entityId: "ERP0000000074", module: "Master", timestamp: "2026-03-22T16:45:00Z" },
  { id: "ACT-004", user: "Suresh R.", action: "Changed issue status to In Progress", entity: "FG Stock Adjustment", entityId: "ERP0000000112", module: "Finance", timestamp: "2026-03-22T14:20:00Z" },
  { id: "ACT-005", user: "Neha G.", action: "Created task TSK-005", entity: "Sales Order Entry", entityId: "SAL0000000045", module: "Sale", timestamp: "2026-03-22T11:00:00Z" },
  { id: "ACT-006", user: "Admin", action: "Added user Deepak Verma", entity: "User Management", entityId: "USR-005", module: "Security", timestamp: "2026-03-21T17:30:00Z" },
  { id: "ACT-007", user: "Kiran D.", action: "Updated MRP Run Schedule to 55%", entity: "Production Schedule", entityId: "PPC0000000062", module: "PPC/MRP", timestamp: "2026-03-21T15:00:00Z" },
  { id: "ACT-008", user: "Vikram T.", action: "Completed QC Inspection form", entity: "Quality Inspection Report", entityId: "QC0000000018", module: "Quality", timestamp: "2026-03-21T10:30:00Z" },
  { id: "ACT-009", user: "Rajesh K.", action: "Assigned form to Amit S.", entity: "Goods Receipt Note", entityId: "MTL0000000645", module: "Material", timestamp: "2026-03-20T14:00:00Z" },
  { id: "ACT-010", user: "Priya M.", action: "Exported Trial Balance report", entity: "Trial Balance Report", entityId: "FIN0000000215", module: "Finance", timestamp: "2026-03-20T09:00:00Z" },
];

export const useActivityStore = create<ActivityStore>((set) => ({
  activities: seedActivities,
  addActivity: (a) =>
    set((s) => ({
      activities: [{ ...a, id: `ACT-${String(++counter).padStart(3, "0")}`, timestamp: new Date().toISOString() }, ...s.activities],
    })),
}));
