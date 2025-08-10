import { useEffect, useMemo, useState } from "react";
import { useData, Task } from "@/context/DataContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function TasksPage() {
  const { tasksForSelected, addTask, toggleTask, removeTask, currentBusiness } = useData();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");

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
    };
    addTask(t);
    setTitle("");
    setDescription("");
    setPriority("medium");
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Tasks</h1>
        <Button onClick={() => setOpen(true)}>Create Task</Button>
      </div>

      <div className="grid md:grid-cols-3 gap-3">
        <Card className="p-4 space-y-2">
          <div className="font-semibold">To Do</div>
          {groups.todo.map((t) => (
            <Card key={t.id} className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Checkbox checked={t.completed} onCheckedChange={() => toggleTask(t.id)} />
                <div>{t.title}</div>
              </div>
              <Button variant="secondary" size="sm" onClick={() => removeTask(t.id)}>Delete</Button>
            </Card>
          ))}
          {groups.todo.length === 0 && <div className="text-muted-foreground text-sm">No tasks.</div>}
        </Card>

        <Card className="p-4 space-y-2">
          <div className="font-semibold">In Progress</div>
          {groups.inprogress.map((t) => (
            <Card key={t.id} className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Checkbox checked={t.completed} onCheckedChange={() => toggleTask(t.id)} />
                <div>{t.title}</div>
              </div>
              <Button variant="secondary" size="sm" onClick={() => removeTask(t.id)}>Delete</Button>
            </Card>
          ))}
          {groups.inprogress.length === 0 && <div className="text-muted-foreground text-sm">Nothing here.</div>}
        </Card>

        <Card className="p-4 space-y-2">
          <div className="font-semibold">Completed</div>
          {groups.completed.map((t) => (
            <Card key={t.id} className="p-3 flex items-center justify-between opacity-75">
              <div className="flex items-center gap-3">
                <Checkbox checked={t.completed} onCheckedChange={() => toggleTask(t.id)} />
                <div className="line-through text-muted-foreground">{t.title}</div>
              </div>
              <Button variant="secondary" size="sm" onClick={() => removeTask(t.id)}>Delete</Button>
            </Card>
          ))}
          {groups.completed.length === 0 && <div className="text-muted-foreground text-sm">No completed tasks.</div>}
        </Card>
      </div>

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
              <Select value={priority} onValueChange={setPriority}>
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
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={submit}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
