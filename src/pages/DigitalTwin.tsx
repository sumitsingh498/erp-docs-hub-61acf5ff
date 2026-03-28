import { useState, useCallback } from "react";
import { erpMasterData, technicalMappings, reportData, sopData, MODULES, type ERPModule } from "@/data/mock-data";
import { useStore } from "@/data/issues-requirements-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Network, Database, Globe, FileText, FolderOpen, ArrowRight, X, Layers, Bug, ClipboardList } from "lucide-react";

type NodeType = "form" | "table" | "api" | "report" | "module";

interface ChainNode {
  type: NodeType;
  id: string;
  label: string;
  detail?: string;
}

const nodeColors: Record<NodeType, string> = {
  form: "bg-primary/15 text-primary border-primary/30",
  table: "bg-accent/15 text-accent border-accent/30",
  api: "bg-success/15 text-success border-success/30",
  report: "bg-warning/15 text-warning border-warning/30",
  module: "bg-destructive/15 text-destructive border-destructive/30",
};

const nodeIcons: Record<NodeType, typeof Database> = {
  form: Layers,
  table: Database,
  api: Globe,
  report: FileText,
  module: FolderOpen,
};

export default function DigitalTwin() {
  const { issues, requirements } = useStore();
  const [selectedModule, setSelectedModule] = useState<"all" | ERPModule>("all");
  const [selectedChain, setSelectedChain] = useState<ChainNode[] | null>(null);
  const [chainTitle, setChainTitle] = useState("");

  const moduleForms = erpMasterData.filter((f) => selectedModule === "all" || f.module === selectedModule);

  const buildChain = useCallback((formId: string, formName: string, module: ERPModule) => {
    const chain: ChainNode[] = [];

    // Form node
    chain.push({ type: "form", id: formId, label: formName, detail: formId });

    // Find technical mapping for tables + API
    const tm = technicalMappings.find((t) => t.formId === formId);
    if (tm) {
      tm.tableName.split(",").map((t) => t.trim()).forEach((table) => {
        chain.push({ type: "table", id: table, label: table, detail: "PostgreSQL" });
      });
      chain.push({ type: "api", id: tm.apiEndpoint, label: tm.apiEndpoint, detail: tm.logicDescription });
    }

    // Linked reports
    const linkedReports = reportData.filter((r) => r.module === module);
    linkedReports.slice(0, 2).forEach((r) => {
      chain.push({ type: "report", id: r.id, label: r.name, detail: `${r.category} · ${r.frequency}` });
    });

    // Module node
    chain.push({ type: "module", id: module, label: `${module} Module`, detail: `${erpMasterData.filter((f) => f.module === module).length} forms` });

    setChainTitle(formName);
    setSelectedChain(chain);
  }, []);

  const getFormStats = (formId: string) => {
    const formIssues = issues.filter((i) => i.linkedId === formId && i.status !== "Closed" && i.status !== "Resolved");
    const formReqs = requirements.filter((r) => r.linkedId === formId && r.status !== "Completed");
    return { issues: formIssues.length, reqs: formReqs.length };
  };

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Network size={24} className="text-primary" />
          ERP Digital Twin
        </h1>
        <p className="text-sm text-muted-foreground">
          Live system map — Click any form to trace the full chain: Form → Table → API → Report → Module
        </p>
      </div>

      {/* Module Tabs */}
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => setSelectedModule("all")}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
            selectedModule === "all" ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >All Modules</button>
        {MODULES.map((m) => (
          <button key={m} onClick={() => setSelectedModule(m)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              selectedModule === m ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >{m}</button>
        ))}
      </div>

      {/* System Map Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {moduleForms.map((form) => {
          const stats = getFormStats(form.originalId);
          const hasTm = technicalMappings.some((t) => t.formId === form.originalId);
          return (
            <Card
              key={form.id}
              className="border shadow-sm cursor-pointer hover:shadow-md hover:border-primary/40 transition-all group"
              onClick={() => buildChain(form.originalId, form.displayName, form.module)}
            >
              <CardContent className="p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-md ${nodeColors.form}`}>
                      <Layers size={14} />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{form.displayName}</div>
                      <div className="text-[10px] font-mono text-muted-foreground">{form.originalId}</div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[10px]">
                  <Badge variant="secondary" className="text-[10px]">{form.module}</Badge>
                  <Badge variant="outline" className="text-[10px]">{form.type}</Badge>
                  {hasTm && <Badge variant="outline" className="text-[10px] bg-success/10 text-success border-success/20">Mapped</Badge>}
                </div>
                <div className="flex items-center gap-3 text-[10px] text-muted-foreground pt-1 border-t border-border">
                  <span className="flex items-center gap-1">
                    <Bug size={10} className={stats.issues > 0 ? "text-destructive" : ""} />
                    {stats.issues} issues
                  </span>
                  <span className="flex items-center gap-1">
                    <ClipboardList size={10} className={stats.reqs > 0 ? "text-primary" : ""} />
                    {stats.reqs} reqs
                  </span>
                  <span className="ml-auto">{form.percentComplete}%</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Chain Detail Dialog */}
      <Dialog open={!!selectedChain} onOpenChange={() => setSelectedChain(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Network size={18} className="text-primary" />
              System Chain — {chainTitle}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-0">
            {selectedChain?.map((node, i) => {
              const Icon = nodeIcons[node.type];
              return (
                <div key={`${node.type}-${node.id}-${i}`}>
                  <div className={`flex items-center gap-3 p-3 rounded-lg border ${nodeColors[node.type]}`}>
                    <Icon size={18} />
                    <div className="flex-1">
                      <div className="text-sm font-semibold">{node.label}</div>
                      {node.detail && <div className="text-xs opacity-70">{node.detail}</div>}
                    </div>
                    <Badge variant="outline" className="text-[10px] capitalize">{node.type}</Badge>
                  </div>
                  {i < (selectedChain?.length ?? 0) - 1 && (
                    <div className="flex justify-center py-1">
                      <ArrowRight size={16} className="text-muted-foreground rotate-90" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
