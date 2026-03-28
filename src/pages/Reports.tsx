import { useState, useMemo } from "react";
import { reportData, MODULES, type ReportItem, type ReportCategory, type ERPStatus, type ERPModule } from "@/data/mock-data";
import { StatusBadge } from "@/components/StatusBadge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, Eye, Edit, Paperclip, FileText, Lock, Send, MessageSquare, CheckCircle2 } from "lucide-react";

const categoryColors: Record<string, string> = {
  MIS: "bg-primary/15 text-primary border-primary/30",
  Operational: "bg-accent/15 text-accent border-accent/30",
  Statutory: "bg-destructive/15 text-destructive border-destructive/30",
  Analytical: "bg-warning/15 text-warning border-warning/30",
};

interface ReportComment { id: string; user: string; text: string; timestamp: string; }

interface ExtendedReport extends ReportItem {
  comments: ReportComment[];
}

export default function Reports() {
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [moduleFilter, setModuleFilter] = useState("all");
  const [showAdd, setShowAdd] = useState(false);
  const [viewReport, setViewReport] = useState<ExtendedReport | null>(null);
  const [editReport, setEditReport] = useState<ExtendedReport | null>(null);
  const [newComment, setNewComment] = useState("");
  const [reports, setReports] = useState<ExtendedReport[]>(
    reportData.map(r => ({ ...r, comments: [] }))
  );

  const [newReport, setNewReport] = useState({
    name: "", module: "Finance" as ERPModule, category: "Operational" as ReportCategory,
    frequency: "", usedByRole: "", exportFormat: "Excel", description: "",
    status: "In Development" as ERPStatus, createdBy: "Current User", assignee: "", approvedBy: "",
  });

  const filtered = useMemo(() => {
    return reports.filter((r) => {
      const matchSearch = !search || r.name.toLowerCase().includes(search.toLowerCase()) || r.description.toLowerCase().includes(search.toLowerCase());
      const matchCat = catFilter === "all" || r.category === catFilter;
      const matchMod = moduleFilter === "all" || r.module === moduleFilter;
      return matchSearch && matchCat && matchMod;
    });
  }, [search, catFilter, moduleFilter, reports]);

  const isLocked = (r: ExtendedReport) => r.status === "Deprecated";

  const handleAdd = () => {
    if (!newReport.name.trim()) return;
    const id = `R${reports.length + 1}`;
    setReports([...reports, { ...newReport, id, sopAvailable: false, attachments: [], comments: [] }]);
    setNewReport({ name: "", module: "Finance", category: "Operational", frequency: "", usedByRole: "", exportFormat: "Excel", description: "", status: "In Development", createdBy: "Current User", assignee: "", approvedBy: "" });
    setShowAdd(false);
  };

  const handleSaveEdit = () => {
    if (!editReport) return;
    setReports(reports.map(r => r.id === editReport.id ? editReport : r));
    setEditReport(null);
  };

  const handleAddComment = (report: ExtendedReport, setter: (r: ExtendedReport) => void) => {
    if (!newComment.trim()) return;
    const comment = { id: `C${Date.now()}`, user: "Current User", text: newComment, timestamp: new Date().toISOString() };
    const updated = { ...report, comments: [...report.comments, comment] };
    setter(updated);
    setReports(reports.map(r => r.id === updated.id ? updated : r));
    setNewComment("");
  };

  const handleAttachment = (report: ExtendedReport, setter: (r: ExtendedReport) => void) => {
    const input = document.createElement("input");
    input.type = "file";
    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const att = { name: file.name, type: file.type || "file", size: `${(file.size / 1024).toFixed(1)} KB`, uploadedBy: "Current User", uploadedAt: new Date().toISOString() };
      const updated = { ...report, attachments: [...report.attachments, att] };
      setter(updated);
      setReports(reports.map(r => r.id === updated.id ? updated : r));
    };
    input.click();
  };

  const pendingCount = reports.filter(r => r.status === "In Development").length;
  const withSOP = reports.filter(r => r.sopAvailable).length;

  return (
    <div className="p-6 space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Report Register</h1>
          <p className="text-sm text-muted-foreground">All reports — MIS, Operational, Statutory & Analytical · {reports.length} reports · {withSOP} with SOP</p>
        </div>
        <Button size="sm" onClick={() => setShowAdd(true)} className="gap-1.5"><Plus size={14} />Add Report</Button>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search reports..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9 text-sm" />
        </div>
        <Select value={catFilter} onValueChange={setCatFilter}>
          <SelectTrigger className="w-[140px] h-9 text-sm"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="MIS">MIS</SelectItem>
            <SelectItem value="Operational">Operational</SelectItem>
            <SelectItem value="Statutory">Statutory</SelectItem>
            <SelectItem value="Analytical">Analytical</SelectItem>
          </SelectContent>
        </Select>
        <Select value={moduleFilter} onValueChange={setModuleFilter}>
          <SelectTrigger className="w-[140px] h-9 text-sm"><SelectValue placeholder="Module" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Modules</SelectItem>
            {MODULES.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
          </SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground">{filtered.length} results</span>
      </div>

      <div className="border rounded-lg overflow-auto bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="text-xs">ID</TableHead>
              <TableHead className="text-xs">Name</TableHead>
              <TableHead className="text-xs">Module</TableHead>
              <TableHead className="text-xs">Category</TableHead>
              <TableHead className="text-xs">Frequency</TableHead>
              <TableHead className="text-xs">Created By</TableHead>
              <TableHead className="text-xs">Assign To</TableHead>
              <TableHead className="text-xs">SOP</TableHead>
              <TableHead className="text-xs">Status</TableHead>
              <TableHead className="text-xs w-[60px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((r) => (
              <TableRow key={r.id} className="cursor-pointer hover:bg-muted/30" onClick={() => { setViewReport(r); setNewComment(""); }}>
                <TableCell className="font-mono text-xs text-primary">{r.id}</TableCell>
                <TableCell>
                  <div className="text-sm font-medium">{r.name}</div>
                  <div className="text-xs text-muted-foreground line-clamp-1">{r.description}</div>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">{r.module}</TableCell>
                <TableCell><Badge variant="outline" className={`text-xs ${categoryColors[r.category]}`}>{r.category}</Badge></TableCell>
                <TableCell className="text-xs">{r.frequency}</TableCell>
                <TableCell className="text-xs">{r.createdBy}</TableCell>
                <TableCell className="text-xs">{r.assignee}</TableCell>
                <TableCell>{r.sopAvailable ? <CheckCircle2 size={14} className="text-green-600" /> : <span className="text-xs text-muted-foreground">—</span>}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={`text-[10px] ${isLocked(r) ? "bg-muted" : ""}`}>
                    {isLocked(r) && <Lock size={8} className="mr-0.5" />}
                    {r.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-0.5">
                    <Button variant="ghost" size="icon" className="h-6 w-6" title="View" onClick={(e) => { e.stopPropagation(); setViewReport(r); setNewComment(""); }}>
                      <Eye size={12} className="text-muted-foreground" />
                    </Button>
                    {!isLocked(r) && (
                      <Button variant="ghost" size="icon" className="h-6 w-6" title="Edit" onClick={(e) => { e.stopPropagation(); setEditReport({ ...r }); }}>
                        <Edit size={12} className="text-primary" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Add Report Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Add New Report</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label className="text-xs">Report Name *</Label><Input value={newReport.name} onChange={(e) => setNewReport({ ...newReport, name: e.target.value })} className="h-9 text-sm" /></div>
              <div className="space-y-1"><Label className="text-xs">Module</Label>
                <Select value={newReport.module} onValueChange={(v) => setNewReport({ ...newReport, module: v as ERPModule })}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>{MODULES.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1"><Label className="text-xs">Category</Label>
                <Select value={newReport.category} onValueChange={(v) => setNewReport({ ...newReport, category: v as ReportCategory })}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>{["MIS", "Operational", "Statutory", "Analytical"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1"><Label className="text-xs">Frequency</Label><Input value={newReport.frequency} onChange={(e) => setNewReport({ ...newReport, frequency: e.target.value })} className="h-9 text-sm" placeholder="Daily, Weekly..." /></div>
              <div className="space-y-1"><Label className="text-xs">Export Format</Label><Input value={newReport.exportFormat} onChange={(e) => setNewReport({ ...newReport, exportFormat: e.target.value })} className="h-9 text-sm" placeholder="Excel, PDF" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label className="text-xs">Used By Role</Label><Input value={newReport.usedByRole} onChange={(e) => setNewReport({ ...newReport, usedByRole: e.target.value })} className="h-9 text-sm" /></div>
              <div className="space-y-1"><Label className="text-xs">Assign To</Label><Input value={newReport.assignee} onChange={(e) => setNewReport({ ...newReport, assignee: e.target.value })} className="h-9 text-sm" /></div>
            </div>
            <div className="space-y-1"><Label className="text-xs">Description</Label><Textarea value={newReport.description} onChange={(e) => setNewReport({ ...newReport, description: e.target.value })} className="text-sm min-h-[60px]" /></div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setShowAdd(false)}>Cancel</Button>
              <Button onClick={handleAdd}><Plus size={14} className="mr-1" />Add Report</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Report Dialog */}
      <Dialog open={!!viewReport} onOpenChange={() => setViewReport(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {viewReport && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FileText size={18} className="text-primary" />
                  <span className="font-mono text-sm text-primary">{viewReport.id}</span>
                  {viewReport.name}
                  {isLocked(viewReport) && <Badge variant="outline" className="text-[9px] bg-green-500/15 text-green-700 gap-1"><Lock size={8} />Locked</Badge>}
                </DialogTitle>
              </DialogHeader>
              <Tabs defaultValue="details">
                <TabsList className="mb-3">
                  <TabsTrigger value="details" className="text-xs">Details</TabsTrigger>
                  <TabsTrigger value="attachments" className="text-xs gap-1"><Paperclip size={12} />Files ({viewReport.attachments.length})</TabsTrigger>
                  <TabsTrigger value="comments" className="text-xs gap-1"><MessageSquare size={12} />Comments ({viewReport.comments.length})</TabsTrigger>
                </TabsList>
                <TabsContent value="details" className="space-y-3">
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div><span className="text-xs text-muted-foreground">Module</span><div className="font-medium">{viewReport.module}</div></div>
                    <div><span className="text-xs text-muted-foreground">Category</span><div><Badge variant="outline" className={`text-xs ${categoryColors[viewReport.category]}`}>{viewReport.category}</Badge></div></div>
                    <div><span className="text-xs text-muted-foreground">Frequency</span><div className="font-medium">{viewReport.frequency}</div></div>
                    <div><span className="text-xs text-muted-foreground">Used By</span><div className="font-medium">{viewReport.usedByRole}</div></div>
                    <div><span className="text-xs text-muted-foreground">Export</span><div className="font-medium">{viewReport.exportFormat}</div></div>
                    <div><span className="text-xs text-muted-foreground">Status</span><div><StatusBadge status={viewReport.status} /></div></div>
                    <div><span className="text-xs text-muted-foreground">Created By</span><div className="font-medium">{viewReport.createdBy}</div></div>
                    <div><span className="text-xs text-muted-foreground">Assigned To</span><div className="font-medium">{viewReport.assignee}</div></div>
                    <div><span className="text-xs text-muted-foreground">Approved By</span><div className="font-medium">{viewReport.approvedBy || "Pending"}</div></div>
                  </div>
                  <div><span className="text-xs text-muted-foreground">Description</span><p className="text-sm mt-1">{viewReport.description}</p></div>
                  <div className="flex items-center gap-2"><span className="text-xs text-muted-foreground">SOP Available:</span>{viewReport.sopAvailable ? <Badge variant="outline" className="text-xs bg-green-500/15 text-green-700">✓ Yes</Badge> : <Badge variant="outline" className="text-xs">Not Yet</Badge>}</div>
                </TabsContent>
                <TabsContent value="attachments" className="space-y-3">
                  <div className="flex justify-end">
                    <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={() => handleAttachment(viewReport, setViewReport)}>
                      <Paperclip size={12} />Attach File
                    </Button>
                  </div>
                  {viewReport.attachments.length > 0 ? (
                    <div className="space-y-1.5">
                      {viewReport.attachments.map((att, i) => (
                        <div key={i} className="flex items-center gap-3 p-2 rounded-md bg-muted/30 text-sm">
                          <Paperclip size={12} className="text-muted-foreground" />
                          <span className="font-medium flex-1">{att.name}</span>
                          <span className="text-xs text-muted-foreground">{att.size}</span>
                          <span className="text-xs text-muted-foreground">{att.uploadedBy}</span>
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-center text-sm text-muted-foreground py-6">No attachments yet</p>}
                </TabsContent>
                <TabsContent value="comments" className="space-y-3">
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {viewReport.comments.map(c => (
                      <div key={c.id} className="flex items-start gap-2 p-2 rounded-md bg-muted/30">
                        <div className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">{c.user.charAt(0)}</div>
                        <div><div className="text-xs"><span className="font-medium">{c.user}</span> <span className="text-muted-foreground">· {new Date(c.timestamp).toLocaleDateString()}</span></div><p className="text-sm">{c.text}</p></div>
                      </div>
                    ))}
                    {viewReport.comments.length === 0 && <p className="text-center text-sm text-muted-foreground py-4">No comments yet</p>}
                  </div>
                  <div className="flex gap-2">
                    <Input value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Add comment..." className="h-8 text-sm" onKeyDown={(e) => e.key === "Enter" && handleAddComment(viewReport, setViewReport)} />
                    <Button size="sm" className="h-8" onClick={() => handleAddComment(viewReport, setViewReport)}><Send size={12} /></Button>
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Report Dialog */}
      <Dialog open={!!editReport} onOpenChange={() => setEditReport(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Edit Report — {editReport?.name}</DialogTitle></DialogHeader>
          {editReport && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><Label className="text-xs">Name</Label><Input value={editReport.name} onChange={(e) => setEditReport({ ...editReport, name: e.target.value })} className="h-9 text-sm" /></div>
                <div className="space-y-1"><Label className="text-xs">Module</Label>
                  <Select value={editReport.module} onValueChange={(v) => setEditReport({ ...editReport, module: v as ERPModule })}>
                    <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>{MODULES.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1"><Label className="text-xs">Category</Label>
                  <Select value={editReport.category} onValueChange={(v) => setEditReport({ ...editReport, category: v as ReportCategory })}>
                    <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>{["MIS", "Operational", "Statutory", "Analytical"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1"><Label className="text-xs">Frequency</Label><Input value={editReport.frequency} onChange={(e) => setEditReport({ ...editReport, frequency: e.target.value })} className="h-9 text-sm" /></div>
                <div className="space-y-1"><Label className="text-xs">Status</Label>
                  <Select value={editReport.status} onValueChange={(v) => setEditReport({ ...editReport, status: v as ERPStatus })}>
                    <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>{["Active", "In Development", "Testing", "Deprecated"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1"><Label className="text-xs">Used By</Label><Input value={editReport.usedByRole} onChange={(e) => setEditReport({ ...editReport, usedByRole: e.target.value })} className="h-9 text-sm" /></div>
                <div className="space-y-1"><Label className="text-xs">Assign To</Label><Input value={editReport.assignee} onChange={(e) => setEditReport({ ...editReport, assignee: e.target.value })} className="h-9 text-sm" /></div>
                <div className="space-y-1"><Label className="text-xs">Approved By</Label><Input value={editReport.approvedBy} onChange={(e) => setEditReport({ ...editReport, approvedBy: e.target.value })} className="h-9 text-sm" /></div>
              </div>
              <div className="space-y-1"><Label className="text-xs">Description</Label><Textarea value={editReport.description} onChange={(e) => setEditReport({ ...editReport, description: e.target.value })} className="text-sm min-h-[60px]" /></div>
              <div className="space-y-1"><Label className="text-xs">Export Format</Label><Input value={editReport.exportFormat} onChange={(e) => setEditReport({ ...editReport, exportFormat: e.target.value })} className="h-9 text-sm" /></div>
              {/* Attachments Section */}
              <div className="border-t pt-3">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-xs">Attachments</Label>
                  <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => handleAttachment(editReport, setEditReport)}><Paperclip size={10} />Attach</Button>
                </div>
                {editReport.attachments.length > 0 && (
                  <div className="space-y-1">
                    {editReport.attachments.map((att, i) => (
                      <div key={i} className="flex items-center gap-2 p-1.5 rounded bg-muted/30 text-xs">
                        <Paperclip size={10} /><span>{att.name}</span><span className="text-muted-foreground ml-auto">{att.size}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" onClick={() => setEditReport(null)}>Cancel</Button>
                <Button onClick={handleSaveEdit}><Edit size={14} className="mr-1" />Save Changes</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
