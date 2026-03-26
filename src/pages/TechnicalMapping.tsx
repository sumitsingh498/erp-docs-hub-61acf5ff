import { useState } from "react";
import { useTechnicalMappingStore } from "@/data/technical-mapping-store";
import { MODULES, type ERPModule, type TechnicalMapping } from "@/data/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Database, Globe, Cpu, Search, Plus, Edit, Eye } from "lucide-react";

export default function TechnicalMapping() {
  const { mappings, addMapping, updateMapping } = useTechnicalMappingStore();
  const [activeModule, setActiveModule] = useState<"all" | ERPModule>("all");
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [editMapping, setEditMapping] = useState<TechnicalMapping | null>(null);
  const [viewMapping, setViewMapping] = useState<TechnicalMapping | null>(null);
  const [newMapping, setNewMapping] = useState({ formId: "", formName: "", tableName: "", apiEndpoint: "", logicDescription: "", module: "Master" as ERPModule });

  const filtered = mappings.filter((tm) => {
    const matchModule = activeModule === "all" || tm.module === activeModule;
    const matchSearch = !search || tm.formName.toLowerCase().includes(search.toLowerCase()) || tm.formId.toLowerCase().includes(search.toLowerCase()) || tm.tableName.toLowerCase().includes(search.toLowerCase()) || tm.apiEndpoint.toLowerCase().includes(search.toLowerCase());
    return matchModule && matchSearch;
  });

  const modulesWithMappings = MODULES.filter((m) => mappings.some((tm) => tm.module === m));

  const handleAdd = () => {
    if (!newMapping.formName.trim() || !newMapping.tableName.trim()) return;
    addMapping(newMapping);
    setNewMapping({ formId: "", formName: "", tableName: "", apiEndpoint: "", logicDescription: "", module: "Master" });
    setShowAdd(false);
  };

  const handleUpdate = () => {
    if (!editMapping) return;
    updateMapping(editMapping.id, editMapping);
    setEditMapping(null);
  };

  return (
    <div className="p-6 space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Technical Mapping</h1>
          <p className="text-sm text-muted-foreground">Form → Table → API → Logic mapping</p>
        </div>
        <Button size="sm" onClick={() => setShowAdd(true)} className="gap-1.5"><Plus size={14} />Add Mapping</Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-1.5">
          <button onClick={() => setActiveModule("all")} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${activeModule === "all" ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
            All ({mappings.length})
          </button>
          {modulesWithMappings.map((m) => {
            const count = mappings.filter((tm) => tm.module === m).length;
            return (
              <button key={m} onClick={() => setActiveModule(m)} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${activeModule === m ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
                {m} ({count})
              </button>
            );
          })}
        </div>
        <div className="relative flex-1 min-w-[180px] max-w-xs ml-auto">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search mappings..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9 text-sm" />
        </div>
      </div>

      <div className="grid gap-4">
        {filtered.map((tm) => (
          <Card key={tm.id} className="border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                {tm.formName}
                <Badge variant="outline" className="ml-2 text-[10px] bg-primary/10 text-primary border-primary/20 font-mono">{tm.formId}</Badge>
                <Badge variant="secondary" className="ml-auto text-[10px]">{tm.module}</Badge>
                <Button variant="ghost" size="icon" className="h-6 w-6" title="View" onClick={() => setViewMapping(tm)}><Eye size={12} className="text-muted-foreground" /></Button>
                <Button variant="ghost" size="icon" className="h-6 w-6" title="Edit" onClick={() => setEditMapping({ ...tm })}><Edit size={12} className="text-primary" /></Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid md:grid-cols-3 gap-3">
                <div className="flex items-start gap-2 p-3 rounded-md bg-muted/50">
                  <Database size={15} className="text-primary mt-0.5 shrink-0" />
                  <div><div className="text-xs font-medium text-foreground">Tables</div><div className="text-xs text-muted-foreground font-mono">{tm.tableName}</div></div>
                </div>
                <div className="flex items-start gap-2 p-3 rounded-md bg-muted/50">
                  <Globe size={15} className="text-primary mt-0.5 shrink-0" />
                  <div><div className="text-xs font-medium text-foreground">API Endpoint</div><div className="text-xs text-muted-foreground font-mono">{tm.apiEndpoint}</div></div>
                </div>
                <div className="flex items-start gap-2 p-3 rounded-md bg-muted/50">
                  <Cpu size={15} className="text-primary mt-0.5 shrink-0" />
                  <div><div className="text-xs font-medium text-foreground">Logic</div><div className="text-xs text-muted-foreground">{tm.logicDescription}</div></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && <div className="text-center py-12 text-sm text-muted-foreground">No technical mappings found for the selected filter.</div>}
      </div>

      {/* Add Mapping Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Add Technical Mapping</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label className="text-xs">Form ID</Label><Input value={newMapping.formId} onChange={(e) => setNewMapping({ ...newMapping, formId: e.target.value })} className="h-9 text-sm" placeholder="e.g. ERP0000000074" /></div>
              <div className="space-y-1"><Label className="text-xs">Form Name</Label><Input value={newMapping.formName} onChange={(e) => setNewMapping({ ...newMapping, formName: e.target.value })} className="h-9 text-sm" placeholder="e.g. Item Master Entry" /></div>
            </div>
            <div className="space-y-1"><Label className="text-xs">Module</Label>
              <Select value={newMapping.module} onValueChange={(v) => setNewMapping({ ...newMapping, module: v as ERPModule })}>
                <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>{MODULES.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label className="text-xs">Table Name(s)</Label><Input value={newMapping.tableName} onChange={(e) => setNewMapping({ ...newMapping, tableName: e.target.value })} className="h-9 text-sm" placeholder="e.g. erp_items, erp_item_attributes" /></div>
            <div className="space-y-1"><Label className="text-xs">API Endpoint</Label><Input value={newMapping.apiEndpoint} onChange={(e) => setNewMapping({ ...newMapping, apiEndpoint: e.target.value })} className="h-9 text-sm" placeholder="e.g. /api/v1/items" /></div>
            <div className="space-y-1"><Label className="text-xs">Logic Description</Label><Textarea value={newMapping.logicDescription} onChange={(e) => setNewMapping({ ...newMapping, logicDescription: e.target.value })} className="text-sm min-h-[60px]" placeholder="Describe the business logic..." /></div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setShowAdd(false)}>Cancel</Button>
              <Button onClick={handleAdd} className="gap-1.5"><Plus size={14} />Add Mapping</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Mapping Dialog */}
      <Dialog open={!!editMapping} onOpenChange={() => setEditMapping(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Edit Technical Mapping</DialogTitle></DialogHeader>
          {editMapping && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><Label className="text-xs">Form ID</Label><Input value={editMapping.formId} onChange={(e) => setEditMapping({ ...editMapping, formId: e.target.value })} className="h-9 text-sm" /></div>
                <div className="space-y-1"><Label className="text-xs">Form Name</Label><Input value={editMapping.formName} onChange={(e) => setEditMapping({ ...editMapping, formName: e.target.value })} className="h-9 text-sm" /></div>
              </div>
              <div className="space-y-1"><Label className="text-xs">Module</Label>
                <Select value={editMapping.module} onValueChange={(v) => setEditMapping({ ...editMapping, module: v as ERPModule })}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>{MODULES.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1"><Label className="text-xs">Table Name(s)</Label><Input value={editMapping.tableName} onChange={(e) => setEditMapping({ ...editMapping, tableName: e.target.value })} className="h-9 text-sm" /></div>
              <div className="space-y-1"><Label className="text-xs">API Endpoint</Label><Input value={editMapping.apiEndpoint} onChange={(e) => setEditMapping({ ...editMapping, apiEndpoint: e.target.value })} className="h-9 text-sm" /></div>
              <div className="space-y-1"><Label className="text-xs">Logic Description</Label><Textarea value={editMapping.logicDescription} onChange={(e) => setEditMapping({ ...editMapping, logicDescription: e.target.value })} className="text-sm min-h-[60px]" /></div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" onClick={() => setEditMapping(null)}>Cancel</Button>
                <Button onClick={handleUpdate} className="gap-1.5"><Edit size={14} />Save Changes</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* View Mapping Dialog */}
      <Dialog open={!!viewMapping} onOpenChange={() => setViewMapping(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="flex items-center gap-2">{viewMapping?.formName}<Badge variant="outline" className="text-[10px] font-mono">{viewMapping?.formId}</Badge></DialogTitle></DialogHeader>
          {viewMapping && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs"><span className="text-muted-foreground">Module:</span><Badge variant="secondary" className="text-[10px]">{viewMapping.module}</Badge></div>
              <div className="space-y-3">
                <div className="p-3 rounded-md bg-muted/50"><div className="flex items-center gap-2 mb-1"><Database size={14} className="text-primary" /><span className="text-xs font-medium">Database Tables</span></div><div className="text-sm font-mono text-muted-foreground">{viewMapping.tableName}</div></div>
                <div className="p-3 rounded-md bg-muted/50"><div className="flex items-center gap-2 mb-1"><Globe size={14} className="text-primary" /><span className="text-xs font-medium">API Endpoint</span></div><div className="text-sm font-mono text-muted-foreground">{viewMapping.apiEndpoint}</div></div>
                <div className="p-3 rounded-md bg-muted/50"><div className="flex items-center gap-2 mb-1"><Cpu size={14} className="text-primary" /><span className="text-xs font-medium">Business Logic</span></div><div className="text-sm text-muted-foreground">{viewMapping.logicDescription}</div></div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
