import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, FileText, AlertTriangle, ClipboardList, User, ListChecks, Database } from "lucide-react";
import { erpMasterData, reportData } from "@/data/mock-data";
import { useStore } from "@/data/issues-requirements-store";
import { useTaskStore } from "@/data/tasks-store";
import { useUsersStore } from "@/data/users-store";
import { useNavigate } from "react-router-dom";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type ResultType = "form" | "report" | "issue" | "requirement" | "task" | "user";

interface SearchResult {
  type: ResultType;
  id: string;
  title: string;
  subtitle: string;
  route: string;
}

const typeIcons: Record<ResultType, typeof Database> = {
  form: Database, report: FileText, issue: AlertTriangle, requirement: ClipboardList, task: ListChecks, user: User,
};
const typeColors: Record<ResultType, string> = {
  form: "bg-primary/15 text-primary", report: "bg-green-500/15 text-green-700", issue: "bg-red-500/15 text-red-700",
  requirement: "bg-blue-500/15 text-blue-700", task: "bg-amber-500/15 text-amber-700", user: "bg-violet-500/15 text-violet-700",
};

export default function GlobalSearch({ open, onOpenChange }: Props) {
  const [query, setQuery] = useState("");
  const { requirements, issues } = useStore();
  const { tasks } = useTaskStore();
  const { users } = useUsersStore();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  // Keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onOpenChange]);

  const results: SearchResult[] = [];
  if (query.length >= 2) {
    const q = query.toLowerCase();
    erpMasterData.filter((i) => i.displayName.toLowerCase().includes(q) || i.originalId.toLowerCase().includes(q) || i.module.toLowerCase().includes(q))
      .slice(0, 5).forEach((i) => results.push({ type: i.type === "REPORT" ? "report" : "form", id: i.originalId, title: i.displayName, subtitle: `${i.module} · ${i.originalId}`, route: "/master-register" }));
    reportData.filter((r) => r.name.toLowerCase().includes(q) || r.module.toLowerCase().includes(q))
      .slice(0, 3).forEach((r) => results.push({ type: "report", id: r.id, title: r.name, subtitle: `${r.module} · ${r.category}`, route: "/reports" }));
    requirements.filter((r) => r.title.toLowerCase().includes(q) || r.id.toLowerCase().includes(q))
      .slice(0, 3).forEach((r) => results.push({ type: "requirement", id: r.id, title: r.title, subtitle: `${r.module} · ${r.linkedName}`, route: "/issues-requirements" }));
    issues.filter((i) => i.title.toLowerCase().includes(q) || i.id.toLowerCase().includes(q))
      .slice(0, 3).forEach((i) => results.push({ type: "issue", id: i.id, title: i.title, subtitle: `${i.module} · ${i.severity}`, route: "/issues-requirements" }));
    tasks.filter((t) => t.title.toLowerCase().includes(q) || t.id.toLowerCase().includes(q))
      .slice(0, 3).forEach((t) => results.push({ type: "task", id: t.id, title: t.title, subtitle: `${t.module} · ${t.status}`, route: "/tasks" }));
    users.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
      .slice(0, 3).forEach((u) => results.push({ type: "user", id: u.id, title: u.name, subtitle: `${u.role} · ${u.department}`, route: "/settings" }));
  }

  const handleSelect = (r: SearchResult) => {
    navigate(r.route);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 gap-0">
        <div className="flex items-center gap-3 px-4 border-b">
          <Search size={16} className="text-muted-foreground shrink-0" />
          <Input ref={inputRef} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search forms, reports, issues, tasks, users..." className="border-0 h-12 text-sm focus-visible:ring-0 shadow-none" />
          <kbd className="hidden sm:inline text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">ESC</kbd>
        </div>
        <div className="max-h-[400px] overflow-y-auto p-2">
          {query.length < 2 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">Type at least 2 characters to search...</div>
          ) : results.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">No results found for "{query}"</div>
          ) : (
            <div className="space-y-0.5">
              {results.map((r) => {
                const Icon = typeIcons[r.type];
                return (
                  <button key={`${r.type}-${r.id}`} onClick={() => handleSelect(r)} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-muted/50 transition-colors text-left">
                    <div className={`w-7 h-7 rounded-md flex items-center justify-center ${typeColors[r.type]}`}>
                      <Icon size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{r.title}</div>
                      <div className="text-[11px] text-muted-foreground">{r.subtitle}</div>
                    </div>
                    <Badge variant="outline" className="text-[9px] capitalize shrink-0">{r.type}</Badge>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
