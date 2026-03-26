import { useState } from "react";
import { useTaskStore, type TaskStatus, type Task } from "@/data/tasks-store";
import type { Priority, ERPModule } from "@/data/mock-data";
import type { LinkedType } from "@/data/issues-requirements-store";
import { useUsersStore } from "@/data/users-store";
import { MODULES } from "@/data/mock-data";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PriorityBadge } from "@/components/StatusBadge";
import { Plus, Search, CheckSquare, Clock, AlertTriangle, Ban, ListChecks, MessageSquare, Send, Calendar, Lock, Eye, Edit, Paperclip } from "lucide-react";

const statusColors: Record<TaskStatus, string> = {
  Todo: "bg-blue-500/15 text-blue-700 border-blue-200",
  "In Progress": "bg-amber-500/15 text-amber-700 border-amber-200",
  Testing: "bg-violet-500/15 text-violet-700 border-violet-200",
  Done: "bg-green-500/15 text-green-700 border-green-200",
  Blocked: "bg-red-500/15 text-red-700 border-red-200",
};
const statusIcons: Record<TaskStatus, typeof Clock> = {
  Todo: ListChecks, "In Progress": Clock, Testing: AlertTriangle, Done: CheckSquare, Blocked: Ban,
};
const STATUSES: TaskStatus[] = ["Todo", "In Progress", "Testing", "Done", "Blocked"];

export default function TaskManagement() {
  const { tasks, addTask, updateTaskStatus, updateTaskField, addComment, addAttachment } = useTaskStore();
  const { users } = useUsersStore();
  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAdd, setShowAdd] = useState(false);
  const [detailTask, setDetailTask] = useState<Task | null>(null);
  const [newComment, setNewComment] = useState("");
  const [newTask, setNewTask] = useState({ title: "", description: "", priority: "Medium" as Priority, assignee: "", assignedBy: "", linkedType: "General" as LinkedType, linkedId: "", linkedName: "", module: "" as string, dueDate: "", tags: [] as string[], status: "Todo" as TaskStatus });
  const [tagInput, setTagInput] = useState("");

  const filtered = tasks.filter((t) => {
    const ms = !search || t.title.toLowerCase().includes(search.toLowerCase()) || t.id.toLowerCase().includes(search.toLowerCase());
    const mm = moduleFilter === "all" || t.module === moduleFilter;
    const mst = statusFilter === "all" || t.status === statusFilter;
    return ms && mm && mst;
  });

  const counts = STATUSES.reduce((a, s) => ({ ...a, [s]: tasks.filter((t) => t.status === s).length }), {} as Record<string, number>);
  const overdue = tasks.filter((t) => t.status !== "Done" && t.dueDate && new Date(t.dueDate) < new Date()).length;

  const isLocked = (t: Task) => t.status === "Done";

  const handleAdd = () => {
    if (!newTask.title.trim()) return;
    addTask(newTask);
    setNewTask({ title: "", description: "", priority: "Medium", assignee: "", assignedBy: "", linkedType: "General", linkedId: "", linkedName: "", module: "", dueDate: "", tags: [], status: "Todo" });
    setShowAdd(false);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !newTask.tags.includes(tagInput.trim())) {
      setNewTask({ ...newTask, tags: [...newTask.tags, tagInput.trim()] });
      setTagInput("");
    }
  };

  const handleSendComment = () => {
    if (!newComment.trim() || !detailTask) return;
    addComment(detailTask.id, "Current User", newComment);
    setDetailTask({ ...detailTask, comments: [...detailTask.comments, { id: "temp", user: "Current User", text: newComment, timestamp: new Date().toISOString() }] });
    setNewComment("");
  };

  const handleAddAttachment = () => {
    if (!detailTask) return;
    const input = document.createElement("input");
    input.type = "file";
    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const att = { name: file.name, type: file.type || "file", size: `${(file.size / 1024).toFixed(1)} KB`, uploadedBy: "Current User", uploadedAt: new Date().toISOString() };
      addAttachment(detailTask.id, att);
      setDetailTask({ ...detailTask, attachments: [...detailTask.attachments, { ...att, id: "temp" }] });
    };
    input.click();
  };

  return (
    <div className="p-6 space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Task Management</h1>
          <p className="text-sm text-muted-foreground">Track project tasks linked to ERP forms, reports, and modules</p>
        </div>
        <Button size="sm" onClick={() => setShowAdd(true)} className="gap-1.5"><Plus size={14} />New Task</Button>
      </div>

      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {STATUSES.map((s) => {
          const Icon = statusIcons[s];
          return (
            <Card key={s} className="border shadow-sm cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStatusFilter(statusFilter === s ? "all" : s)}>
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-1"><Icon size={14} className="text-muted-foreground" /></div>
                <div className="text-xl font-bold text-foreground">{counts[s] || 0}</div>
                <div className="text-[10px] text-muted-foreground">{s}</div>
              </CardContent>
            </Card>
          );
        })}
        <Card className="border shadow-sm border-destructive/30">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-1"><Calendar size={14} className="text-destructive" /></div>
            <div className="text-xl font-bold text-destructive">{overdue}</div>
            <div className="text-[10px] text-muted-foreground">Overdue</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search tasks..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9 text-sm" />
        </div>
        <Select value={moduleFilter} onValueChange={setModuleFilter}>
          <SelectTrigger className="w-[140px] h-9 text-sm"><SelectValue placeholder="Module" /></SelectTrigger>
          <SelectContent><SelectItem value="all">All Modules</SelectItem>{MODULES.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[130px] h-9 text-sm"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent><SelectItem value="all">All Status</SelectItem>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="list">
        <TabsList>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="board">Board View</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-3">
          <div className="border rounded-lg overflow-auto bg-card shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="text-[11px] w-[75px]">ID</TableHead>
                  <TableHead className="text-[11px]">Task</TableHead>
                  <TableHead className="text-[11px] w-[70px]">Priority</TableHead>
                  <TableHead className="text-[11px] w-[90px]">Status</TableHead>
                  <TableHead className="text-[11px] w-[80px]">Created By</TableHead>
                  <TableHead className="text-[11px] w-[80px]">Assign To</TableHead>
                  <TableHead className="text-[11px] w-[80px]">Approved By</TableHead>
                  <TableHead className="text-[11px] w-[80px]">Due Date</TableHead>
                  <TableHead className="text-[11px] w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((task) => (
                  <TableRow key={task.id} className="cursor-pointer hover:bg-muted/30" onClick={() => { setDetailTask(task); setNewComment(""); }}>
                    <TableCell className="font-mono text-xs text-primary">{task.id}</TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">{task.title}</div>
                      <div className="text-xs text-muted-foreground line-clamp-1">{task.module} · {task.linkedName || "—"}</div>
                    </TableCell>
                    <TableCell><PriorityBadge priority={task.priority} /></TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[10px] ${statusColors[task.status]}`}>
                        {isLocked(task) && <Lock size={8} className="mr-0.5" />}{task.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">{task.createdBy}</TableCell>
                    <TableCell className="text-xs">{task.assignee}</TableCell>
                    <TableCell className="text-xs">{task.approvedBy || "—"}</TableCell>
                    <TableCell className={`text-xs ${task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "Done" ? "text-destructive font-medium" : "text-muted-foreground"}`}>
                      {task.dueDate || "—"}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-6 w-6" title={isLocked(task) ? "View" : "Edit"} onClick={(e) => { e.stopPropagation(); setDetailTask(task); setNewComment(""); }}>
                        {isLocked(task) ? <Eye size={12} className="text-muted-foreground" /> : <Edit size={12} className="text-primary" />}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && <TableRow><TableCell colSpan={9} className="text-center text-sm text-muted-foreground py-8">No tasks found</TableCell></TableRow>}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="board" className="mt-3">
          <div className="grid grid-cols-5 gap-3">
            {STATUSES.map((status) => {
              const col = filtered.filter((t) => t.status === status);
              return (
                <div key={status} className="space-y-2">
                  <div className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-muted/50">
                    <Badge variant="outline" className={`text-[10px] ${statusColors[status]}`}>{status}</Badge>
                    <span className="text-xs text-muted-foreground ml-auto">{col.length}</span>
                  </div>
                  <div className="space-y-2 min-h-[200px]">
                    {col.map((task) => (
                      <Card key={task.id} className="border shadow-sm cursor-pointer hover:shadow-md transition-shadow" onClick={() => { setDetailTask(task); setNewComment(""); }}>
                        <CardContent className="p-3 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[10px] text-primary">{task.id}</span>
                            <PriorityBadge priority={task.priority} />
                          </div>
                          <div className="text-xs font-medium leading-snug">{task.title}</div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-muted-foreground">{task.assignee}</span>
                            {task.comments.length > 0 && <div className="flex items-center gap-0.5 text-[10px] text-muted-foreground"><MessageSquare size={10} />{task.comments.length}</div>}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Task Detail Dialog */}
      <Dialog open={!!detailTask} onOpenChange={() => setDetailTask(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {detailTask && (() => {
            const locked = isLocked(detailTask);
            return (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <span className="font-mono text-primary text-sm">{detailTask.id}</span>
                    {detailTask.title}
                    {locked && <Badge variant="outline" className="text-[9px] bg-green-500/15 text-green-700 gap-1"><Lock size={8} />Locked</Badge>}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Status</Label>
                      {locked ? (
                        <Badge variant="outline" className={`text-[10px] ${statusColors[detailTask.status]}`}>{detailTask.status}</Badge>
                      ) : (
                        <Select value={detailTask.status} onValueChange={(v) => { updateTaskStatus(detailTask.id, v as TaskStatus); setDetailTask({ ...detailTask, status: v as TaskStatus }); }}>
                          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                        </Select>
                      )}
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Priority</Label>
                      {locked ? <PriorityBadge priority={detailTask.priority} /> : (
                        <Select value={detailTask.priority} onValueChange={(v) => { updateTaskField(detailTask.id, "priority", v); setDetailTask({ ...detailTask, priority: v as Priority }); }}>
                          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>{(["High", "Medium", "Low"] as Priority[]).map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                        </Select>
                      )}
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Assignee</Label>
                      {locked ? <div className="text-sm p-1.5">{detailTask.assignee}</div> : (
                        <Select value={detailTask.assignee || "_"} onValueChange={(v) => { const val = v === "_" ? "" : v; updateTaskField(detailTask.id, "assignee", val); setDetailTask({ ...detailTask, assignee: val }); }}>
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
                    <div><span className="text-muted-foreground">Created By:</span> <span className="font-medium">{detailTask.createdBy}</span></div>
                    <div><span className="text-muted-foreground">Assigned By:</span> <span className="font-medium">{detailTask.assignedBy}</span></div>
                    <div><span className="text-muted-foreground">Approved By:</span> <span className="font-medium">{detailTask.approvedBy || "Pending"}</span></div>
                    <div className={detailTask.dueDate && new Date(detailTask.dueDate) < new Date() && !locked ? "text-destructive" : ""}>
                      <span className="text-muted-foreground">Due:</span> <span className="font-medium">{detailTask.dueDate || "Not set"}</span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">Description</Label>
                    {locked ? <p className="text-sm text-muted-foreground mt-1">{detailTask.description}</p> : (
                      <Textarea value={detailTask.description} onChange={(e) => setDetailTask({ ...detailTask, description: e.target.value })} onBlur={() => updateTaskField(detailTask.id, "description", detailTask.description)} className="text-sm min-h-[60px] mt-1" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Linked: <Badge variant="outline" className="text-[9px]">{detailTask.linkedType}</Badge> {detailTask.linkedName}</span>
                    <span>· {detailTask.module}</span>
                  </div>
                  {detailTask.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {detailTask.tags.map((tag) => <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>)}
                    </div>
                  )}

                  {/* Attachments */}
                  <div className="border-t pt-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-medium flex items-center gap-1"><Paperclip size={12} />Attachments ({detailTask.attachments.length})</Label>
                      {!locked && <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={handleAddAttachment}><Plus size={10} />Add File</Button>}
                    </div>
                    {detailTask.attachments.length > 0 ? (
                      <div className="space-y-1">
                        {detailTask.attachments.map((a) => (
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
                    <Label className="text-xs font-medium flex items-center gap-1"><MessageSquare size={12} />Comments ({detailTask.comments.length})</Label>
                    <div className="space-y-2 max-h-[200px] overflow-y-auto">
                      {detailTask.comments.map((c) => (
                        <div key={c.id} className="flex gap-2 p-2 rounded-md bg-muted/30">
                          <div className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center text-[9px] font-bold text-primary shrink-0">{c.user.charAt(0)}</div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2"><span className="text-xs font-medium">{c.user}</span><span className="text-[10px] text-muted-foreground">{new Date(c.timestamp).toLocaleDateString()}</span></div>
                            <p className="text-xs text-muted-foreground mt-0.5">{c.text}</p>
                          </div>
                        </div>
                      ))}
                      {detailTask.comments.length === 0 && <p className="text-xs text-muted-foreground text-center py-3">No comments yet</p>}
                    </div>
                    <div className="flex gap-2">
                      <Input value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Add a comment..." className="h-8 text-xs" onKeyDown={(e) => e.key === "Enter" && handleSendComment()} />
                      <Button size="sm" onClick={handleSendComment} className="h-8 px-3"><Send size={12} /></Button>
                    </div>
                  </div>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Add Task Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Create New Task</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs">Title</Label>
              <Input value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} className="h-9 text-sm" placeholder="Task title" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Description</Label>
              <Textarea value={newTask.description} onChange={(e) => setNewTask({ ...newTask, description: e.target.value })} className="text-sm min-h-[60px]" placeholder="Describe the task..." />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Priority</Label>
                <Select value={newTask.priority} onValueChange={(v) => setNewTask({ ...newTask, priority: v as Priority })}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>{(["High", "Medium", "Low"] as Priority[]).map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Assignee</Label>
                <Select value={newTask.assignee || "_"} onValueChange={(v) => setNewTask({ ...newTask, assignee: v === "_" ? "" : v })}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_">-- Select --</SelectItem>
                    {users.filter((u) => u.status === "Active").map((u) => <SelectItem key={u.id} value={u.name.split(" ")[0] + " " + u.name.split(" ")[1]?.charAt(0) + "."}>{u.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Due Date</Label>
                <Input type="date" value={newTask.dueDate} onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })} className="h-8 text-xs" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Module</Label>
                <Select value={newTask.module} onValueChange={(v) => setNewTask({ ...newTask, module: v })}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{MODULES.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Linked Type</Label>
                <Select value={newTask.linkedType} onValueChange={(v) => setNewTask({ ...newTask, linkedType: v as LinkedType })}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>{(["Form", "Report", "Module", "General"] as LinkedType[]).map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Linked Name</Label>
              <Input value={newTask.linkedName} onChange={(e) => setNewTask({ ...newTask, linkedName: e.target.value })} className="h-8 text-xs" placeholder="e.g. Sales Order Entry" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Tags</Label>
              <div className="flex gap-2">
                <Input value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())} className="h-8 text-xs" placeholder="Add tag & press Enter" />
                <Button size="sm" variant="outline" onClick={handleAddTag} className="h-8 text-xs">Add</Button>
              </div>
              {newTask.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {newTask.tags.map((tag) => <Badge key={tag} variant="secondary" className="text-xs cursor-pointer" onClick={() => setNewTask({ ...newTask, tags: newTask.tags.filter((t) => t !== tag) })}>{tag} ×</Badge>)}
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setShowAdd(false)}>Cancel</Button>
              <Button size="sm" onClick={handleAdd} className="gap-1"><Plus size={12} />Create Task</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
