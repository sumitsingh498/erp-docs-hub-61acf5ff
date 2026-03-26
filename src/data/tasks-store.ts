import { create } from "zustand";
import type { Priority, ERPModule } from "./mock-data";
import type { LinkedType } from "./issues-requirements-store";

export type TaskStatus = "Todo" | "In Progress" | "Testing" | "Done" | "Blocked";

export interface TaskComment {
  id: string;
  user: string;
  text: string;
  timestamp: string;
}

export interface TaskAttachment {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  assignee: string;
  assignedBy: string;
  createdBy: string;
  approvedBy: string;
  approvedDate: string;
  linkedType: LinkedType;
  linkedId: string;
  linkedName: string;
  module: ERPModule | string;
  dueDate: string;
  tags: string[];
  comments: TaskComment[];
  attachments: TaskAttachment[];
  createdAt: string;
  updatedAt: string;
}

interface TaskStore {
  tasks: Task[];
  addTask: (t: Omit<Task, "id" | "createdAt" | "updatedAt" | "comments" | "attachments" | "createdBy" | "approvedBy" | "approvedDate">) => void;
  updateTaskStatus: (id: string, status: TaskStatus) => void;
  updateTaskField: (id: string, field: string, value: any) => void;
  addComment: (taskId: string, user: string, text: string) => void;
  addAttachment: (taskId: string, att: Omit<TaskAttachment, "id">) => void;
  removeTask: (id: string) => void;
}

let counter = 10;
let commentCounter = 100;
let attCounter = 100;

const seedTasks: Task[] = [
  { id: "TSK-001", title: "Fix GRN duplicate entry bug", description: "GRN allows duplicate entries when two users submit simultaneously", status: "In Progress", priority: "High", assignee: "Amit S.", assignedBy: "Rajesh K.", createdBy: "Rajesh K.", approvedBy: "", approvedDate: "", linkedType: "Form", linkedId: "MTL0000000645", linkedName: "Goods Receipt Note", module: "Material", dueDate: "2026-03-28", tags: ["Bug", "Critical"], comments: [{ id: "C-1", user: "Rajesh K.", text: "Please prioritize this, production is affected", timestamp: "2026-03-20T09:00:00Z" }], attachments: [], createdAt: "2026-03-18", updatedAt: "2026-03-20" },
  { id: "TSK-002", title: "Add HSN validation to Item Master", description: "Implement HSN code validation against government master list", status: "Todo", priority: "High", assignee: "Rajesh K.", assignedBy: "Admin", createdBy: "Admin", approvedBy: "", approvedDate: "", linkedType: "Form", linkedId: "ERP0000000074", linkedName: "Item Master Entry", module: "Master", dueDate: "2026-04-01", tags: ["Enhancement", "Compliance"], comments: [], attachments: [], createdAt: "2026-03-15", updatedAt: "2026-03-15" },
  { id: "TSK-003", title: "GL posting test cases", description: "Write UAT test cases for GL posting scenarios", status: "Testing", priority: "Medium", assignee: "Priya M.", assignedBy: "Admin", createdBy: "Admin", approvedBy: "", approvedDate: "", linkedType: "Form", linkedId: "FIN0000000201", linkedName: "General Ledger Posting", module: "Finance", dueDate: "2026-03-25", tags: ["Testing", "Finance"], comments: [{ id: "C-2", user: "Priya M.", text: "5 out of 8 test cases passed", timestamp: "2026-03-22T14:00:00Z" }], attachments: [], createdAt: "2026-03-10", updatedAt: "2026-03-22" },
  { id: "TSK-004", title: "MRP demand forecast integration", description: "Integrate sales forecast data into MRP run", status: "Todo", priority: "High", assignee: "Kiran D.", assignedBy: "Admin", createdBy: "Admin", approvedBy: "", approvedDate: "", linkedType: "Form", linkedId: "PPC0000000055", linkedName: "MRP Run Schedule", module: "PPC/MRP", dueDate: "2026-04-10", tags: ["Integration", "PPC"], comments: [], attachments: [], createdAt: "2026-03-12", updatedAt: "2026-03-12" },
  { id: "TSK-005", title: "Sales order validation fix", description: "Prevent orders with inactive customer codes", status: "Done", priority: "High", assignee: "Neha G.", assignedBy: "Rajesh K.", createdBy: "Rajesh K.", approvedBy: "Rajesh K.", approvedDate: "2026-03-20", linkedType: "Form", linkedId: "SAL0000000045", linkedName: "Sales Order Entry", module: "Sale", dueDate: "2026-03-20", tags: ["Bug", "Sale"], comments: [{ id: "C-3", user: "Neha G.", text: "Fixed and deployed", timestamp: "2026-03-19T16:00:00Z" }], attachments: [], createdAt: "2026-03-08", updatedAt: "2026-03-19" },
  { id: "TSK-006", title: "BOM version comparison UI", description: "Allow side-by-side comparison of two BOM versions", status: "Blocked", priority: "Medium", assignee: "Suresh R.", assignedBy: "Admin", createdBy: "Admin", approvedBy: "", approvedDate: "", linkedType: "Form", linkedId: "ENG0000000035", linkedName: "Bill of Materials", module: "Production", dueDate: "2026-04-05", tags: ["Enhancement", "Production"], comments: [{ id: "C-4", user: "Suresh R.", text: "Blocked on BOM data migration", timestamp: "2026-03-21T10:00:00Z" }], attachments: [], createdAt: "2026-03-14", updatedAt: "2026-03-21" },
];

export const useTaskStore = create<TaskStore>((set) => ({
  tasks: seedTasks,
  addTask: (t) =>
    set((s) => ({
      tasks: [...s.tasks, { ...t, id: `TSK-${String(++counter).padStart(3, "0")}`, createdAt: new Date().toISOString().split("T")[0], updatedAt: new Date().toISOString().split("T")[0], comments: [], attachments: [], createdBy: "Current User", approvedBy: "", approvedDate: "" }],
    })),
  updateTaskStatus: (id, status) =>
    set((s) => ({
      tasks: s.tasks.map((t) => (t.id === id ? { ...t, status, updatedAt: new Date().toISOString().split("T")[0] } : t)),
    })),
  updateTaskField: (id, field, value) =>
    set((s) => ({
      tasks: s.tasks.map((t) => (t.id === id ? { ...t, [field]: value, updatedAt: new Date().toISOString().split("T")[0] } : t)),
    })),
  addComment: (taskId, user, text) =>
    set((s) => ({
      tasks: s.tasks.map((t) =>
        t.id === taskId
          ? { ...t, comments: [...t.comments, { id: `C-${++commentCounter}`, user, text, timestamp: new Date().toISOString() }], updatedAt: new Date().toISOString().split("T")[0] }
          : t
      ),
    })),
  addAttachment: (taskId, att) =>
    set((s) => ({
      tasks: s.tasks.map((t) =>
        t.id === taskId
          ? { ...t, attachments: [...t.attachments, { ...att, id: `TA-${++attCounter}` }], updatedAt: new Date().toISOString().split("T")[0] }
          : t
      ),
    })),
  removeTask: (id) => set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),
}));
