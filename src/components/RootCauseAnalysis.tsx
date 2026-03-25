import { useMemo } from "react";
import type { Issue } from "@/data/issues-requirements-store";
import { useStore } from "@/data/issues-requirements-store";
import { erpMasterData, technicalMappings } from "@/data/mock-data";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Database, Layers, Bug, ClipboardList, History, ArrowRight, Zap } from "lucide-react";

interface Props {
  issue: Issue | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function RootCauseAnalysis({ issue, open, onOpenChange }: Props) {
  const { issues, requirements } = useStore();

  const analysis = useMemo(() => {
    if (!issue) return null;

    // Related tables
    const tm = technicalMappings.find((t) => t.formId === issue.linkedId);
    const tables = tm ? tm.tableName.split(",").map((t) => t.trim()) : [];
    const api = tm?.apiEndpoint || null;
    const logic = tm?.logicDescription || null;

    // Linked form details
    const linkedForm = erpMasterData.find((f) => f.originalId === issue.linkedId);

    // Related issues (same form or module)
    const relatedIssues = issues.filter((i) =>
      i.id !== issue.id && (i.linkedId === issue.linkedId || i.module === issue.module) && i.status !== "Closed"
    );

    // Related requirements
    const relatedReqs = requirements.filter((r) =>
      r.linkedId === issue.linkedId || r.module === issue.module
    );

    // Recent changes (from issue history + related)
    const allChanges = [
      ...issue.history,
      ...relatedIssues.flatMap((i) => i.history),
    ].sort((a, b) => b.timestamp.localeCompare(a.timestamp)).slice(0, 5);

    return { tables, api, logic, linkedForm, relatedIssues, relatedReqs, allChanges };
  }, [issue, issues, requirements]);

  if (!issue || !analysis) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap size={18} className="text-warning" />
            Root Cause Analysis — {issue.id}
          </DialogTitle>
        </DialogHeader>

        <div className="text-sm font-medium text-foreground">{issue.title}</div>
        <div className="text-xs text-muted-foreground">{issue.description}</div>

        <div className="grid gap-4 mt-3">
          {/* Linked Form */}
          {analysis.linkedForm && (
            <div className="p-3 rounded-lg border bg-muted/30 space-y-1">
              <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Layers size={13} className="text-primary" /> Linked Form
              </div>
              <div className="text-sm">{analysis.linkedForm.displayName}</div>
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                <span className="font-mono">{analysis.linkedForm.originalId}</span>
                <span>Owner: {analysis.linkedForm.owner}</span>
                <span>{analysis.linkedForm.percentComplete}% complete</span>
              </div>
            </div>
          )}

          {/* Related Tables */}
          <div className="p-3 rounded-lg border bg-muted/30 space-y-2">
            <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Database size={13} className="text-accent" /> Related Tables
            </div>
            {analysis.tables.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {analysis.tables.map((t) => (
                  <Badge key={t} variant="outline" className="text-xs font-mono bg-accent/10 text-accent border-accent/20">{t}</Badge>
                ))}
              </div>
            ) : (
              <div className="text-xs text-muted-foreground">No table mapping found</div>
            )}
            {analysis.api && (
              <div className="text-xs mt-1">
                <span className="text-muted-foreground">API:</span>{" "}
                <span className="font-mono text-success">{analysis.api}</span>
              </div>
            )}
            {analysis.logic && (
              <div className="text-xs text-muted-foreground mt-1">{analysis.logic}</div>
            )}
          </div>

          {/* Recent Changes */}
          <div className="p-3 rounded-lg border bg-muted/30 space-y-2">
            <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <History size={13} className="text-primary" /> Recent Changes
            </div>
            {analysis.allChanges.length > 0 ? (
              <div className="space-y-1">
                {analysis.allChanges.map((c) => (
                  <div key={c.id} className="flex items-center gap-2 text-xs p-1.5 rounded bg-background">
                    <span className="text-muted-foreground">{new Date(c.timestamp).toLocaleDateString()}</span>
                    <span className="font-medium">{c.user}</span>
                    <ArrowRight size={10} className="text-muted-foreground" />
                    <span className="capitalize text-muted-foreground">{c.field}:</span>
                    <span>{c.oldValue || "—"} → {c.newValue}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-muted-foreground">No recent changes found</div>
            )}
          </div>

          {/* Related Issues */}
          <div className="p-3 rounded-lg border bg-muted/30 space-y-2">
            <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Bug size={13} className="text-destructive" /> Related Issues ({analysis.relatedIssues.length})
            </div>
            {analysis.relatedIssues.slice(0, 4).map((ri) => (
              <div key={ri.id} className="flex items-center gap-2 text-xs p-1.5 rounded bg-background">
                <span className="font-mono text-destructive">{ri.id}</span>
                <span className="truncate flex-1">{ri.title}</span>
                <Badge variant="outline" className="text-[9px]">{ri.severity}</Badge>
              </div>
            ))}
            {analysis.relatedIssues.length === 0 && <div className="text-xs text-muted-foreground">No related issues</div>}
          </div>

          {/* Related Requirements */}
          <div className="p-3 rounded-lg border bg-muted/30 space-y-2">
            <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <ClipboardList size={13} className="text-primary" /> Linked Requirements ({analysis.relatedReqs.length})
            </div>
            {analysis.relatedReqs.slice(0, 4).map((rr) => (
              <div key={rr.id} className="flex items-center gap-2 text-xs p-1.5 rounded bg-background">
                <span className="font-mono text-primary">{rr.id}</span>
                <span className="truncate flex-1">{rr.title}</span>
                <Badge variant="outline" className="text-[9px]">{rr.status}</Badge>
              </div>
            ))}
            {analysis.relatedReqs.length === 0 && <div className="text-xs text-muted-foreground">No linked requirements</div>}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
