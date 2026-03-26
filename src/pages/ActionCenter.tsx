import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStore } from "@/data/issues-requirements-store";
import { useTaskStore } from "@/data/tasks-store";
import { useUsersStore } from "@/data/users-store";
import { useGovernanceStore } from "@/data/governance-store";
import {
  AlertTriangle, CheckCircle2, Clock, ListChecks, Bug, ClipboardList, ShieldAlert, Zap,
} from "lucide-react";
import { Link } from "react-router-dom";

const sevBg: Record<string, string> = {
  Critical: "bg-red-500/15 text-red-700", High: "bg-orange-500/15 text-orange-700",
  Medium: "bg-yellow-500/15 text-yellow-700", Low: "bg-green-500/15 text-green-700",
};

export default function ActionCenter() {
  const { requirements, issues } = useStore();
  const { tasks } = useTaskStore();
  const { users } = useUsersStore();
  const { systemMode } = useGovernanceStore();

  const now = new Date();
  const criticalIssues = issues.filter((i) => i.severity === "Critical" && i.status !== "Closed" && i.status !== "Resolved");
  const openIssues = issues.filter((i) => i.status === "Open" || i.status === "In Progress" || i.status === "Reopened");
  const pendingReqs = requirements.filter((r) => r.status === "Open" || r.status === "In Progress");
  const activeTasks = tasks.filter((t) => t.status !== "Done");
  const overdueTasks = tasks.filter((t) => t.status !== "Done" && t.dueDate && new Date(t.dueDate) < now);
  const blockedTasks = tasks.filter((t) => t.status === "Blocked");
  const dueTodayTasks = tasks.filter((t) => {
    if (!t.dueDate || t.status === "Done") return false;
    const d = new Date(t.dueDate);
    return d.toDateString() === now.toDateString();
  });

  const summaryCards = [
    { label: "Critical Issues", value: criticalIssues.length, icon: Bug, color: "text-destructive", bg: "bg-destructive/10" },
    { label: "Tasks Due Today", value: dueTodayTasks.length, icon: Clock, color: "text-amber-600", bg: "bg-amber-500/10" },
    { label: "Overdue Tasks", value: overdueTasks.length, icon: AlertTriangle, color: "text-orange-600", bg: "bg-orange-500/10" },
    { label: "Blocked Tasks", value: blockedTasks.length, icon: ShieldAlert, color: "text-red-600", bg: "bg-red-500/10" },
    { label: "Open Issues", value: openIssues.length, icon: Bug, color: "text-destructive", bg: "bg-destructive/10" },
    { label: "Pending Reqs", value: pendingReqs.length, icon: ClipboardList, color: "text-blue-600", bg: "bg-blue-500/10" },
    { label: "Active Tasks", value: activeTasks.length, icon: ListChecks, color: "text-amber-600", bg: "bg-amber-500/10" },
    { label: "Active Users", value: users.filter((u) => u.status === "Active").length, icon: CheckCircle2, color: "text-green-600", bg: "bg-green-500/10" },
  ];

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Zap size={22} className="text-primary" /> Action Center
          </h1>
          <p className="text-sm text-muted-foreground">All pending work in one place — your daily working screen</p>
        </div>
        {systemMode !== "Development" && (
          <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/30">
            Mode: {systemMode}
          </Badge>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        {summaryCards.map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label} className="border shadow-sm">
            <CardContent className="p-3">
              <div className={`w-7 h-7 rounded-md ${bg} flex items-center justify-center mb-1`}>
                <Icon size={14} className={color} />
              </div>
              <div className="text-xl font-bold text-foreground">{value}</div>
              <div className="text-[10px] text-muted-foreground">{label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Priority Alerts */}
      {(criticalIssues.length > 0 || overdueTasks.length > 0 || blockedTasks.length > 0) && (
        <div className="space-y-1.5">
          {criticalIssues.length > 0 && (
            <Link to="/issues-requirements" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm bg-red-500/10 text-red-700 hover:bg-red-500/20 border border-red-200 transition-colors">
              <Bug size={14} /> 🔴 {criticalIssues.length} Critical Issue(s) — Immediate attention required
              <span className="ml-auto text-xs opacity-60">View →</span>
            </Link>
          )}
          {overdueTasks.length > 0 && (
            <Link to="/tasks" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm bg-orange-500/10 text-orange-700 hover:bg-orange-500/20 border border-orange-200 transition-colors">
              <Clock size={14} /> 🟠 {overdueTasks.length} Overdue Task(s) — Reassign or escalate
              <span className="ml-auto text-xs opacity-60">View →</span>
            </Link>
          )}
          {blockedTasks.length > 0 && (
            <Link to="/tasks" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 border border-amber-200 transition-colors">
              <ShieldAlert size={14} /> 🟡 {blockedTasks.length} Blocked Task(s) — Needs resolution
              <span className="ml-auto text-xs opacity-60">View →</span>
            </Link>
          )}
        </div>
      )}

      <Tabs defaultValue="tasks">
        <TabsList>
          <TabsTrigger value="tasks">My Tasks ({activeTasks.length})</TabsTrigger>
          <TabsTrigger value="issues">Open Issues ({openIssues.length})</TabsTrigger>
          <TabsTrigger value="reqs">Pending Reqs ({pendingReqs.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="mt-4 space-y-1.5">
          {activeTasks.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">All tasks completed ✓</div>
          ) : activeTasks.map((t) => (
            <Link to="/tasks" key={t.id} className="flex items-center gap-3 p-3 rounded-lg bg-card border hover:bg-muted/50 transition-colors">
              <ListChecks size={14} className="text-amber-600 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-primary">{t.id}</span>
                  <Badge variant="outline" className="text-[9px]">{t.status}</Badge>
                  <Badge variant="outline" className="text-[9px]">{t.priority}</Badge>
                </div>
                <div className="text-sm font-medium truncate">{t.title}</div>
                <div className="text-[10px] text-muted-foreground">{t.module} · {t.assignee} · Due: {t.dueDate || "—"}</div>
              </div>
              {t.dueDate && new Date(t.dueDate) < now && t.status !== "Done" && (
                <Badge variant="destructive" className="text-[9px] shrink-0">OVERDUE</Badge>
              )}
            </Link>
          ))}
        </TabsContent>

        <TabsContent value="issues" className="mt-4 space-y-1.5">
          {openIssues.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">No open issues ✓</div>
          ) : openIssues.map((iss) => (
            <Link to="/issues-requirements" key={iss.id} className="flex items-center gap-3 p-3 rounded-lg bg-card border hover:bg-muted/50 transition-colors">
              <Bug size={14} className="text-destructive shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-destructive">{iss.id}</span>
                  <Badge variant="outline" className={`text-[9px] ${sevBg[iss.severity]}`}>{iss.severity}</Badge>
                  <Badge variant="outline" className="text-[9px]">{iss.status}</Badge>
                </div>
                <div className="text-sm font-medium truncate">{iss.title}</div>
                <div className="text-[10px] text-muted-foreground">{iss.module} · {iss.linkedName} · {iss.assignee}</div>
              </div>
            </Link>
          ))}
        </TabsContent>

        <TabsContent value="reqs" className="mt-4 space-y-1.5">
          {pendingReqs.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">All requirements addressed ✓</div>
          ) : pendingReqs.map((req) => (
            <Link to="/issues-requirements" key={req.id} className="flex items-center gap-3 p-3 rounded-lg bg-card border hover:bg-muted/50 transition-colors">
              <ClipboardList size={14} className="text-blue-600 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-blue-600">{req.id}</span>
                  <Badge variant="outline" className="text-[9px]">{req.status}</Badge>
                  <Badge variant="outline" className="text-[9px]">{req.priority}</Badge>
                </div>
                <div className="text-sm font-medium truncate">{req.title}</div>
                <div className="text-[10px] text-muted-foreground">{req.module} · {req.linkedName} · {req.assignee}</div>
              </div>
            </Link>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
