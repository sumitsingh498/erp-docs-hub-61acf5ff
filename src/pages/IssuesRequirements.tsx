import { useState } from "react";
import { useStore, type ReqStatus, type IssueStatus, type IssueSeverity, type LinkedType, type Requirement, type Issue } from "@/data/issues-requirements-store";
import { useUsersStore } from "@/data/users-store";
import { MODULES, type Priority } from "@/data/mock-data";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PriorityBadge } from "@/components/StatusBadge";
import { Plus, Search, ClipboardList, AlertTriangle, History, User, Zap, Eye, Edit, Paperclip, Send, Lock, MessageSquare } from "lucide-react";
import RootCauseAnalysis from "@/components/RootCauseAnalysis";

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
  Testing: "bg-violet-500/15 text-violet-700 border-violet-200",
  Resolved: "bg-green-500/15 text-green-700 border-green-200",
  Closed: "bg-muted text-muted-foreground border-border",
  Reopened: "bg-red-500/15 text-red-700 border-red-200",
};

const LINKED_TYPES: LinkedType[] = ["Form", "Report", "Module", "Menu", "Documentation", "General"];

export default function IssuesRequirements() {
  const { requirements, issues, addRequirement, addIssue, updateRequirementStatus, updateIssueStatus, updateRequirementField, updateIssueField, addRequirementComment, addIssueComment, addRequirementAttachment, addIssueAttachment } = useStore();
  const { users } = useUsersStore();
  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState("all");
  const [userFilter, setUserFilter] = useState("all");
  const [showAddReq, setShowAddReq] = useState(false);
  const [showAddIssue, setShowAddIssue] = useState(false);
  const [rootCauseIssue, setRootCauseIssue] = useState<Issue | null>(null);
  const [detailReq, setDetailReq] = useState<Requirement | null>(null);
  const [detailIssue, setDetailIssue] = useState<Issue | null>(null);
  const [newComment, setNewComment] = useState("");

  const [newReq, setNewReq] = useState({ title: "", description: "", priority: "Medium" as Priority, assignee: "", linkedType: "General" as LinkedType, linkedId: "", linkedName: "", module: "" });
  const [newIssue, setNewIssue] = useState({ title: "", description: "", severity: "Medium" as IssueSeverity, assignee: "", reportedBy: "", linkedType: "General" as LinkedType, linkedId: "", linkedName: "", module: "" });

  const allAssignees = [...new Set([...requirements.map((r) => r.assignee), ...issues.map((i) => i.assignee)])].filter(Boolean).sort();

  const filteredReqs = requirements.filter((r) => {
    const ms = !search || r.title.toLowerCase().includes(search.toLowerCase()) || r.linkedName.toLowerCase().includes(search.toLowerCase()) || r.id.toLowerCase().includes(search.toLowerCase());
    const mm = moduleFilter === "all" || r.module === moduleFilter;
    const mu = userFilter === "all" || r.assignee === userFilter;
    return ms && mm && mu;
  });

  const filteredIssues = issues.filter((i) => {
    const ms = !search || i.title.toLowerCase().includes(search.toLowerCase()) || i.linkedName.toLowerCase().includes(search.toLowerCase()) || i.id.toLowerCase().includes(search.toLowerCase());
    const mm = moduleFilter === "all" || i.module === moduleFilter;
    const mu = userFilter === "all" || i.assignee === userFilter;
    return ms && mm && mu;
  });

  const pendingReqs = requirements.filter((r) => r.status === "Open" || r.status === "In Progress").length;
  const pendingIssues = issues.filter((i) => i.status === "Open" || i.status === "In Progress").length;
  const criticalIssues = issues.filter((i) => i.severity === "Critical" && i.status !== "Closed" && i.status !== "Resolved").length;

  const handleAddReq = () => {
    if (!newReq.title.trim()) return;
    addRequirement({ ...newReq, status: "Open", assignedBy: "Current User", dueDate: "", tags: [] });
    setNewReq({ title: "", description: "", priority: "Medium", assignee: "", linkedType: "General", linkedId: "", linkedName: "", module: "" });
    setShowAddReq(false);
  };

  const handleAddIssue = () => {
    if (!newIssue.title.trim()) return;
    addIssue({ ...newIssue, status: "Open", assignedBy: "Current User", dueDate: "", tags: [] });
    setNewIssue({ title: "", description: "", severity: "Medium", assignee: "", reportedBy: "", linkedType: "General", linkedId: "", linkedName: "", module: "" });
    setShowAddIssue(false);
  };

  const isReqLocked = (r: Requirement) => r.status === "Completed" || r.status === "Deferred";
  const isIssueLocked = (i: Issue) => i.status === "Closed" || i.status === "Resolved";

  const handleAddAttachment = (type: "req" | "issue", id: string) => {
    const input = document.createElement("input");
    input.type = "file";
    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const att = { name: file.name, type: file.type || "file", size: `${(file.size / 1024).toFixed(1)} KB`, uploadedBy: "Current User", uploadedAt: new Date().toISOString() };
      if (type === "req") {
        addRequirementAttachment(id, att);
        if (detailReq) setDetailReq({ ...detailReq, attachments: [...detailReq.attachments, { ...att, id: "temp" }] });
      } else {
        addIssueAttachment(id, att);
        if (detailIssue) setDetailIssue({ ...detailIssue, attachments: [...detailIssue.attachments, { ...att, id: "temp" }] });
      }
    };
    input.click();
  };

  const handleReqComment = () => {
    if (!newComment.trim() || !detailReq) return;
    addRequirementComment(detailReq.id, "Current User", newComment);
    setDetailReq({ ...detailReq, comments: [...detailReq.comments, { id: "temp", user: "Current User", text: newComment, timestamp: new Date().toISOString() }] });
    setNewComment("");
  };

  const handleIssueComment = () => {
    if (!newComment.trim() || !detailIssue) return;
    addIssueComment(detailIssue.id, "Current User", newComment);
    setDetailIssue({ ...detailIssue, comments: [...detailIssue.comments, { id: "temp", user: "Current User", text: newComment, timestamp: new Date().toISOString() }] });
    setNewComment("");
  };

  return (
    <div className="p-6 space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Issues & Requirements</h1>
          <p className="text-sm text-muted-foreground">Track requirements and issues across all modules — filter by user, module, or search</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setShowAddReq(true)} className="gap-1.5"><ClipboardList size={14} />New Requirement</Button>
          <Button size="sm" variant="destructive" onClick={() => setShowAddIssue(true)} className="gap-1.5"><AlertTriangle size={14} />Report Issue</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border shadow-sm"><CardContent className="p-4"><div className="text-2xl font-bold text-foreground">{pendingReqs}</div><div className="text-xs text-muted-foreground">Pending Requirements</div></CardContent></Card>
        <Card className="border shadow-sm"><CardContent className="p-4"><div className="text-2xl font-bold text-foreground">{pendingIssues}</div><div className="text-xs text-muted-foreground">Open Issues</div></CardContent></Card>
        <Card className="border shadow-sm"><CardContent className="p-4"><div className="text-2xl font-bold text-destructive">{criticalIssues}</div><div className="text-xs text-muted-foreground">Critical Issues</div></CardContent></Card>
        <Card className="border shadow-sm"><CardContent className="p-4"><div className="text-2xl font-bold text-foreground">{requirements.length + issues.length}</div><div className="text-xs text-muted-foreground">Total Items</div></CardContent></Card>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search by title, ID, linked name..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9 text-sm" />
        </div>
        <Select value={moduleFilter} onValueChange={setModuleFilter}>
          <SelectTrigger className="w-[140px] h-9 text-sm"><SelectValue placeholder="Module" /></SelectTrigger>
          <SelectContent><SelectItem value="all">All Modules</SelectItem>{[...MODULES, "General"].map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={userFilter} onValueChange={setUserFilter}>
          <SelectTrigger className="w-[140px] h-9 text-sm"><div className="flex items-center gap-1.5"><User size={12} /><SelectValue placeholder="Assignee" /></div></SelectTrigger>
          <SelectContent><SelectItem value="all">All Users</SelectItem>{allAssignees.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="requirements">
        <TabsList>
          <TabsTrigger value="requirements" className="gap-1.5">Requirements ({filteredReqs.length})</TabsTrigger>
          <TabsTrigger value="issues" className="gap-1.5">Issues ({filteredIssues.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="requirements" className="mt-3">
          <div className="border rounded-lg overflow-auto bg-card shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="text-[11px] w-[80px]">ID</TableHead>
                  <TableHead className="text-[11px]">Title</TableHead>
                  <TableHead className="text-[11px] w-[80px]">Module</TableHead>
                  <TableHead className="text-[11px] w-[70px]">Priority</TableHead>
                  <TableHead className="text-[11px] w-[90px]">Status</TableHead>
                  <TableHead className="text-[11px] w-[80px]">Created By</TableHead>
                  <TableHead className="text-[11px] w-[80px]">Assign To</TableHead>
                  <TableHead className="text-[11px] w-[80px]">Approved By</TableHead>
                  <TableHead className="text-[11px] w-[60px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReqs.map((req) => (
                  <TableRow key={req.id} className="cursor-pointer hover:bg-muted/30" onClick={() => { setDetailReq(req); setNewComment(""); }}>
                    <TableCell className="font-mono text-xs text-primary">{req.id}</TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">{req.title}</div>
                      <div className="text-xs text-muted-foreground line-clamp-1">{req.linkedType}: {req.linkedName}</div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{req.module}</TableCell>
                    <TableCell><PriorityBadge priority={req.priority} /></TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[10px] ${reqStatusColors[req.status]}`}>
                        {isReqLocked(req) && <Lock size={8} className="mr-0.5" />}{req.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">{req.createdBy}</TableCell>
                    <TableCell className="text-xs">{req.assignee}</TableCell>
                    <TableCell className="text-xs">{req.approvedBy || "—"}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-6 w-6" title={isReqLocked(req) ? "View" : "Edit"} onClick={(e) => { e.stopPropagation(); setDetailReq(req); setNewComment(""); }}>
                        {isReqLocked(req) ? <Eye size={12} className="text-muted-foreground" /> : <Edit size={12} className="text-primary" />}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredReqs.length === 0 && <TableRow><TableCell colSpan={9} className="text-center text-sm text-muted-foreground py-8">No requirements found</TableCell></TableRow>}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="issues" className="mt-3">
          <div className="border rounded-lg overflow-auto bg-card shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="text-[11px] w-[70px]">ID</TableHead>
                  <TableHead className="text-[11px]">Title</TableHead>
                  <TableHead className="text-[11px] w-[80px]">Module</TableHead>
                  <TableHead className="text-[11px] w-[75px]">Severity</TableHead>
                  <TableHead className="text-[11px] w-[90px]">Status</TableHead>
                  <TableHead className="text-[11px] w-[80px]">Created By</TableHead>
                  <TableHead className="text-[11px] w-[80px]">Assign To</TableHead>
                  <TableHead className="text-[11px] w-[80px]">Approved By</TableHead>
                  <TableHead className="text-[11px] w-[60px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredIssues.map((iss) => (
                  <TableRow key={iss.id} className="cursor-pointer hover:bg-muted/30" onClick={() => { setDetailIssue(iss); setNewComment(""); }}>
                    <TableCell className="font-mono text-xs text-destructive">{iss.id}</TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">{iss.title}</div>
                      <div className="text-xs text-muted-foreground line-clamp-1">{iss.linkedType}: {iss.linkedName}</div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{iss.module}</TableCell>
                    <TableCell><Badge variant="outline" className={`text-[10px] ${sevColors[iss.severity]}`}>{iss.severity}</Badge></TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[10px] ${issStatusColors[iss.status]}`}>
                        {isIssueLocked(iss) && <Lock size={8} className="mr-0.5" />}{iss.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">{iss.createdBy}</TableCell>
                    <TableCell className="text-xs">{iss.assignee}</TableCell>
                    <TableCell className="text-xs">{iss.approvedBy || "—"}</TableCell>
                    <TableCell>
                      <div className="flex gap-0.5">
                        <Button variant="ghost" size="icon" className="h-6 w-6" title="Root Cause" onClick={(e) => { e.stopPropagation(); setRootCauseIssue(iss); }}>
                          <Zap size={12} className="text-amber-500" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6" title={isIssueLocked(iss) ? "View" : "Edit"} onClick={(e) => { e.stopPropagation(); setDetailIssue(iss); setNewComment(""); }}>
                          {isIssueLocked(iss) ? <Eye size={12} className="text-muted-foreground" /> : <Edit size={12} className="text-primary" />}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredIssues.length === 0 && <TableRow><TableCell colSpan={9} className="text-center text-sm text-muted-foreground py-8">No issues found</TableCell></TableRow>}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Requirement Detail Dialog */}
      <Dialog open={!!detailReq} onOpenChange={() => setDetailReq(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {detailReq && (() => {
            const locked = isReqLocked(detailReq);
            return (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <span className="font-mono text-primary text-sm">{detailReq.id}</span>
                    {detailReq.title}
                    {locked && <Badge variant="outline" className="text-[9px] bg-green-500/15 text-green-700 gap-1"><Lock size={8} />Locked</Badge>}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Status</Label>
                      {locked ? (
                        <Badge variant="outline" className={`text-[10px] ${reqStatusColors[detailReq.status]}`}>{detailReq.status}</Badge>
                      ) : (
                        <Select value={detailReq.status} onValueChange={(v) => { updateRequirementStatus(detailReq.id, v as ReqStatus, "Current User"); setDetailReq({ ...detailReq, status: v as ReqStatus }); }}>
                          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>{(["Open", "In Progress", "Completed", "Deferred"] as ReqStatus[]).map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                        </Select>
                      )}
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Priority</Label>
                      {locked ? <PriorityBadge priority={detailReq.priority} /> : (
                        <Select value={detailReq.priority} onValueChange={(v) => { updateRequirementField(detailReq.id, "priority", v, "Current User"); setDetailReq({ ...detailReq, priority: v as Priority }); }}>
                          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>{(["High", "Medium", "Low"] as Priority[]).map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                        </Select>
                      )}
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Assignee</Label>
                      {locked ? <div className="text-sm p-1.5">{detailReq.assignee}</div> : (
                        <Select value={detailReq.assignee || "_"} onValueChange={(v) => { const val = v === "_" ? "" : v; updateRequirementField(detailReq.id, "assignee", val, "Current User"); setDetailReq({ ...detailReq, assignee: val }); }}>
                          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="_">-- Select --</SelectItem>
                            {users.filter((u) => u.status === "Active").map((u) => <SelectItem key={u.id} value={u.name.split(" ")[0] + " " + u.name.split(" ")[1]?.charAt(0) + "."}>{u.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div><span className="text-muted-foreground">Created By:</span> <span className="font-medium">{detailReq.createdBy}</span></div>
                    <div><span className="text-muted-foreground">Assigned By:</span> <span className="font-medium">{detailReq.assignedBy}</span></div>
                    <div><span className="text-muted-foreground">Approved By:</span> <span className="font-medium">{detailReq.approvedBy || "Pending"}</span></div>
                  </div>
                  <div>
                    <Label className="text-xs">Description</Label>
                    {locked ? <p className="text-sm text-muted-foreground mt-1">{detailReq.description}</p> : (
                      <Textarea value={detailReq.description} onChange={(e) => setDetailReq({ ...detailReq, description: e.target.value })} onBlur={() => updateRequirementField(detailReq.id, "description", detailReq.description, "Current User")} className="text-sm min-h-[60px] mt-1" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Linked: <Badge variant="outline" className="text-[9px]">{detailReq.linkedType}</Badge> {detailReq.linkedName}</span>
                    <span>· {detailReq.module}</span>
                    <span>· Due: {detailReq.dueDate || "Not set"}</span>
                  </div>

                  {/* Attachments */}
                  <div className="border-t pt-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-medium flex items-center gap-1"><Paperclip size={12} />Attachments ({detailReq.attachments.length})</Label>
                      {!locked && <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => handleAddAttachment("req", detailReq.id)}><Plus size={10} />Add File</Button>}
                    </div>
                    {detailReq.attachments.length > 0 ? (
                      <div className="space-y-1">
                        {detailReq.attachments.map((a) => (
                          <div key={a.id} className="flex items-center gap-2 p-2 rounded-md bg-muted/30 text-xs">
                            <Paperclip size={10} className="text-muted-foreground" />
                            <span className="font-medium">{a.name}</span>
                            <span className="text-muted-foreground">{a.size}</span>
                            <span className="text-muted-foreground ml-auto">by {a.uploadedBy}</span>
                          </div>
                        ))}
                      </div>
                    ) : <p className="text-xs text-muted-foreground text-center py-2">No attachments</p>}
                  </div>

                  {/* Comments */}
                  <div className="border-t pt-3 space-y-3">
                    <Label className="text-xs font-medium flex items-center gap-1"><MessageSquare size={12} />Comments ({detailReq.comments.length})</Label>
                    <div className="space-y-2 max-h-[200px] overflow-y-auto">
                      {detailReq.comments.map((c) => (
                        <div key={c.id} className="flex gap-2 p-2 rounded-md bg-muted/30">
                          <div className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center text-[9px] font-bold text-primary shrink-0">{c.user.charAt(0)}</div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2"><span className="text-xs font-medium">{c.user}</span><span className="text-[10px] text-muted-foreground">{new Date(c.timestamp).toLocaleDateString()}</span></div>
                            <p className="text-xs text-muted-foreground mt-0.5">{c.text}</p>
                          </div>
                        </div>
                      ))}
                      {detailReq.comments.length === 0 && <p className="text-xs text-muted-foreground text-center py-3">No comments yet</p>}
                    </div>
                    <div className="flex gap-2">
                      <Input value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Add a comment..." className="h-8 text-xs" onKeyDown={(e) => e.key === "Enter" && handleReqComment()} />
                      <Button size="sm" onClick={handleReqComment} className="h-8 px-3"><Send size={12} /></Button>
                    </div>
                  </div>

                  {/* History */}
                  <div className="border-t pt-3 space-y-2">
                    <Label className="text-xs font-medium flex items-center gap-1"><History size={12} />Change History</Label>
                    <div className="max-h-[150px] overflow-y-auto space-y-1.5">
                      {detailReq.history.length > 0 ? detailReq.history.slice().reverse().map((h) => (
                        <div key={h.id} className="flex items-center gap-2 p-2 rounded-md bg-muted/30 text-xs">
                          <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center text-[8px] font-bold text-primary">{h.user.charAt(0)}</div>
                          <span className="font-medium">{h.user}</span>
                          <span className="text-muted-foreground capitalize">{h.field}:</span>
                          {h.oldValue && <span className="line-through text-muted-foreground">{h.oldValue}</span>}
                          {h.oldValue && <span>→</span>}
                          <span className="font-medium">{h.newValue}</span>
                          <span className="text-[10px] text-muted-foreground ml-auto">{new Date(h.timestamp).toLocaleDateString()}</span>
                        </div>
                      )) : <p className="text-xs text-muted-foreground text-center py-3">No history</p>}
                    </div>
                  </div>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Issue Detail Dialog */}
      <Dialog open={!!detailIssue} onOpenChange={() => setDetailIssue(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {detailIssue && (() => {
            const locked = isIssueLocked(detailIssue);
            return (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <span className="font-mono text-destructive text-sm">{detailIssue.id}</span>
                    {detailIssue.title}
                    {locked && <Badge variant="outline" className="text-[9px] bg-green-500/15 text-green-700 gap-1"><Lock size={8} />Locked</Badge>}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Status</Label>
                      {locked ? (
                        <Badge variant="outline" className={`text-[10px] ${issStatusColors[detailIssue.status]}`}>{detailIssue.status}</Badge>
                      ) : (
                        <Select value={detailIssue.status} onValueChange={(v) => { updateIssueStatus(detailIssue.id, v as IssueStatus, "Current User"); setDetailIssue({ ...detailIssue, status: v as IssueStatus }); }}>
                          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>{(["Open", "In Progress", "Testing", "Resolved", "Closed", "Reopened"] as IssueStatus[]).map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                        </Select>
                      )}
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Severity</Label>
                      {locked ? <Badge variant="outline" className={`text-[10px] ${sevColors[detailIssue.severity]}`}>{detailIssue.severity}</Badge> : (
                        <Select value={detailIssue.severity} onValueChange={(v) => { updateIssueField(detailIssue.id, "severity", v, "Current User"); setDetailIssue({ ...detailIssue, severity: v as IssueSeverity }); }}>
                          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>{(["Critical", "High", "Medium", "Low"] as IssueSeverity[]).map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                        </Select>
                      )}
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Assignee</Label>
                      {locked ? <div className="text-sm p-1.5">{detailIssue.assignee}</div> : (
                        <Select value={detailIssue.assignee || "_"} onValueChange={(v) => { const val = v === "_" ? "" : v; updateIssueField(detailIssue.id, "assignee", val, "Current User"); setDetailIssue({ ...detailIssue, assignee: val }); }}>
                          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="_">-- Select --</SelectItem>
                            {users.filter((u) => u.status === "Active").map((u) => <SelectItem key={u.id} value={u.name.split(" ")[0] + " " + u.name.split(" ")[1]?.charAt(0) + "."}>{u.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-3 text-xs">
                    <div><span className="text-muted-foreground">Created By:</span> <span className="font-medium">{detailIssue.createdBy}</span></div>
                    <div><span className="text-muted-foreground">Reported By:</span> <span className="font-medium">{detailIssue.reportedBy}</span></div>
                    <div><span className="text-muted-foreground">Assigned By:</span> <span className="font-medium">{detailIssue.assignedBy}</span></div>
                    <div><span className="text-muted-foreground">Approved By:</span> <span className="font-medium">{detailIssue.approvedBy || "Pending"}</span></div>
                  </div>
                  <div>
                    <Label className="text-xs">Description</Label>
                    {locked ? <p className="text-sm text-muted-foreground mt-1">{detailIssue.description}</p> : (
                      <Textarea value={detailIssue.description} onChange={(e) => setDetailIssue({ ...detailIssue, description: e.target.value })} onBlur={() => updateIssueField(detailIssue.id, "description", detailIssue.description, "Current User")} className="text-sm min-h-[60px] mt-1" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Linked: <Badge variant="outline" className="text-[9px]">{detailIssue.linkedType}</Badge> {detailIssue.linkedName}</span>
                    <span>· {detailIssue.module}</span>
                    <span>· Due: {detailIssue.dueDate || "Not set"}</span>
                  </div>

                  {/* Attachments */}
                  <div className="border-t pt-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-medium flex items-center gap-1"><Paperclip size={12} />Attachments ({detailIssue.attachments.length})</Label>
                      {!locked && <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => handleAddAttachment("issue", detailIssue.id)}><Plus size={10} />Add File</Button>}
                    </div>
                    {detailIssue.attachments.length > 0 ? (
                      <div className="space-y-1">
                        {detailIssue.attachments.map((a) => (
                          <div key={a.id} className="flex items-center gap-2 p-2 rounded-md bg-muted/30 text-xs">
                            <Paperclip size={10} className="text-muted-foreground" />
                            <span className="font-medium">{a.name}</span>
                            <span className="text-muted-foreground">{a.size}</span>
                            <span className="text-muted-foreground ml-auto">by {a.uploadedBy}</span>
                          </div>
                        ))}
                      </div>
                    ) : <p className="text-xs text-muted-foreground text-center py-2">No attachments</p>}
                  </div>

                  {/* Comments */}
                  <div className="border-t pt-3 space-y-3">
                    <Label className="text-xs font-medium flex items-center gap-1"><MessageSquare size={12} />Comments ({detailIssue.comments.length})</Label>
                    <div className="space-y-2 max-h-[200px] overflow-y-auto">
                      {detailIssue.comments.map((c) => (
                        <div key={c.id} className="flex gap-2 p-2 rounded-md bg-muted/30">
                          <div className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center text-[9px] font-bold text-primary shrink-0">{c.user.charAt(0)}</div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2"><span className="text-xs font-medium">{c.user}</span><span className="text-[10px] text-muted-foreground">{new Date(c.timestamp).toLocaleDateString()}</span></div>
                            <p className="text-xs text-muted-foreground mt-0.5">{c.text}</p>
                          </div>
                        </div>
                      ))}
                      {detailIssue.comments.length === 0 && <p className="text-xs text-muted-foreground text-center py-3">No comments yet</p>}
                    </div>
                    <div className="flex gap-2">
                      <Input value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Add a comment..." className="h-8 text-xs" onKeyDown={(e) => e.key === "Enter" && handleIssueComment()} />
                      <Button size="sm" onClick={handleIssueComment} className="h-8 px-3"><Send size={12} /></Button>
                    </div>
                  </div>

                  {/* History */}
                  <div className="border-t pt-3 space-y-2">
                    <Label className="text-xs font-medium flex items-center gap-1"><History size={12} />Change History</Label>
                    <div className="max-h-[150px] overflow-y-auto space-y-1.5">
                      {detailIssue.history.length > 0 ? detailIssue.history.slice().reverse().map((h) => (
                        <div key={h.id} className="flex items-center gap-2 p-2 rounded-md bg-muted/30 text-xs">
                          <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center text-[8px] font-bold text-primary">{h.user.charAt(0)}</div>
                          <span className="font-medium">{h.user}</span>
                          <span className="text-muted-foreground capitalize">{h.field}:</span>
                          {h.oldValue && <span className="line-through text-muted-foreground">{h.oldValue}</span>}
                          {h.oldValue && <span>→</span>}
                          <span className="font-medium">{h.newValue}</span>
                          <span className="text-[10px] text-muted-foreground ml-auto">{new Date(h.timestamp).toLocaleDateString()}</span>
                        </div>
                      )) : <p className="text-xs text-muted-foreground text-center py-3">No history</p>}
                    </div>
                  </div>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Add Requirement Dialog */}
      <Dialog open={showAddReq} onOpenChange={setShowAddReq}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>New Requirement</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs">Title</Label>
              <Input value={newReq.title} onChange={(e) => setNewReq({ ...newReq, title: e.target.value })} className="h-9 text-sm" placeholder="Requirement title" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Linked Type</Label>
                <Select value={newReq.linkedType} onValueChange={(v) => setNewReq({ ...newReq, linkedType: v as LinkedType })}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>{LINKED_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Linked Name</Label>
                <Input value={newReq.linkedName} onChange={(e) => setNewReq({ ...newReq, linkedName: e.target.value })} className="h-9 text-sm" placeholder="e.g. Item Master Entry" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Module</Label>
                <Select value={newReq.module || "General"} onValueChange={(v) => setNewReq({ ...newReq, module: v })}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>{[...MODULES, "General"].map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Priority</Label>
                <Select value={newReq.priority} onValueChange={(v) => setNewReq({ ...newReq, priority: v as Priority })}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>{(["High", "Medium", "Low"] as Priority[]).map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Assignee</Label>
                <Select value={newReq.assignee || "_"} onValueChange={(v) => setNewReq({ ...newReq, assignee: v === "_" ? "" : v })}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select user" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_">-- Select --</SelectItem>
                    {users.filter((u) => u.status === "Active").map((u) => <SelectItem key={u.id} value={u.name.split(" ")[0] + " " + u.name.split(" ")[1]?.charAt(0) + "."}>{u.name} ({u.role})</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Description</Label>
              <Textarea value={newReq.description} onChange={(e) => setNewReq({ ...newReq, description: e.target.value })} className="text-sm min-h-[60px]" placeholder="Describe the requirement..." />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setShowAddReq(false)}>Cancel</Button>
              <Button onClick={handleAddReq} className="gap-1.5"><Plus size={14} />Add Requirement</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Issue Dialog */}
      <Dialog open={showAddIssue} onOpenChange={setShowAddIssue}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Report Issue</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs">Title</Label>
              <Input value={newIssue.title} onChange={(e) => setNewIssue({ ...newIssue, title: e.target.value })} className="h-9 text-sm" placeholder="Issue title" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Linked Type</Label>
                <Select value={newIssue.linkedType} onValueChange={(v) => setNewIssue({ ...newIssue, linkedType: v as LinkedType })}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>{LINKED_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Linked Name</Label>
                <Input value={newIssue.linkedName} onChange={(e) => setNewIssue({ ...newIssue, linkedName: e.target.value })} className="h-9 text-sm" placeholder="e.g. Sales Order Entry" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Module</Label>
                <Select value={newIssue.module || "General"} onValueChange={(v) => setNewIssue({ ...newIssue, module: v })}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>{[...MODULES, "General"].map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Severity</Label>
                <Select value={newIssue.severity} onValueChange={(v) => setNewIssue({ ...newIssue, severity: v as IssueSeverity })}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>{(["Critical", "High", "Medium", "Low"] as IssueSeverity[]).map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Assignee</Label>
                <Select value={newIssue.assignee || "_"} onValueChange={(v) => setNewIssue({ ...newIssue, assignee: v === "_" ? "" : v })}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select user" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_">-- Select --</SelectItem>
                    {users.filter((u) => u.status === "Active").map((u) => <SelectItem key={u.id} value={u.name.split(" ")[0] + " " + u.name.split(" ")[1]?.charAt(0) + "."}>{u.name} ({u.role})</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Reported By</Label>
              <Select value={newIssue.reportedBy || "_"} onValueChange={(v) => setNewIssue({ ...newIssue, reportedBy: v === "_" ? "" : v })}>
                <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select reporter" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="_">-- Select --</SelectItem>
                  {users.filter((u) => u.status === "Active").map((u) => <SelectItem key={u.id} value={u.name.split(" ")[0] + " " + u.name.split(" ")[1]?.charAt(0) + "."}>{u.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Description</Label>
              <Textarea value={newIssue.description} onChange={(e) => setNewIssue({ ...newIssue, description: e.target.value })} className="text-sm min-h-[60px]" placeholder="Describe the issue..." />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setShowAddIssue(false)}>Cancel</Button>
              <Button variant="destructive" onClick={handleAddIssue} className="gap-1.5"><AlertTriangle size={14} />Report Issue</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <RootCauseAnalysis issue={rootCauseIssue} open={!!rootCauseIssue} onOpenChange={() => setRootCauseIssue(null)} />
    </div>
  );
}
