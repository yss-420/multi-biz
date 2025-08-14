import { useEffect, useMemo, useState } from "react";
import { useData, Task } from "@/context/DataContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Trash2, Pencil, Calendar as CalendarIcon, ChevronDown } from "lucide-react";
import { useAi } from "@/context/AiContext";
export default function TasksPage() {
  const { tasksForSelected, addTask, removeTask, currentBusiness, updateTask } = useData();
  const { generateTasksFromGoal, refineTask, splitTask } = useAi();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Task["priority"]>("medium");
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [showMore, setShowMore] = useState<{ todo: boolean; inprogress: boolean; completed: boolean }>({
    todo: false,
    inprogress: false,
    completed: false,
  });
  const [editOpen, setEditOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPriority, setEditPriority] = useState<Task["priority"]>("medium");
  const [editDueDate, setEditDueDate] = useState<Date | undefined>(undefined);
  const [editStatus, setEditStatus] = useState<Task["status"]>("todo");
  const [assistOpen, setAssistOpen] = useState(false);
  const [assistGoal, setAssistGoal] = useState("");

  useEffect(() => {
    document.title = `Tasks – ${currentBusiness?.name ?? "MultiBiz"}`;
  }, [currentBusiness?.name]);

  const submit = () => {
    if (!title.trim() || !currentBusiness) return;
    const t: Omit<Task, "id"> = {
      businessId: currentBusiness.id,
      title,
      description,
      completed: false,
      priority: priority as any,
      status: "todo",
      dueDate: dueDate ? dueDate.toISOString() : undefined,
    };
    addTask(t);
    setTitle("");
    setDescription("");
    setPriority("medium");
    setDueDate(undefined);
    setOpen(false);
  };

  const groups = useMemo(() => {
    const normalize = (t: Task) => ({ ...t, status: t.completed ? "completed" : t.status ?? "todo" });
    const all = tasksForSelected.map(normalize);
    return {
      todo: all.filter((t) => t.status === "todo"),
      inprogress: all.filter((t) => t.status === "in-progress"),
      completed: all.filter((t) => t.status === "completed"),
    };
  }, [tasksForSelected]);

  const priorityCls = (p: Task["priority"]) =>
    p === "high" ? "bg-destructive text-destructive-foreground" : p === "medium" ? "bg-warning text-warning-foreground" : "bg-success text-success-foreground";

  const changeStatus = (id: string, status: Task["status"]) => {
    updateTask(id, { status, completed: status === "completed" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Tasks</h1>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setAssistOpen(true)}>AI Assist</Button>
          <Button onClick={() => setOpen(true)}>Create Task</Button>
        </div>
      </div>

      {/* Sections instead of tabs */}
      <section aria-labelledby="todo-heading">
        <Card className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 id="todo-heading" className="font-semibold">To Do</h2>
            {groups.todo.length > 5 && (
              <Button variant="ghost" size="sm" onClick={() => setShowMore((s) => ({ ...s, todo: !s.todo }))}>
                {showMore.todo ? "Show less" : `Show ${groups.todo.length - 5} more`}
                <ChevronDown className={`ml-1 h-4 w-4 transition-transform ${showMore.todo ? "rotate-180" : "rotate-0"}`} />
              </Button>
            )}
          </div>
          {(showMore.todo ? groups.todo : groups.todo.slice(0, 5)).map((t) => (
            <Card key={t.id} className="p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  <button className="text-left flex-1" onClick={() => setExpanded((e) => ({ ...e, [t.id]: !e[t.id] }))}>
                    <div className={`font-medium flex items-center gap-2 ${t.completed ? "line-through text-muted-foreground" : ""}`}>
                      {t.title}
                      <span className={`px-2 py-0.5 rounded text-xs capitalize ${priorityCls(t.priority)}`}>{t.priority}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                      {t.dueDate && <span>Due {format(new Date(t.dueDate), "PPP")}</span>}
                    </div>
                    {expanded[t.id] && t.description && (
                      <div className="text-sm text-muted-foreground mt-2">{t.description}</div>
                    )}
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => changeStatus(t.id, "in-progress")}
                    aria-label="Begin task"
                  >
                    Begin
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditTask(t);
                      setEditTitle(t.title);
                      setEditDescription(t.description || "");
                      setEditPriority(t.priority);
                      setEditDueDate(t.dueDate ? new Date(t.dueDate) : undefined);
                      setEditStatus(t.status ?? "todo");
                      setEditOpen(true);
                    }}
                    aria-label="Edit task"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => removeTask(t.id)} aria-label="Delete task">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
{groups.todo.length === 0 && (
  <div className="flex items-center justify-center py-4">
    <Button onClick={() => setOpen(true)}>Start new task</Button>
  </div>
)}
        </Card>
      </section>

      <section aria-labelledby="inprogress-heading">
        <Card className="p-4 space-y-3 mt-6">
          <div className="flex items-center justify-between">
            <h2 id="inprogress-heading" className="font-semibold">In Progress</h2>
            {groups.inprogress.length > 5 && (
              <Button variant="ghost" size="sm" onClick={() => setShowMore((s) => ({ ...s, inprogress: !s.inprogress }))}>
                {showMore.inprogress ? "Show less" : `Show ${groups.inprogress.length - 5} more`}
                <ChevronDown className={`ml-1 h-4 w-4 transition-transform ${showMore.inprogress ? "rotate-180" : "rotate-0"}`} />
              </Button>
            )}
          </div>
          {(showMore.inprogress ? groups.inprogress : groups.inprogress.slice(0, 5)).map((t) => (
            <Card key={t.id} className="p-3 flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div>
                  <button className="text-left" onClick={() => setExpanded((e) => ({ ...e, [t.id]: !e[t.id] }))}>
                    <div className={`font-medium flex items-center gap-2 ${t.completed ? "line-through text-muted-foreground" : ""}`}>{t.title}<span className={`px-2 py-0.5 rounded text-xs capitalize ${priorityCls(t.priority)}`}>{t.priority}</span></div>
                    <div className="text-xs text-muted-foreground mt-1">{t.dueDate ? `Due ${format(new Date(t.dueDate), "PPP")}` : ""}</div>
                    {expanded[t.id] && t.description && (
                      <div className="text-sm text-muted-foreground mt-2">{t.description}</div>
                    )}
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => changeStatus(t.id, "completed")}
                  aria-label="Finish task"
                >
                  Finish
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setEditTask(t);
                    setEditTitle(t.title);
                    setEditDescription(t.description || "");
                    setEditPriority(t.priority);
                    setEditDueDate(t.dueDate ? new Date(t.dueDate) : undefined);
                    setEditStatus(t.status ?? "in-progress");
                    setEditOpen(true);
                  }}
                  aria-label="Edit task"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => removeTask(t.id)} aria-label="Delete task">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </Card>
          ))}
          {groups.inprogress.length === 0 && <div className="text-muted-foreground text-sm">Nothing here.</div>}
        </Card>
      </section>

      <section aria-labelledby="completed-heading">
        <Card className="p-4 space-y-3 mt-6">
          <div className="flex items-center justify-between">
            <h2 id="completed-heading" className="font-semibold">Completed</h2>
            {groups.completed.length > 5 && (
              <Button variant="ghost" size="sm" onClick={() => setShowMore((s) => ({ ...s, completed: !s.completed }))}>
                {showMore.completed ? "Show less" : `Show ${groups.completed.length - 5} more`}
                <ChevronDown className={`ml-1 h-4 w-4 transition-transform ${showMore.completed ? "rotate-180" : "rotate-0"}`} />
              </Button>
            )}
          </div>
          {(showMore.completed ? groups.completed : groups.completed.slice(0, 5)).map((t) => (
            <Card key={t.id} className="p-3 flex items-start justify-between gap-3 opacity-90">
              <div>
                <button className="text-left" onClick={() => setExpanded((e) => ({ ...e, [t.id]: !e[t.id] }))}>
                  <div className="font-medium flex items-center gap-2 line-through text-muted-foreground">
                    {t.title}
                    <Badge variant="secondary">Completed</Badge>
                    <span className={`px-2 py-0.5 rounded text-xs capitalize ${priorityCls(t.priority)}`}>{t.priority}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{t.dueDate ? `Due ${format(new Date(t.dueDate), "PPP")}` : ""}</div>
                  {expanded[t.id] && t.description && (
                    <div className="text-sm text-muted-foreground mt-2">{t.description}</div>
                  )}
                </button>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setEditTask(t);
                    setEditTitle(t.title);
                    setEditDescription(t.description || "");
                    setEditPriority(t.priority);
                    setEditDueDate(t.dueDate ? new Date(t.dueDate) : undefined);
                    setEditStatus(t.status ?? "completed");
                    setEditOpen(true);
                  }}
                  aria-label="Edit task"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => removeTask(t.id)} aria-label="Delete task">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </Card>
          ))}
          {groups.completed.length === 0 && <div className="text-muted-foreground text-sm">No completed tasks.</div>}
        </Card>
      </section>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid gap-1">
              <Label>Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Task title" />
            </div>
            <div className="grid gap-1">
              <Label>Description</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Details" />
            </div>
            <div className="grid gap-1">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as Task["priority"])}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1">
              <Label>Due date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={`w-[240px] justify-start text-left font-normal ${!dueDate ? "text-muted-foreground" : ""}`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={submit}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid gap-1">
              <Label>Title</Label>
              <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
            </div>
            <div className="grid gap-1">
              <Label>Description</Label>
              <Textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
            </div>
            <div className="grid gap-1">
              <Label>Priority</Label>
              <Select value={editPriority} onValueChange={(v) => setEditPriority(v as Task["priority"]) }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1">
              <Label>Status</Label>
              <Select value={editStatus} onValueChange={(v) => setEditStatus(v as Task["status"]) }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1">
              <Label>Due date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={`w-[240px] justify-start text-left font-normal ${!editDueDate ? "text-muted-foreground" : ""}`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {editDueDate ? format(editDueDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={editDueDate}
                    onSelect={setEditDueDate}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button
              onClick={() => {
                if (!editTask) return;
                updateTask(editTask.id, {
                  title: editTitle,
                  description: editDescription,
                  priority: editPriority,
                  status: editStatus,
                  completed: editStatus === "completed",
                  dueDate: editDueDate ? editDueDate.toISOString() : undefined,
                });
                setEditOpen(false);
              }}
            >
              Save
            </Button>
            <Button
              variant="ghost"
              onClick={async () => {
                if (!editTask) return;
                const refined = await refineTask(editTitle, editDescription);
                if (refined.title || refined.description) {
                  setEditTitle(refined.title || editTitle);
                  setEditDescription(refined.description ?? editDescription);
                } else {
                  // minimal user feedback
                  alert("AI couldn't refine this task. Try rephrasing your title/description.");
                }
              }}
            >
              AI Refine
            </Button>
            <Button
              variant="ghost"
              onClick={async () => {
                if (!editTask) return;
                const subs = await splitTask(editTitle, editDescription);
                // For now, append subtasks as separate tasks with the same business
                if (currentBusiness && subs && subs.length) {
                  subs.forEach((st) => {
                    addTask({
                      businessId: currentBusiness.id,
                      title: st.title,
                      description: st.description,
                      priority: (st.priority as any) || "medium",
                      completed: false,
                      status: "todo",
                      dueDate: st.dueDate,
                    });
                  });
                } else {
                  alert("AI couldn't produce subtasks. Try again with a clearer title/description.");
                }
              }}
            >
              Split into subtasks
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={assistOpen} onOpenChange={setAssistOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>AI Assist: Suggest tasks</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid gap-1">
              <Label>Goal</Label>
              <Input value={assistGoal} onChange={(e) => setAssistGoal(e.target.value)} placeholder="e.g., Ship onboarding flow" />
            </div>
            <div className="text-xs text-muted-foreground">The assistant will suggest concise tasks. You can copy and add them manually for now.</div>
          </div>
          <DialogFooter>
                <Button
              onClick={async () => {
                if (!assistGoal.trim()) return;
                const res = await generateTasksFromGoal(assistGoal.trim());
                // Optional: we could immediately offer to apply; for now it goes to chat and can be copied.
                setAssistOpen(false);
              }}
            >
              Ask AI
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Quick AI actions inside edit dialog footer */}
      {editOpen && editTask && (
        <div className="hidden" />
      )}
    </div>
  );
}
