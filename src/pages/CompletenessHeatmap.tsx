import { erpMasterData, technicalMappings, MODULES, type ERPModule } from "@/data/mock-data";
import { useStore } from "@/data/issues-requirements-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Grid3X3, TrendingUp, AlertTriangle, CheckCircle2 } from "lucide-react";

type Dimension = "Documentation" | "Technical Mapping" | "Testing" | "Issues" | "Completion";

const dimensions: Dimension[] = ["Completion", "Documentation", "Technical Mapping", "Testing", "Issues"];

const getColor = (pct: number) => {
  if (pct >= 80) return "bg-green-500";
  if (pct >= 50) return "bg-yellow-500";
  if (pct >= 25) return "bg-orange-500";
  return "bg-red-500";
};

const getTextColor = (pct: number) => {
  if (pct >= 80) return "text-green-700";
  if (pct >= 50) return "text-yellow-700";
  if (pct >= 25) return "text-orange-700";
  return "text-red-700";
};

const getBgColor = (pct: number) => {
  if (pct >= 80) return "bg-green-500/15";
  if (pct >= 50) return "bg-yellow-500/15";
  if (pct >= 25) return "bg-orange-500/15";
  return "bg-red-500/15";
};

export default function CompletenessHeatmap() {
  const { issues, requirements } = useStore();

  const heatmapData = MODULES.map((module) => {
    const forms = erpMasterData.filter((f) => f.module === module);
    const avgCompletion = forms.length > 0 ? Math.round(forms.reduce((a, f) => a + f.percentComplete, 0) / forms.length) : 0;
    const activeForms = forms.filter((f) => f.status === "Active").length;
    const docPct = forms.length > 0 ? Math.round((activeForms / forms.length) * 100) : 0;
    const moduleIssues = issues.filter((i) => i.module === module);
    const resolvedIssues = moduleIssues.filter((i) => i.status === "Resolved" || i.status === "Closed").length;
    const issuePct = moduleIssues.length > 0 ? Math.round((resolvedIssues / moduleIssues.length) * 100) : 100;
    const moduleReqs = requirements.filter((r) => r.module === module);
    const completedReqs = moduleReqs.filter((r) => r.status === "Completed").length;
    const testPct = moduleReqs.length > 0 ? Math.round((completedReqs / moduleReqs.length) * 100) : (avgCompletion > 80 ? 85 : 40);

    // Real technical mapping % — count forms that have at least one mapping
    const moduleForms = forms.filter((f) => f.type === "FORM");
    const mappedCount = moduleForms.filter((f) => technicalMappings.some((tm) => tm.formId === f.originalId)).length;
    const tmPct = moduleForms.length > 0 ? Math.round((mappedCount / moduleForms.length) * 100) : 0;

    return {
      module,
      formCount: forms.length,
      values: {
        Completion: avgCompletion,
        Documentation: docPct,
        "Technical Mapping": tmPct,
        Testing: testPct,
        Issues: issuePct,
      } as Record<Dimension, number>,
      overall: Math.round((avgCompletion + docPct + tmPct + testPct + issuePct) / 5),
    };
  });

  const overallScore = Math.round(heatmapData.reduce((a, m) => a + m.overall, 0) / heatmapData.length);
  const criticalModules = heatmapData.filter((m) => m.overall < 50);
  const healthyModules = heatmapData.filter((m) => m.overall >= 80);

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Grid3X3 size={24} className="text-primary" />
          ERP Completeness Heatmap
        </h1>
        <p className="text-sm text-muted-foreground">Module-wise completeness across all dimensions — Color-coded for instant visibility</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className={`p-2 rounded-lg ${getBgColor(overallScore)}`}><TrendingUp size={18} className={getTextColor(overallScore)} /></div>
            <div><div className={`text-2xl font-bold ${getTextColor(overallScore)}`}>{overallScore}%</div><div className="text-xs text-muted-foreground">Overall Score</div></div>
          </CardContent>
        </Card>
        <Card className="border shadow-sm"><CardContent className="p-4"><div className="text-2xl font-bold text-foreground">{MODULES.length}</div><div className="text-xs text-muted-foreground">Modules Tracked</div></CardContent></Card>
        <Card className="border shadow-sm">
          <CardContent className="p-4 flex items-center gap-3"><CheckCircle2 size={18} className="text-green-600" /><div><div className="text-2xl font-bold text-green-600">{healthyModules.length}</div><div className="text-xs text-muted-foreground">Healthy (≥80%)</div></div></CardContent>
        </Card>
        <Card className="border shadow-sm">
          <CardContent className="p-4 flex items-center gap-3"><AlertTriangle size={18} className="text-destructive" /><div><div className="text-2xl font-bold text-destructive">{criticalModules.length}</div><div className="text-xs text-muted-foreground">Critical (&lt;50%)</div></div></CardContent>
        </Card>
      </div>

      <Card className="border shadow-sm">
        <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Module × Dimension Heatmap</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left text-xs font-semibold text-foreground p-2 w-[120px]">Module</th>
                  {dimensions.map((d) => <th key={d} className="text-center text-xs font-semibold text-foreground p-2">{d}</th>)}
                  <th className="text-center text-xs font-semibold text-foreground p-2">Overall</th>
                </tr>
              </thead>
              <tbody>
                {heatmapData.map((row) => (
                  <tr key={row.module} className="border-t border-border">
                    <td className="p-2"><div className="text-sm font-medium text-foreground">{row.module}</div><div className="text-[10px] text-muted-foreground">{row.formCount} forms</div></td>
                    {dimensions.map((d) => {
                      const val = row.values[d];
                      return (
                        <td key={d} className="p-1.5 text-center">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className={`mx-auto w-16 h-10 rounded-md flex items-center justify-center text-xs font-bold text-white ${getColor(val)} cursor-default transition-transform hover:scale-110`}>{val}%</div>
                            </TooltipTrigger>
                            <TooltipContent><p className="text-xs">{row.module} — {d}: {val}%</p></TooltipContent>
                          </Tooltip>
                        </td>
                      );
                    })}
                    <td className="p-1.5 text-center">
                      <div className={`mx-auto w-16 h-10 rounded-md flex items-center justify-center text-xs font-bold border-2 ${getBgColor(row.overall)} ${getTextColor(row.overall)}`}>{row.overall}%</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border">
            <span className="text-xs text-muted-foreground">Legend:</span>
            <div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded bg-green-500" /><span className="text-xs">≥80% Complete</span></div>
            <div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded bg-yellow-500" /><span className="text-xs">50-79%</span></div>
            <div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded bg-orange-500" /><span className="text-xs">25-49%</span></div>
            <div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded bg-red-500" /><span className="text-xs">&lt;25%</span></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
