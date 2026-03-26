import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { erpMasterData, dashboardStats } from "@/data/mock-data";
import { useStore } from "@/data/issues-requirements-store";
import { useTaskStore } from "@/data/tasks-store";
import {
  Activity, AlertTriangle, CheckCircle2, XCircle, TrendingUp,
} from "lucide-react";

function scoreColor(score: number) {
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-amber-600";
  return "text-destructive";
}
function progressColor(score: number) {
  if (score >= 80) return "[&>div]:bg-green-500";
  if (score >= 60) return "[&>div]:bg-amber-500";
  return "[&>div]:bg-destructive";
}

export default function SystemHealth() {
  const { requirements, issues } = useStore();
  const { tasks } = useTaskStore();

  const totalForms = erpMasterData.filter((f) => f.type === "FORM").length;
  const totalReports = erpMasterData.filter((f) => f.type === "REPORT").length;
  const avgCompletion = totalForms > 0 ? Math.round(erpMasterData.reduce((a, f) => a + f.percentComplete, 0) / erpMasterData.length) : 0;

  const openIssues = issues.filter((i) => i.status !== "Closed" && i.status !== "Resolved").length;
  const criticalIssues = issues.filter((i) => i.severity === "Critical" && i.status !== "Closed" && i.status !== "Resolved").length;
  const pendingReqs = requirements.filter((r) => r.status === "Open" || r.status === "In Progress").length;
  const overdueTasks = tasks.filter((t) => t.status !== "Done" && t.dueDate && new Date(t.dueDate) < new Date()).length;
  const blockedTasks = tasks.filter((t) => t.status === "Blocked").length;

  // Orphan forms = forms with 0% completion and no issues/requirements
  const orphanForms = erpMasterData.filter((f) => {
    const hasIssue = issues.some((i) => i.linkedId === f.originalId);
    const hasReq = requirements.some((r) => r.linkedId === f.originalId);
    return f.percentComplete === 0 && !hasIssue && !hasReq;
  });

  // Module scores
  const moduleScores = dashboardStats.moduleCounts.map((m) => {
    const moduleForms = erpMasterData.filter((f) => f.module === m.module);
    const completion = moduleForms.length > 0 ? Math.round(moduleForms.reduce((a, f) => a + f.percentComplete, 0) / moduleForms.length) : 0;
    const moduleIssues = issues.filter((i) => i.module === m.module && i.status !== "Closed" && i.status !== "Resolved").length;
    const moduleReqs = requirements.filter((r) => r.module === m.module && (r.status === "Open" || r.status === "In Progress")).length;
    const issuesPenalty = Math.min(moduleIssues * 5, 30);
    const reqsPenalty = Math.min(moduleReqs * 3, 15);
    const score = Math.max(0, Math.min(100, completion - issuesPenalty - reqsPenalty));
    return { module: m.module, completion, issues: moduleIssues, reqs: moduleReqs, score };
  });

  // Overall health score
  const healthScore = moduleScores.length > 0 ? Math.round(moduleScores.reduce((a, m) => a + m.score, 0) / moduleScores.length) : 0;

  // Problems list
  const problems: { text: string; severity: "danger" | "warning" | "info" }[] = [];
  moduleScores.filter((m) => m.score < 50).forEach((m) => problems.push({ text: `${m.module} module health is critically low (${m.score}%)`, severity: "danger" }));
  if (criticalIssues > 0) problems.push({ text: `${criticalIssues} critical issue(s) unresolved`, severity: "danger" });
  if (overdueTasks > 0) problems.push({ text: `${overdueTasks} task(s) overdue`, severity: "warning" });
  if (blockedTasks > 0) problems.push({ text: `${blockedTasks} task(s) blocked`, severity: "warning" });
  if (orphanForms.length > 0) problems.push({ text: `${orphanForms.length} orphan form(s) with no activity`, severity: "info" });
  moduleScores.filter((m) => m.completion < 50).forEach((m) => problems.push({ text: `${m.module} documentation incomplete (${m.completion}%)`, severity: "warning" }));

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Activity size={22} className="text-primary" /> System Health Engine
        </h1>
        <p className="text-sm text-muted-foreground">Combined health score — completeness, issues, consistency</p>
      </div>

      {/* Big Health Score */}
      <div className="grid lg:grid-cols-3 gap-5">
        <Card className="border shadow-sm lg:row-span-2">
          <CardContent className="p-6 flex flex-col items-center justify-center h-full">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">ERP Health Score</div>
            <div className={`text-7xl font-bold ${scoreColor(healthScore)}`}>{healthScore}%</div>
            <Progress value={healthScore} className={`h-3 w-full mt-4 ${progressColor(healthScore)}`} />
            <div className="mt-3 flex gap-4 text-xs text-muted-foreground">
              <span>{totalForms} Forms</span>
              <span>{totalReports} Reports</span>
              <span>{avgCompletion}% Avg Doc</span>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Key Metrics</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {[
              { label: "Documentation Completion", value: `${avgCompletion}%`, ok: avgCompletion >= 70 },
              { label: "Open Issues", value: openIssues.toString(), ok: openIssues <= 3 },
              { label: "Critical Issues", value: criticalIssues.toString(), ok: criticalIssues === 0 },
              { label: "Pending Requirements", value: pendingReqs.toString(), ok: pendingReqs <= 3 },
              { label: "Overdue Tasks", value: overdueTasks.toString(), ok: overdueTasks === 0 },
              { label: "Orphan Forms", value: orphanForms.length.toString(), ok: orphanForms.length === 0 },
            ].map(({ label, value, ok }) => (
              <div key={label} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{label}</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-medium">{value}</span>
                  {ok ? <CheckCircle2 size={12} className="text-green-600" /> : <XCircle size={12} className="text-destructive" />}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Problems */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <AlertTriangle size={14} className="text-amber-600" /> Problems Detected ({problems.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5 max-h-[220px] overflow-y-auto">
            {problems.length === 0 ? (
              <div className="text-center py-4 text-sm text-green-600 flex items-center justify-center gap-2">
                <CheckCircle2 size={14} /> System is healthy
              </div>
            ) : problems.map((p, i) => (
              <div key={i} className={`flex items-start gap-2 p-2 rounded-md text-xs ${
                p.severity === "danger" ? "bg-red-500/10 text-red-700" :
                p.severity === "warning" ? "bg-amber-500/10 text-amber-700" :
                "bg-blue-500/10 text-blue-700"
              }`}>
                {p.severity === "danger" ? "🔴" : p.severity === "warning" ? "🟡" : "🔵"} {p.text}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Module Health Grid */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <TrendingUp size={14} /> Module Health Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {moduleScores.map((m) => (
              <div key={m.module} className="p-3 rounded-lg border bg-card">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">{m.module}</span>
                  <span className={`text-lg font-bold ${scoreColor(m.score)}`}>{m.score}%</span>
                </div>
                <Progress value={m.score} className={`h-1.5 mb-2 ${progressColor(m.score)}`} />
                <div className="flex gap-3 text-[10px] text-muted-foreground">
                  <span>Doc: {m.completion}%</span>
                  <span>Issues: {m.issues}</span>
                  <span>Reqs: {m.reqs}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
