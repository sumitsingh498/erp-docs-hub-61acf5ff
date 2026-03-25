import { useState, useMemo } from "react";
import { erpMasterData, technicalMappings, reportData, MODULES, type ERPModule } from "@/data/mock-data";
import { useStore } from "@/data/issues-requirements-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Share2, Search, Database, Layers, FileText, FolderOpen, Users, ArrowRight, Filter } from "lucide-react";

type NodeKind = "Form" | "Report" | "Table" | "Module" | "User" | "API";

interface GraphNode {
  id: string;
  kind: NodeKind;
  label: string;
  module?: string;
}

interface GraphEdge {
  from: string;
  to: string;
  relation: string;
}

const kindColors: Record<NodeKind, string> = {
  Form: "bg-primary/15 text-primary border-primary/30",
  Report: "bg-warning/15 text-warning border-warning/30",
  Table: "bg-accent/15 text-accent border-accent/30",
  Module: "bg-destructive/15 text-destructive border-destructive/30",
  User: "bg-success/15 text-success border-success/30",
  API: "bg-info/15 text-info border-info/30",
};

const kindIcons: Record<NodeKind, typeof Database> = {
  Form: Layers,
  Report: FileText,
  Table: Database,
  Module: FolderOpen,
  User: Users,
  API: Share2,
};

export default function KnowledgeGraph() {
  const { issues } = useStore();
  const [search, setSearch] = useState("");
  const [filterKind, setFilterKind] = useState<"all" | NodeKind>("all");
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  const { nodes, edges } = useMemo(() => {
    const n: GraphNode[] = [];
    const e: GraphEdge[] = [];
    const seen = new Set<string>();

    const addNode = (node: GraphNode) => {
      if (!seen.has(node.id)) { seen.add(node.id); n.push(node); }
    };

    // Modules
    MODULES.forEach((m) => addNode({ id: `mod-${m}`, kind: "Module", label: m }));

    // Forms
    erpMasterData.forEach((f) => {
      addNode({ id: `form-${f.originalId}`, kind: "Form", label: f.displayName, module: f.module });
      e.push({ from: `form-${f.originalId}`, to: `mod-${f.module}`, relation: "belongs to" });
      addNode({ id: `user-${f.owner}`, kind: "User", label: f.owner });
      e.push({ from: `form-${f.originalId}`, to: `user-${f.owner}`, relation: "owned by" });
    });

    // Reports
    reportData.forEach((r) => {
      addNode({ id: `report-${r.id}`, kind: "Report", label: r.name, module: r.module });
      e.push({ from: `report-${r.id}`, to: `mod-${r.module}`, relation: "belongs to" });
    });

    // Technical Mappings
    technicalMappings.forEach((tm) => {
      tm.tableName.split(",").map((t) => t.trim()).forEach((table) => {
        addNode({ id: `table-${table}`, kind: "Table", label: table });
        e.push({ from: `form-${tm.formId}`, to: `table-${table}`, relation: "uses" });
      });
      addNode({ id: `api-${tm.apiEndpoint}`, kind: "API", label: tm.apiEndpoint });
      e.push({ from: `form-${tm.formId}`, to: `api-${tm.apiEndpoint}`, relation: "calls" });
    });

    return { nodes: n, edges: e };
  }, []);

  const filteredNodes = nodes.filter((n) => {
    const matchSearch = !search || n.label.toLowerCase().includes(search.toLowerCase()) || n.id.toLowerCase().includes(search.toLowerCase());
    const matchKind = filterKind === "all" || n.kind === filterKind;
    return matchSearch && matchKind;
  });

  const getConnections = (nodeId: string) => {
    const outgoing = edges.filter((e) => e.from === nodeId).map((e) => ({ ...e, direction: "out" as const, node: nodes.find((n) => n.id === e.to) }));
    const incoming = edges.filter((e) => e.to === nodeId).map((e) => ({ ...e, direction: "in" as const, node: nodes.find((n) => n.id === e.from) }));
    return [...outgoing, ...incoming];
  };

  const kindCounts = (["Form", "Report", "Table", "Module", "User", "API"] as NodeKind[]).map((k) => ({
    kind: k,
    count: nodes.filter((n) => n.kind === k).length,
  }));

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Share2 size={24} className="text-primary" />
          Knowledge Graph
        </h1>
        <p className="text-sm text-muted-foreground">Visual + searchable graph of all ERP entities and their relationships</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
        {kindCounts.map(({ kind, count }) => {
          const Icon = kindIcons[kind];
          return (
            <Card key={kind} className={`border shadow-sm cursor-pointer transition-all ${filterKind === kind ? "ring-2 ring-primary" : ""}`} onClick={() => setFilterKind(filterKind === kind ? "all" : kind)}>
              <CardContent className="p-3 flex items-center gap-2">
                <Icon size={14} className="text-muted-foreground" />
                <div>
                  <div className="text-lg font-bold text-foreground">{count}</div>
                  <div className="text-[10px] text-muted-foreground">{kind}s</div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search nodes..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9 text-sm" />
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Node List */}
        <div className="lg:col-span-2 space-y-1.5 max-h-[600px] overflow-y-auto">
          {filteredNodes.map((node) => {
            const Icon = kindIcons[node.kind];
            const connections = getConnections(node.id);
            return (
              <div
                key={node.id}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all hover:shadow-sm ${
                  selectedNode?.id === node.id ? "ring-2 ring-primary bg-primary/5" : "bg-card hover:bg-muted/30"
                }`}
                onClick={() => setSelectedNode(node)}
              >
                <div className={`p-1.5 rounded-md border ${kindColors[node.kind]}`}>
                  <Icon size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground truncate">{node.label}</div>
                  <div className="text-[10px] text-muted-foreground">{node.kind}{node.module ? ` · ${node.module}` : ""}</div>
                </div>
                <Badge variant="outline" className="text-[10px]">{connections.length} links</Badge>
              </div>
            );
          })}
          {filteredNodes.length === 0 && (
            <div className="text-center py-12 text-sm text-muted-foreground">No nodes match your search</div>
          )}
        </div>

        {/* Connection Detail */}
        <Card className="border shadow-sm h-fit sticky top-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">
              {selectedNode ? `Connections: ${selectedNode.label}` : "Select a node"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedNode ? (
              <div className="space-y-2">
                <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md border ${kindColors[selectedNode.kind]}`}>
                  {(() => { const Icon = kindIcons[selectedNode.kind]; return <Icon size={12} />; })()}
                  <span className="text-xs font-medium">{selectedNode.kind}</span>
                </div>
                <div className="space-y-1.5 mt-3">
                  {getConnections(selectedNode.id).map((conn, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 rounded-md bg-muted/30 text-xs">
                      <ArrowRight size={10} className={conn.direction === "out" ? "text-primary" : "text-muted-foreground rotate-180"} />
                      <span className="text-muted-foreground">{conn.relation}</span>
                      <span className="font-medium text-foreground truncate">{conn.node?.label}</span>
                      <Badge variant="outline" className="text-[9px] ml-auto">{conn.node?.kind}</Badge>
                    </div>
                  ))}
                  {getConnections(selectedNode.id).length === 0 && (
                    <div className="text-xs text-muted-foreground text-center py-4">No connections</div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-xs text-muted-foreground text-center py-8">Click a node on the left to view its relationships</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
