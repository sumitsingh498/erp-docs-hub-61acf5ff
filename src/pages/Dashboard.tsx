import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { dashboardStats, erpMasterData } from "@/data/mock-data";
import { useStore } from "@/data/issues-requirements-store";
import { useTaskStore } from "@/data/tasks-store";
import { useActivityStore } from "@/data/activity-store";
import {
  Database, FileText, LayoutGrid, AlertTriangle,
  CheckCircle2, Clock, XCircle, Layers, ClipboardList, Bug,
  ListChecks, Bell, TrendingUp, Users, Lightbulb, Zap,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, LineChart, Line, CartesianGrid } from "recharts";
import { Link } from "react-router-dom";

const barColors = ["#2563eb", "#0891b2", "#059669", "#d97706", "#dc2626", "#7c3aed", "#6366f1", "#ec4899", "#14b8a6"];

const sevColors: Record<string, string> = {
  Critical: "bg-red-500/15 text-red-700", High: "bg-orange-500/15 text-orange-700",
  Medium: "bg-yellow-500/15 text-yellow-700", Low: "bg-green-500/15 text-green-700",
};
const reqStatusColors: Record<string, string> = {
  Open: "bg-blue-500/15 text-blue-700", "In Progress": "bg-amber-500/15 text-amber-700",
};

const statusIcons: Record<string, typeof CheckCircle2> = {
  Active: CheckCircle2, 'In Development': Clock, Testing: AlertTriangle, Deprecated: XCircle,
};

// Mock weekly trend data
const weeklyTrend = [
  { week: "W10", opened: 3, closed: 1 }, { week: "W11", opened: 5, closed: 3 },
  { week: "W12", opened: 2, closed: 4 }, { week: "W13", opened: 4, closed: 2 },
  { week: "W14", opened: 6, closed: 5 }, { week: "W15", opened: 3, closed: 6 },
];

export default function Dashboard() {
  const { requirements, issues } = useStore();
  const { tasks } = useTaskStore();
  const { activities } = useActivityStore();

  const pendingReqs = requirements.filter((r) => r.status === "Open" || r.status === "In Progress");
  const openIssues = issues.filter((i) => i.status === "Open" || i.status === "In Progress");
  const criticalIssues = issues.filter((i) => i.severity === "Critical" && i.status !== "Closed" && i.status !== "Resolved");
  const overdueTasks = tasks.filter((t) => t.status !== "Done" && t.dueDate && new Date(t.dueDate) < new Date());
  const blockedTasks = tasks.filter((t) => t.status === "Blocked");
  const recentForms = erpMasterData.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 5);

  // Module completion data
  const moduleCompletion = dashboardStats.moduleCounts.map((m) => {
    const moduleForms = erpMasterData.filter((f) => f.module === m.module);
    const avg = moduleForms.length > 0 ? Math.round(moduleForms.reduce((a, f) => a + f.percentComplete, 0) / moduleForms.length) : 0;
    return { module: m.module, completion: avg };
  });

  // Issue severity pie data
  const severityData = ["Critical", "High", "Medium", "Low"].map((s) => ({
    name: s, value: issues.filter((i) => i.severity === s).length,
  })).filter((d) => d.value > 0);
  const pieColors = ["#ef4444", "#f97316", "#eab308", "#22c55e"];

  // Alerts
  const alerts: { type: "danger" | "warning" | "info"; text: string; link: string }[] = [];
  if (criticalIssues.length > 0) alerts.push({ type: "danger", text: `${criticalIssues.length} critical issue(s) need immediate attention`, link: "/issues-requirements" });
  if (overdueTasks.length > 0) alerts.push({ type: "warning", text: `${overdueTasks.length} task(s) are overdue`, link: "/tasks" });
  if (blockedTasks.length > 0) alerts.push({ type: "warning", text: `${blockedTasks.length} task(s) are blocked`, link: "/tasks" });
  const highPriorityReqs = pendingReqs.filter((r) => r.priority === "High");
  if (highPriorityReqs.length > 0) alerts.push({ type: "info", text: `${highPriorityReqs.length} high-priority requirements pending`, link: "/issues-requirements" });

  const kpiCards = [
    { label: "Total Objects", value: dashboardStats.totalObjects, icon: Database, color: "text-primary" },
    { label: "Total Forms", value: dashboardStats.totalForms, icon: LayoutGrid, color: "text-accent" },
    { label: "Total Reports", value: dashboardStats.totalReports, icon: FileText, color: "text-green-600" },
    { label: "Open Issues", value: openIssues.length, icon: Bug, color: "text-destructive" },
    { label: "Pending Reqs", value: pendingReqs.length, icon: ClipboardList, color: "text-blue-600" },
    { label: "Active Tasks", value: tasks.filter((t) => t.status !== "Done").length, icon: ListChecks, color: "text-amber-600" },
    { label: "% Complete", value: `${dashboardStats.percentComplete}%`, icon: CheckCircle2, color: "text-green-600" },
    { label: "Open Risks", value: dashboardStats.openRisks, icon: AlertTriangle, color: "text-orange-600" },
  ];

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Executive Dashboard</h1>
          <p className="text-sm text-muted-foreground">RISANSI GoERP.ai — Implementation Overview</p>
        </div>
        <div className="flex items-center gap-2">
          {alerts.length > 0 && (
            <Badge variant="destructive" className="gap-1 text-xs"><Bell size={12} />{alerts.length} Alerts</Badge>
          )}
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-1.5">
          {alerts.map((a, i) => (
            <Link key={i} to={a.link} className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
              a.type === "danger" ? "bg-red-500/10 text-red-700 hover:bg-red-500/20 border border-red-200" :
              a.type === "warning" ? "bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 border border-amber-200" :
              "bg-blue-500/10 text-blue-700 hover:bg-blue-500/20 border border-blue-200"
            }`}>
              <AlertTriangle size={14} />
              <span>{a.text}</span>
              <span className="ml-auto text-xs opacity-60">View →</span>
            </Link>
          ))}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        {kpiCards.map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="border shadow-sm">
            <CardContent className="p-3">
              <Icon size={16} className={`${color} mb-1`} />
              <div className="text-xl font-bold text-foreground">{value}</div>
              <div className="text-[10px] text-muted-foreground">{label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Module Completion Chart */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold flex items-center gap-2"><TrendingUp size={14} />Module Completion %</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={moduleCompletion} layout="vertical">
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="module" tick={{ fontSize: 10 }} width={70} />
                <Tooltip />
                <Bar dataKey="completion" radius={[0, 3, 3, 0]}>
                  {moduleCompletion.map((_, i) => <Cell key={i} fill={barColors[i % barColors.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Issue Trend */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Issue Trend (Weekly)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={weeklyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="week" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Line type="monotone" dataKey="opened" stroke="#ef4444" strokeWidth={2} name="Opened" dot={{ r: 3 }} />
                <Line type="monotone" dataKey="closed" stroke="#22c55e" strokeWidth={2} name="Closed" dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Severity Breakdown */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Issues by Severity</CardTitle></CardHeader>
          <CardContent className="flex items-center justify-center">
            {severityData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={severityData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${value}`} labelLine={{ strokeWidth: 1 }}>
                    {severityData.map((_, i) => <Cell key={i} fill={pieColors[i]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="text-sm text-muted-foreground">No issues</p>}
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Top 5 Pending Issues */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2"><Bug size={14} className="text-destructive" />Top Pending Issues</CardTitle>
              <Link to="/issues-requirements" className="text-xs text-primary hover:underline">View All →</Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-1.5 max-h-[240px] overflow-y-auto">
            {openIssues.slice(0, 5).map((iss) => (
              <div key={iss.id} className="flex items-start gap-3 p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-destructive">{iss.id}</span>
                    <Badge variant="outline" className={`text-[9px] px-1.5 py-0 ${sevColors[iss.severity]}`}>{iss.severity}</Badge>
                  </div>
                  <div className="text-sm font-medium truncate">{iss.title}</div>
                  <span className="text-[10px] text-muted-foreground">{iss.module} · {iss.assignee}</span>
                </div>
              </div>
            ))}
            {openIssues.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No open issues ✓</p>}
          </CardContent>
        </Card>

        {/* Pending Requirements */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2"><ClipboardList size={14} className="text-primary" />Pending Requirements</CardTitle>
              <Link to="/issues-requirements" className="text-xs text-primary hover:underline">View All →</Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-1.5 max-h-[240px] overflow-y-auto">
            {pendingReqs.slice(0, 5).map((req) => (
              <div key={req.id} className="flex items-start gap-3 p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-primary">{req.id}</span>
                    <Badge variant="outline" className={`text-[9px] px-1.5 py-0 ${reqStatusColors[req.status]}`}>{req.status}</Badge>
                  </div>
                  <div className="text-sm font-medium truncate">{req.title}</div>
                  <span className="text-[10px] text-muted-foreground">{req.module} · {req.assignee}</span>
                </div>
              </div>
            ))}
            {pendingReqs.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">All completed ✓</p>}
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Recently Updated Forms */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Recently Updated Forms</CardTitle></CardHeader>
          <CardContent className="space-y-1.5">
            {recentForms.map((f) => (
              <div key={f.id} className="flex items-center gap-2 p-2 rounded-md bg-muted/30 text-sm">
                <span className="font-mono text-[10px] text-primary">{f.originalId}</span>
                <span className="truncate flex-1">{f.displayName}</span>
                <span className="text-[10px] text-muted-foreground">{f.updatedAt}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Implementation Phases */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Implementation Phases</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {dashboardStats.phases.map((phase) => (
              <div key={phase.name} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-medium">{phase.name}</span>
                  <span className="text-muted-foreground">{phase.progress}%</span>
                </div>
                <Progress value={phase.progress} className="h-1.5" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Activity Feed */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Recent Activity</CardTitle></CardHeader>
          <CardContent className="space-y-1.5 max-h-[280px] overflow-y-auto">
            {activities.slice(0, 8).map((a) => (
              <div key={a.id} className="flex items-start gap-2 p-1.5">
                <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center text-[8px] font-bold text-primary shrink-0 mt-0.5">
                  {a.user.charAt(0)}
                </div>
                <div>
                  <div className="text-xs"><span className="font-medium">{a.user}</span> {a.action}</div>
                  <div className="text-[10px] text-muted-foreground">{a.entity} · {new Date(a.timestamp).toLocaleDateString()}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Status & Objects Chart Row */}
      <div className="grid lg:grid-cols-2 gap-5">
        <Card className="border shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Objects by Module</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={dashboardStats.moduleCounts}>
                <XAxis dataKey="module" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" height={50} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="forms" name="Forms" radius={[3, 3, 0, 0]}>
                  {dashboardStats.moduleCounts.map((_, i) => <Cell key={i} fill={barColors[i % barColors.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Status Breakdown</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {dashboardStats.statusBreakdown.map(({ status, count }) => {
                const Icon = statusIcons[status] || CheckCircle2;
                return (
                  <div key={status} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Icon size={16} className="text-muted-foreground" />
                    <div>
                      <div className="text-lg font-bold text-foreground">{count}</div>
                      <div className="text-[10px] text-muted-foreground">{status}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
