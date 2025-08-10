import { useEffect, useState } from "react";
import { useData, Task } from "@/context/DataContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function TasksPage() {
  const { tasksForSelected, addTask, toggleTask, removeTask, currentBusiness } = useData();
  const [title, setTitle] = useState("");

  useEffect(() => {
    document.title = `Tasks – ${currentBusiness?.name ?? "MultiBiz"}`;
  }, [currentBusiness?.name]);

  const submit = () => {
    if (!title.trim() || !currentBusiness) return;
    const t: Omit<Task, "id"> = {
      businessId: currentBusiness.id,
      title,
      completed: false,
      priority: "medium",
    };
    addTask(t);
    setTitle("");
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Tasks</h1>
      <Card className="p-4">
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <Label>New Task</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Add a task" />
          </div>
          <Button onClick={submit}>Add</Button>
        </div>
      </Card>
      <div className="grid gap-3">
        {tasksForSelected.map((t) => (
          <Card key={t.id} className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Checkbox checked={t.completed} onCheckedChange={() => toggleTask(t.id)} />
              <div className={t.completed ? "line-through text-muted-foreground" : ""}>{t.title}</div>
            </div>
            <Button variant="secondary" size="sm" onClick={() => removeTask(t.id)}>
              Delete
            </Button>
          </Card>
        ))}
        {tasksForSelected.length === 0 && <div className="text-muted-foreground">No tasks yet.</div>}
      </div>
    </div>
  );
}
