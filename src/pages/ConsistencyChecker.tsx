import { useMemo } from "react";
import { erpMasterData, technicalMappings, reportData, sopData } from "@/data/mock-data";
import { useStore } from "@/data/issues-requirements-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle2, XCircle, Lightbulb, ShieldAlert } from "lucide-react";

interface Inconsistency {
  id: string;
  type: string;
  severity: "Critical" | "Warning" | "Info";
  entity: string;
  entityId: string;
  module: string;
  description: string;
  suggestion: string;
}

const sevColors: Record<string, string> = {
  Critical: "bg-red-500/15 text-red-700 border-red-200",
  Warning: "bg-amber-500/15 text-amber-700 border-amber-200",
  Info: "bg-blue-500/15 text-blue-700 border-blue-200",
};

const sevIcons: Record<string, typeof AlertTriangle> = {
  Critical: XCircle,
  Warning: AlertTriangle,
  Info: Lightbulb,
};

export default function ConsistencyChecker() {
  const { issues, requirements } = useStore();

  const inconsistencies = useMemo(() => {
    const results: Inconsistency[] = [];
    let counter = 0;

    // Forms without technical mapping
    erpMasterData.filter((f) => f.type === "FORM").forEach((form) => {
      if (!technicalMappings.some((tm) => tm.formId === form.originalId)) {
        results.push({ id: `INC-${++counter}`, type: "missing_mapping", severity: "Warning", entity: form.displayName, entityId: form.originalId, module: form.module, description: `Form "${form.displayName}" has no technical mapping (table/API).`, suggestion: "Add table and API endpoint mapping in Technical Mapping section." });
      }
    });

    // Forms with no owner
    erpMasterData.forEach((form) => {
      if (!form.owner || form.owner.trim() === "") {
        results.push({ id: `INC-${++counter}`, type: "missing_owner", severity: "Critical", entity: form.displayName, entityId: form.originalId, module: form.module, description: `Form "${form.displayName}" has no assigned owner.`, suggestion: "Assign an owner from Settings > User Management." });
      }
    });

    // Forms/reports without SOP
    erpMasterData.filter((f) => f.status === "Active" && (f.type === "FORM" || f.type === "REPORT")).forEach((form) => {
      const hasSOP = sopData.some((s) => s.formId === form.originalId);
      if (!hasSOP) {
        results.push({ id: `INC-${++counter}`, type: "missing_sop", severity: "Warning", entity: form.displayName, entityId: form.originalId, module: form.module, description: `Active ${form.type.toLowerCase()} "${form.displayName}" has no SOP document.`, suggestion: "Create SOP using the Template Library or add manually in Form Detail > SOP tab." });
      }
    });

    // Low completion with no active requirements
    erpMasterData.filter((f) => f.percentComplete < 60).forEach((form) => {
      const hasReqs = requirements.some((r) => r.linkedId === form.originalId && (r.status === "Open" || r.status === "In Progress"));
      if (!hasReqs) {
        results.push({ id: `INC-${++counter}`, type: "no_issues_tracked", severity: "Warning", entity: form.displayName, entityId: form.originalId, module: form.module, description: `Form "${form.displayName}" is ${form.percentComplete}% complete but has no active requirements.`, suggestion: "Create requirements to track remaining work." });
      }
    });

    // Reports without SOP
    reportData.filter((r) => r.status === "Active" && !r.sopAvailable).forEach((report) => {
      results.push({ id: `INC-${++counter}`, type: "report_no_sop", severity: "Info", entity: report.name, entityId: report.id, module: report.module, description: `Active report "${report.name}" does not have SOP documentation.`, suggestion: "Add SOP through Report detail dialog or Template Library." });
    });

    // Stale forms
    erpMasterData.forEach((form) => {
      const daysSinceUpdate = Math.floor((Date.now() - new Date(form.updatedAt).getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceUpdate > 60 && form.percentComplete < 100) {
        results.push({ id: `INC-${++counter}`, type: "stale_form", severity: "Info", entity: form.displayName, entityId: form.originalId, module: form.module, description: `Form "${form.displayName}" hasn't been updated in ${daysSinceUpdate} days and is only ${form.percentComplete}% complete.`, suggestion: "Review and update or mark as Deprecated if no longer needed." });
      }
    });

    // Issues without due dates
    issues.filter((i) => !i.dueDate && i.status !== "Closed" && i.status !== "Resolved").forEach((issue) => {
      results.push({ id: `INC-${++counter}`, type: "missing_workflow", severity: "Warning", entity: issue.title, entityId: issue.id, module: issue.module, description: `Issue "${issue.title}" has no due date set.`, suggestion: "Set a target resolution date for better tracking." });
    });

    return results;
  }, [issues, requirements]);

  const critCount = inconsistencies.filter((i) => i.severity === "Critical").length;
  const warnCount = inconsistencies.filter((i) => i.severity === "Warning").length;
  const infoCount = inconsistencies.filter((i) => i.severity === "Info").length;

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <ShieldAlert size={24} className="text-primary" />
          Documentation Consistency Checker
        </h1>
        <p className="text-sm text-muted-foreground">Auto-detect missing SOPs, workflows, mappings, owners, and broken links</p>
      </div>

      <div className="flex items-center gap-3">
        <Badge variant="outline" className={`text-sm px-3 py-1 ${inconsistencies.length > 0 ? "bg-amber-500/15 text-amber-700 border-amber-200" : "bg-green-500/15 text-green-700 border-green-200"}`}>
          <AlertTriangle size={14} className="mr-1.5" />{inconsistencies.length} inconsistencies found
        </Badge>
        {critCount > 0 && <Badge variant="outline" className="bg-red-500/15 text-red-700 border-red-200">{critCount} Critical</Badge>}
        {warnCount > 0 && <Badge variant="outline" className="bg-amber-500/15 text-amber-700 border-amber-200">{warnCount} Warnings</Badge>}
        {infoCount > 0 && <Badge variant="outline" className="bg-blue-500/15 text-blue-700 border-blue-200">{infoCount} Info</Badge>}
      </div>

      <div className="space-y-2">
        {inconsistencies.map((inc) => {
          const Icon = sevIcons[inc.severity];
          return (
            <Card key={inc.id} className="border shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`p-1.5 rounded-md border ${sevColors[inc.severity]} shrink-0 mt-0.5`}><Icon size={14} /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-foreground">{inc.entity}</span>
                      <Badge variant="outline" className="text-[10px] font-mono">{inc.entityId}</Badge>
                      <Badge variant="secondary" className="text-[10px]">{inc.module}</Badge>
                      <Badge variant="outline" className={`text-[10px] ml-auto ${sevColors[inc.severity]}`}>{inc.severity}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{inc.description}</p>
                    <div className="flex items-center gap-1.5 mt-2 text-xs text-primary"><Lightbulb size={12} /><span>{inc.suggestion}</span></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {inconsistencies.length === 0 && (
          <div className="text-center py-16"><CheckCircle2 size={48} className="mx-auto text-green-500 mb-3" /><div className="text-lg font-semibold text-foreground">All Clear!</div><div className="text-sm text-muted-foreground">No documentation inconsistencies detected.</div></div>
        )}
      </div>
    </div>
  );
}
