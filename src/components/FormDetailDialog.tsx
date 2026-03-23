import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { StatusBadge, PriorityBadge, TypeBadge } from "@/components/StatusBadge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Save, AlertTriangle, ClipboardList, Settings2, Trash2, Calendar, History, Paperclip, GitBranch, FileText, Database as DbIcon, ArrowRight } from "lucide-react";
import { useStore, type ReqStatus, type IssueStatus, type IssueSeverity } from "@/data/issues-requirements-store";
import { technicalMappings, reportData } from "@/data/mock-data";
import type { ERPMasterItem, ERPStatus, Priority } from "@/data/mock-data";

const sevColors: Record<string, string> = {
  Critical: "bg-red-500/15 text-red-700 border-red-200",
  High: "bg-orange-500/15 text-orange-700 border-orange-200",
  Medium: "bg-yellow-500/15 text-yellow-700 border-yellow-200",
  Low: "bg-green-500/15 text-green-700 border-green-200",
};
const reqStatusColors: Record<string, string> = {
  Open: "bg-blue-500/15 text-blue-700 border-blue-200",
  "In Progress": "bg-amber-500/15 text-amber-700 border-amber-200",
  Completed: "bg-green-500/15 text-green-700 border-green-200",
  Deferred: "bg-muted text-muted-foreground border-border",
};
const issStatusColors: Record<string, string> = {
  Open: "bg-red-500/15 text-red-700 border-red-200",
  "In Progress": "bg-amber-500/15 text-amber-700 border-amber-200",
  Resolved: "bg-green-500/15 text-green-700 border-green-200",
  Closed: "bg-muted text-muted-foreground border-border",
};

// Mock version history
const versionHistory: Record<string, { version: string; date: string; change: string; by: string }[]> = {
  ERP0000000074: [
    { version: "v2.1", date: "2026-03-01", change: "Added HSN code field", by: "Rajesh K." },
    { version: "v2.0", date: "2026-01-15", change: "Redesigned UI with tabbed layout", by: "Amit S." },
    { version: "v1.1", date: "2025-09-10", change: "Added barcode support", by: "Rajesh K." },
    { version: "v1.0", date: "2025-01-15", change: "Initial release", by: "Admin" },
  ],
};

// Mock attachments
const attachments: Record<string, { name: string; type: string; size: string; uploaded: string; by: string }[]> = {
  ERP0000000074: [
    { name: "Item_Master_SOP.pdf", type: "PDF", size: "2.4 MB", uploaded: "2026-02-15", by: "Rajesh K." },
    { name: "Field_Mapping.xlsx", type: "Excel", size: "156 KB", uploaded: "2026-01-20", by: "Admin" },
    { name: "UI_Screenshot.png", type: "Image", size: "340 KB", uploaded: "2026-03-01", by: "Amit S." },
  ],
};

// Mock workflow
const workflows: Record<string, { steps: string[] }> = {
  MTL0000000645: { steps: ["Purchase Indent", "Purchase Order", "GRN Entry", "Quality Check", "Stock Update", "Invoice Matching"] },
  ERP0000000074: { steps: ["Item Request", "Item Code Generation", "Master Data Entry", "Approval", "Activation"] },
  ERP0000000112: { steps: ["Stock Count", "Variance Report", "Adjustment Entry", "Manager Approval", "GL Posting"] },
  SAL0000000045: { steps: ["Quotation", "Sales Order", "Credit Check", "Dispatch", "Invoice", "Payment"] },
};

interface Props {
  item: ERPMasterItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (updated: ERPMasterItem) => void;
}

export default function FormDetailDialog({ item, open, onOpenChange, onSave }: Props) {
  const [editData, setEditData] = useState<ERPMasterItem | null>(null);
  const [showNewReq, setShowNewReq] = useState(false);
  const [showNewIssue, setShowNewIssue] = useState(false);
  const [newReq, setNewReq] = useState({ title: "", description: "", priority: "Medium" as Priority, assignee: "" });
  const [newIssue, setNewIssue] = useState({ title: "", description: "", severity: "Medium" as IssueSeverity, assignee: "" });

  const { requirements, issues, addRequirement, addIssue, removeRequirement, removeIssue, updateRequirementStatus, updateIssueStatus } = useStore();

  const currentItem = editData?.id === item?.id ? editData : item;
  const itemReqs = requirements.filter((r) => r.linkedId === currentItem?.originalId);
  const itemIssues = issues.filter((i) => i.linkedId === currentItem?.originalId);

  const handleOpen = (isOpen: boolean) => {
    if (isOpen && item) { setEditData({ ...item }); setShowNewReq(false); setShowNewIssue(false); }
    onOpenChange(isOpen);
  };

  const updateField = <K extends keyof ERPMasterItem>(key: K, value: ERPMasterItem[K]) => {
    if (editData) setEditData({ ...editData, [key]: value });
  };

  const handleSave = () => {
    if (editData && onSave) onSave({ ...editData, updatedAt: new Date().toISOString().split("T")[0] });
    onOpenChange(false);
  };

  const handleAddReq = () => {
    if (!newReq.title.trim() || !currentItem) return;
    addRequirement({ ...newReq, status: "Open", assignedBy: "Current User", dueDate: "", tags: [], linkedType: currentItem.type === "FORM" ? "Form" : currentItem.type === "REPORT" ? "Report" : "General", linkedId: currentItem.originalId, linkedName: currentItem.displayName, module: currentItem.module });
    setNewReq({ title: "", description: "", priority: "Medium", assignee: "" });
    setShowNewReq(false);
  };

  const handleAddIssue = () => {
    if (!newIssue.title.trim() || !currentItem) return;
    addIssue({ ...newIssue, status: "Open", reportedBy: "Current User", assignedBy: "Current User", dueDate: "", tags: [], linkedType: currentItem.type === "FORM" ? "Form" : currentItem.type === "REPORT" ? "Report" : "General", linkedId: currentItem.originalId, linkedName: currentItem.displayName, module: currentItem.module });
    setNewIssue({ title: "", description: "", severity: "Medium", assignee: "" });
    setShowNewIssue(false);
  };

  if (!currentItem) return null;

  const itemVersions = versionHistory[currentItem.originalId] || [{ version: "v1.0", date: currentItem.createdAt, change: "Initial release", by: currentItem.owner }];
  const itemAttachments = attachments[currentItem.originalId] || [];
  const itemWorkflow = workflows[currentItem.originalId] || { steps: ["Entry", "Validation", "Approval", "Posting"] };
  const linkedReports = reportData.filter((r) => r.module === currentItem.module);
  const linkedTables = technicalMappings.filter((t) => t.formId === currentItem.originalId);

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="max-w-4xl max-h-[88vh] overflow-y-auto p-0">
        <DialogHeader className="p-5 pb-3 border-b bg-muted/30">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <DialogTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                <span className="font-mono text-primary text-sm">{currentItem.originalId}</span>
                <span className="text-muted-foreground font-normal">·</span>
                {currentItem.displayName}
              </DialogTitle>
              <div className="flex items-center gap-2 flex-wrap">
                <TypeBadge type={currentItem.type} />
                <StatusBadge status={currentItem.status} />
                <PriorityBadge priority={currentItem.priority} />
                <span className="text-xs text-muted-foreground">{currentItem.module} / {currentItem.subModule}</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <div className="flex items-center gap-1.5 bg-background border rounded-md px-2.5 py-1">
                <Progress value={currentItem.percentComplete} className="h-1.5 w-14" />
                <span className="text-xs font-medium">{currentItem.percentComplete}%</span>
              </div>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="details" className="px-5 pt-2 pb-5">
          <TabsList className="mb-3 flex-wrap h-auto gap-1">
            <TabsTrigger value="details" className="text-[11px] gap-1"><Settings2 size={12} />Details</TabsTrigger>
            <TabsTrigger value="requirements" className="text-[11px] gap-1">
              <ClipboardList size={12} />Reqs{itemReqs.length > 0 && <Badge variant="secondary" className="ml-0.5 text-[9px] px-1 py-0">{itemReqs.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="issues" className="text-[11px] gap-1">
              <AlertTriangle size={12} />Issues{itemIssues.length > 0 && <Badge variant="destructive" className="ml-0.5 text-[9px] px-1 py-0">{itemIssues.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="versions" className="text-[11px] gap-1"><History size={12} />Versions</TabsTrigger>
            <TabsTrigger value="attachments" className="text-[11px] gap-1"><Paperclip size={12} />Files</TabsTrigger>
            <TabsTrigger value="workflow" className="text-[11px] gap-1"><GitBranch size={12} />Workflow</TabsTrigger>
            <TabsTrigger value="reports" className="text-[11px] gap-1"><FileText size={12} />Reports</TabsTrigger>
            <TabsTrigger value="tables" className="text-[11px] gap-1"><DbIcon size={12} />Tables</TabsTrigger>
          </TabsList>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-4 mt-0">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Display Name</Label>
                <Input value={editData?.displayName || ""} onChange={(e) => updateField("displayName", e.target.value)} className="h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Original Name</Label>
                <Input value={editData?.originalName || ""} onChange={(e) => updateField("originalName", e.target.value)} className="h-9 text-sm font-mono" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Status</Label>
                <Select value={editData?.status || "Active"} onValueChange={(v) => updateField("status", v as ERPStatus)}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>{(["Active", "In Development", "Testing", "Deprecated"] as ERPStatus[]).map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Priority</Label>
                <Select value={editData?.priority || "Medium"} onValueChange={(v) => updateField("priority", v as Priority)}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>{(["High", "Medium", "Low"] as Priority[]).map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Owner</Label>
                <Input value={editData?.owner || ""} onChange={(e) => updateField("owner", e.target.value)} className="h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">% Complete</Label>
                <Input type="number" min={0} max={100} value={editData?.percentComplete ?? 0} onChange={(e) => updateField("percentComplete", Number(e.target.value))} className="h-9 text-sm" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Remarks</Label>
              <Textarea value={editData?.remarks || ""} onChange={(e) => updateField("remarks", e.target.value)} className="text-sm min-h-[60px]" />
            </div>
            <div className="flex items-center justify-between pt-2 border-t">
              <div className="text-xs text-muted-foreground flex items-center gap-3">
                <span className="flex items-center gap-1"><Calendar size={12} /> Created: {currentItem.createdAt}</span>
                <span className="flex items-center gap-1"><Calendar size={12} /> Updated: {currentItem.updatedAt}</span>
              </div>
              <Button size="sm" onClick={handleSave} className="gap-1.5"><Save size={14} />Save</Button>
            </div>
          </TabsContent>

          {/* Requirements Tab */}
          <TabsContent value="requirements" className="space-y-3 mt-0">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Business requirements linked to this object</p>
              <Button size="sm" variant="outline" onClick={() => setShowNewReq(true)} className="gap-1.5 text-xs"><Plus size={13} />Add</Button>
            </div>
            {showNewReq && (
              <div className="border rounded-lg p-3 bg-muted/20 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <Input value={newReq.title} onChange={(e) => setNewReq({ ...newReq, title: e.target.value })} className="h-8 text-sm" placeholder="Title" />
                  <div className="grid grid-cols-2 gap-2">
                    <Select value={newReq.priority} onValueChange={(v) => setNewReq({ ...newReq, priority: v as Priority })}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>{(["High", "Medium", "Low"] as Priority[]).map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                    </Select>
                    <Input value={newReq.assignee} onChange={(e) => setNewReq({ ...newReq, assignee: e.target.value })} className="h-8 text-xs" placeholder="Assignee" />
                  </div>
                </div>
                <Textarea value={newReq.description} onChange={(e) => setNewReq({ ...newReq, description: e.target.value })} className="text-sm min-h-[40px]" placeholder="Description..." />
                <div className="flex justify-end gap-2">
                  <Button size="sm" variant="ghost" onClick={() => setShowNewReq(false)} className="text-xs h-7">Cancel</Button>
                  <Button size="sm" onClick={handleAddReq} className="text-xs h-7"><Plus size={12} />Add</Button>
                </div>
              </div>
            )}
            {itemReqs.length > 0 ? (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader><TableRow className="bg-muted/40">
                    <TableHead className="text-[11px] w-[70px]">ID</TableHead>
                    <TableHead className="text-[11px]">Title</TableHead>
                    <TableHead className="text-[11px] w-[70px]">Priority</TableHead>
                    <TableHead className="text-[11px] w-[85px]">Status</TableHead>
                    <TableHead className="text-[11px] w-[80px]">Assignee</TableHead>
                    <TableHead className="text-[11px] w-[35px]"></TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {itemReqs.map((req) => (
                      <TableRow key={req.id}>
                        <TableCell className="font-mono text-xs text-primary">{req.id}</TableCell>
                        <TableCell><div className="text-sm font-medium">{req.title}</div></TableCell>
                        <TableCell><PriorityBadge priority={req.priority} /></TableCell>
                        <TableCell>
                          <Select value={req.status} onValueChange={(v) => updateRequirementStatus(req.id, v as ReqStatus)}>
                            <SelectTrigger className="h-6 text-[10px] w-[80px] border-0 p-0 px-1"><Badge variant="outline" className={`text-[10px] ${reqStatusColors[req.status]}`}>{req.status}</Badge></SelectTrigger>
                            <SelectContent>{(["Open", "In Progress", "Completed", "Deferred"] as ReqStatus[]).map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-xs">{req.assignee}</TableCell>
                        <TableCell><Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeRequirement(req.id)}><Trash2 size={12} className="text-muted-foreground" /></Button></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : !showNewReq && (
              <div className="border rounded-lg p-6 text-center">
                <ClipboardList className="mx-auto mb-2 text-muted-foreground" size={24} />
                <p className="text-sm text-muted-foreground">No requirements yet</p>
              </div>
            )}
          </TabsContent>

          {/* Issues Tab */}
          <TabsContent value="issues" className="space-y-3 mt-0">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Bugs and defects reported</p>
              <Button size="sm" variant="outline" onClick={() => setShowNewIssue(true)} className="gap-1.5 text-xs"><Plus size={13} />Report</Button>
            </div>
            {showNewIssue && (
              <div className="border rounded-lg p-3 bg-destructive/5 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <Input value={newIssue.title} onChange={(e) => setNewIssue({ ...newIssue, title: e.target.value })} className="h-8 text-sm" placeholder="Title" />
                  <div className="grid grid-cols-2 gap-2">
                    <Select value={newIssue.severity} onValueChange={(v) => setNewIssue({ ...newIssue, severity: v as IssueSeverity })}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>{(["Critical", "High", "Medium", "Low"] as IssueSeverity[]).map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                    <Input value={newIssue.assignee} onChange={(e) => setNewIssue({ ...newIssue, assignee: e.target.value })} className="h-8 text-xs" placeholder="Assignee" />
                  </div>
                </div>
                <Textarea value={newIssue.description} onChange={(e) => setNewIssue({ ...newIssue, description: e.target.value })} className="text-sm min-h-[40px]" placeholder="Description..." />
                <div className="flex justify-end gap-2">
                  <Button size="sm" variant="ghost" onClick={() => setShowNewIssue(false)} className="text-xs h-7">Cancel</Button>
                  <Button size="sm" onClick={handleAddIssue} className="text-xs h-7"><Plus size={12} />Report</Button>
                </div>
              </div>
            )}
            {itemIssues.length > 0 ? (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader><TableRow className="bg-muted/40">
                    <TableHead className="text-[11px] w-[70px]">ID</TableHead>
                    <TableHead className="text-[11px]">Title</TableHead>
                    <TableHead className="text-[11px] w-[75px]">Severity</TableHead>
                    <TableHead className="text-[11px] w-[85px]">Status</TableHead>
                    <TableHead className="text-[11px] w-[80px]">Assignee</TableHead>
                    <TableHead className="text-[11px] w-[35px]"></TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {itemIssues.map((iss) => (
                      <TableRow key={iss.id}>
                        <TableCell className="font-mono text-xs text-destructive">{iss.id}</TableCell>
                        <TableCell><div className="text-sm font-medium">{iss.title}</div></TableCell>
                        <TableCell><Badge variant="outline" className={`text-[10px] ${sevColors[iss.severity]}`}>{iss.severity}</Badge></TableCell>
                        <TableCell>
                          <Select value={iss.status} onValueChange={(v) => updateIssueStatus(iss.id, v as IssueStatus)}>
                            <SelectTrigger className="h-6 text-[10px] w-[80px] border-0 p-0 px-1"><Badge variant="outline" className={`text-[10px] ${issStatusColors[iss.status]}`}>{iss.status}</Badge></SelectTrigger>
                            <SelectContent>{(["Open", "In Progress", "Resolved", "Closed"] as IssueStatus[]).map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-xs">{iss.assignee}</TableCell>
                        <TableCell><Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeIssue(iss.id)}><Trash2 size={12} className="text-muted-foreground" /></Button></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : !showNewIssue && (
              <div className="border rounded-lg p-6 text-center">
                <AlertTriangle className="mx-auto mb-2 text-muted-foreground" size={24} />
                <p className="text-sm text-muted-foreground">No issues reported</p>
              </div>
            )}
          </TabsContent>

          {/* Version History Tab */}
          <TabsContent value="versions" className="space-y-3 mt-0">
            <p className="text-xs text-muted-foreground">Change history and version tracking</p>
            <div className="relative pl-6 space-y-4">
              <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-border" />
              {itemVersions.map((v, i) => (
                <div key={i} className="relative">
                  <div className={`absolute left-[-17px] w-3 h-3 rounded-full border-2 ${i === 0 ? "bg-primary border-primary" : "bg-background border-muted-foreground/30"}`} />
                  <div className="border rounded-lg p-3 bg-muted/20">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={i === 0 ? "default" : "outline"} className="text-[10px]">{v.version}</Badge>
                      <span className="text-xs text-muted-foreground">{v.date}</span>
                      <span className="text-xs text-muted-foreground ml-auto">by {v.by}</span>
                    </div>
                    <p className="text-sm">{v.change}</p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Attachments Tab */}
          <TabsContent value="attachments" className="space-y-3 mt-0">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">SOPs, screenshots, Excel files, PDFs</p>
              <Button size="sm" variant="outline" className="gap-1.5 text-xs"><Plus size={13} />Upload</Button>
            </div>
            {itemAttachments.length > 0 ? (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader><TableRow className="bg-muted/40">
                    <TableHead className="text-[11px]">File Name</TableHead>
                    <TableHead className="text-[11px] w-[60px]">Type</TableHead>
                    <TableHead className="text-[11px] w-[70px]">Size</TableHead>
                    <TableHead className="text-[11px] w-[90px]">Uploaded</TableHead>
                    <TableHead className="text-[11px] w-[80px]">By</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {itemAttachments.map((att, i) => (
                      <TableRow key={i}>
                        <TableCell className="text-sm font-medium flex items-center gap-2">
                          <Paperclip size={12} className="text-muted-foreground" />{att.name}
                        </TableCell>
                        <TableCell><Badge variant="outline" className="text-[10px]">{att.type}</Badge></TableCell>
                        <TableCell className="text-xs text-muted-foreground">{att.size}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{att.uploaded}</TableCell>
                        <TableCell className="text-xs">{att.by}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="border rounded-lg p-6 text-center">
                <Paperclip className="mx-auto mb-2 text-muted-foreground" size={24} />
                <p className="text-sm text-muted-foreground">No attachments yet</p>
              </div>
            )}
          </TabsContent>

          {/* Workflow Tab */}
          <TabsContent value="workflow" className="space-y-3 mt-0">
            <p className="text-xs text-muted-foreground">Process flow for this form</p>
            <div className="flex items-center gap-1 flex-wrap p-4 border rounded-lg bg-muted/20">
              {itemWorkflow.steps.map((step, i) => (
                <div key={i} className="flex items-center gap-1">
                  <div className="px-3 py-2 rounded-md bg-primary/10 border border-primary/20 text-sm font-medium text-primary">
                    {step}
                  </div>
                  {i < itemWorkflow.steps.length - 1 && <ArrowRight size={16} className="text-muted-foreground mx-1" />}
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Linked Reports Tab */}
          <TabsContent value="reports" className="space-y-3 mt-0">
            <p className="text-xs text-muted-foreground">Reports using data from this form's module</p>
            {linkedReports.length > 0 ? (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader><TableRow className="bg-muted/40">
                    <TableHead className="text-[11px]">Report</TableHead>
                    <TableHead className="text-[11px] w-[80px]">Category</TableHead>
                    <TableHead className="text-[11px] w-[80px]">Frequency</TableHead>
                    <TableHead className="text-[11px] w-[90px]">Used By</TableHead>
                    <TableHead className="text-[11px] w-[70px]">Format</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {linkedReports.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="text-sm font-medium">{r.name}</TableCell>
                        <TableCell><Badge variant="outline" className="text-[10px]">{r.category}</Badge></TableCell>
                        <TableCell className="text-xs text-muted-foreground">{r.frequency}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{r.usedByRole}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{r.exportFormat}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="border rounded-lg p-6 text-center">
                <FileText className="mx-auto mb-2 text-muted-foreground" size={24} />
                <p className="text-sm text-muted-foreground">No linked reports</p>
              </div>
            )}
          </TabsContent>

          {/* Linked Tables Tab */}
          <TabsContent value="tables" className="space-y-3 mt-0">
            <p className="text-xs text-muted-foreground">PostgreSQL table mapping and API endpoints</p>
            {linkedTables.length > 0 ? (
              <div className="space-y-3">
                {linkedTables.map((t) => (
                  <div key={t.id} className="border rounded-lg p-4 bg-muted/20 space-y-2">
                    <div className="flex items-center gap-2">
                      <DbIcon size={14} className="text-primary" />
                      <span className="font-mono text-sm text-primary font-medium">{t.tableName}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-muted-foreground">API Endpoint:</span>
                        <span className="ml-2 font-mono bg-muted px-1.5 py-0.5 rounded">{t.apiEndpoint}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Module:</span>
                        <span className="ml-2">{t.module}</span>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">{t.logicDescription}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border rounded-lg p-6 text-center">
                <DbIcon className="mx-auto mb-2 text-muted-foreground" size={24} />
                <p className="text-sm text-muted-foreground">No table mapping defined</p>
                <p className="text-xs text-muted-foreground mt-1">Add mapping via Technical Mapping page</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
