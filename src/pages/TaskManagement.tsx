import { useState } from "react";
import { useTaskStore, type TaskStatus, type Task } from "@/data/tasks-store";
import type { Priority, ERPModule } from "@/data/mock-data";
import type { LinkedType } from "@/data/issues-requirements-store";
import { MODULES } from "@/data/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Plus, Search, CheckSquare, Clock, AlertTriangle, Ban, ListChecks, MessageSquare, Send, Calendar } from "lucide-react";

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
  const { tasks, addTask, updateTaskStatus, addComment, removeTask } = useTaskStore();
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
    setNewComment("");
    setDetailTask({ ...detailTask, comments: [...detailTask.comments, { id: "temp", user: "Current User", text: newComment, timestamp: new Date().toISOString() }] });
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

      {/* KPI Cards */}
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

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search tasks..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9 text-sm" />
        </div>
        <Select value={moduleFilter} onValueChange={setModuleFilter}>
          <SelectTrigger className="w-[140px] h-9 text-sm"><SelectValue placeholder="Module" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Modules</SelectItem>
            {MODULES.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[130px] h-9 text-sm"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
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
                  <TableHead className="text-[11px] w-[90px]">Linked To</TableHead>
                  <TableHead className="text-[11px] w-[70px]">Priority</TableHead>
                  <TableHead className="text-[11px] w-[90px]">Status</TableHead>
                  <TableHead className="text-[11px] w-[80px]">Assignee</TableHead>
                  <TableHead className="text-[11px] w-[80px]">Due Date</TableHead>
                  <TableHead className="text-[11px] w-[100px]">Tags</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((task) => (
                  <TableRow key={task.id} className="cursor-pointer hover:bg-muted/30" onClick={() => setDetailTask(task)}>
                    <TableCell className="font-mono text-xs text-primary">{task.id}</TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">{task.title}</div>
                      <div className="text-xs text-muted-foreground line-clamp-1">{task.description}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs">{task.linkedName || "—"}</div>
                      <Badge variant="outline" className="text-[9px] mt-0.5">{task.linkedType}</Badge>
                    </TableCell>
                    <TableCell><PriorityBadge priority={task.priority} /></TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[10px] ${statusColors[task.status]}`}>{task.status}</Badge>
                    </TableCell>
                    <TableCell className="text-xs">{task.assignee}</TableCell>
                    <TableCell className={`text-xs ${task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "Done" ? "text-destructive font-medium" : "text-muted-foreground"}`}>
                      {task.dueDate || "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-0.5">
                        {task.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-[9px] px-1">{tag}</Badge>
                        ))}
                        {task.tags.length > 2 && <span className="text-[9px] text-muted-foreground">+{task.tags.length - 2}</span>}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow><TableCell colSpan={8} className="text-center text-sm text-muted-foreground py-8">No tasks found</TableCell></TableRow>
                )}
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
                      <Card key={task.id} className="border shadow-sm cursor-pointer hover:shadow-md transition-shadow" onClick={() => setDetailTask(task)}>
                        <CardContent className="p-3 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[10px] text-primary">{task.id}</span>
                            <PriorityBadge priority={task.priority} />
                          </div>
                          <div className="text-xs font-medium leading-snug">{task.title}</div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-muted-foreground">{task.assignee}</span>
                            {task.comments.length > 0 && (
                              <div className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                                <MessageSquare size={10} />{task.comments.length}
                              </div>
                            )}
                          </div>
                          {task.tags.length > 0 && (
                            <div className="flex flex-wrap gap-0.5">
                              {task.tags.slice(0, 2).map((tag) => <Badge key={tag} variant="secondary" className="text-[8px] px-1 py-0">{tag}</Badge>)}
                            </div>
                          )}
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
          {detailTask && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <span className="font-mono text-primary text-sm">{detailTask.id}</span>
                  {detailTask.title}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Status</Label>
                    <Select value={detailTask.status} onValueChange={(v) => { updateTaskStatus(detailTask.id, v as TaskStatus); setDetailTask({ ...detailTask, status: v as TaskStatus }); }}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Assignee</Label>
                    <div className="text-sm p-1.5">{detailTask.assignee}</div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Due Date</Label>
                    <div className={`text-sm p-1.5 ${detailTask.dueDate && new Date(detailTask.dueDate) < new Date() && detailTask.status !== "Done" ? "text-destructive font-medium" : ""}`}>
                      {detailTask.dueDate || "Not set"}
                    </div>
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Description</Label>
                  <p className="text-sm text-muted-foreground mt-1">{detailTask.description}</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>Linked: <Badge variant="outline" className="text-[9px]">{detailTask.linkedType}</Badge> {detailTask.linkedName}</span>
                  <span>· {detailTask.module}</span>
                  <span>· Assigned by {detailTask.assignedBy}</span>
                </div>
                {detailTask.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {detailTask.tags.map((tag) => <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>)}
                  </div>
                )}

                {/* Comments */}
                <div className="border-t pt-3 space-y-3">
                  <Label className="text-xs font-medium">Comments ({detailTask.comments.length})</Label>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {detailTask.comments.map((c) => (
                      <div key={c.id} className="flex gap-2 p-2 rounded-md bg-muted/30">
                        <div className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center text-[9px] font-bold text-primary shrink-0">
                          {c.user.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium">{c.user}</span>
                            <span className="text-[10px] text-muted-foreground">{new Date(c.timestamp).toLocaleDateString()}</span>
                          </div>
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
          )}
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
                <Input value={newTask.assignee} onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })} className="h-8 text-xs" placeholder="Name" />
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
              <Label className="text-xs">Tags</Label>
              <div className="flex gap-2">
                <Input value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())} className="h-8 text-xs" placeholder="Add tag & press Enter" />
                <Button size="sm" variant="outline" onClick={handleAddTag} className="h-8 text-xs">Add</Button>
              </div>
              {newTask.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {newTask.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs cursor-pointer" onClick={() => setNewTask({ ...newTask, tags: newTask.tags.filter((t) => t !== tag) })}>
                      {tag} ×
                    </Badge>
                  ))}
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
