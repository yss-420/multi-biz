import { useEffect, useState, Fragment } from "react";
import { useData, Subscription } from "@/context/DataContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Pencil, Trash2, Calendar as CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { useAi } from "@/context/AiContext";
import { Dialog as UIDialog, DialogContent as UIDialogContent, DialogHeader as UIDialogHeader, DialogTitle as UIDialogTitle } from "@/components/ui/dialog";

export default function SubscriptionsPage() {
  const { subsForSelected, addSubscription, updateSubscription, removeSubscription, currentBusiness } = useData();
  const { analyzeSubscriptions } = useAi();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Omit<Subscription, "id">>({
    businessId: "",
    serviceName: "",
    cost: 0,
    currency: "USD",
    cycle: "monthly",
    renewalDate: new Date().toISOString(),
    autoRenew: true,
    notes: "",
    status: "active",
  });

  const [editOpen, setEditOpen] = useState(false);
  const [edit, setEdit] = useState<Subscription | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [aiOpen, setAiOpen] = useState(false);
  const [aiSummary, setAiSummary] = useState("");
  const [aiTasks, setAiTasks] = useState<any[]>([]);

  const startEdit = (s: Subscription) => {
    setEdit({ ...s });
    setEditOpen(true);
  };

  useEffect(() => {
    document.title = `Subscriptions – ${currentBusiness?.name ?? "MultiBiz"}`;
  }, [currentBusiness?.name]);

  useEffect(() => {
    if (currentBusiness?.id) setForm((f) => ({ ...f, businessId: currentBusiness.id! }));
  }, [currentBusiness?.id]);

  const onSubmit = () => {
    addSubscription(form);
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          Subscriptions
          <Badge variant="secondary" className="text-xs">Total {subsForSelected.length}</Badge>
        </h1>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={async () => {
              const res = await analyzeSubscriptions();
              setAiSummary(res.summary);
              setAiTasks(res.suggestions);
              setAiOpen(true);
            }}
          >
            Analyze subscriptions
          </Button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Add Subscription</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Subscription</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4">
              <div className="grid gap-1">
                <Label>Service Name</Label>
                <Input value={form.serviceName} onChange={(e) => setForm({ ...form, serviceName: e.target.value })} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="grid gap-1">
                  <Label>Cost</Label>
                  <Input type="number" value={form.cost} onChange={(e) => setForm({ ...form, cost: Number(e.target.value) })} />
                </div>
                <div className="grid gap-1">
                  <Label>Currency</Label>
                  <Input value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} />
                </div>
                <div className="grid gap-1">
                  <Label>Cycle</Label>
                  <Select value={form.cycle} onValueChange={(v) => setForm({ ...form, cycle: v as any })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                     <SelectContent>
                       <SelectItem value="monthly">Monthly</SelectItem>
                       <SelectItem value="quarterly">Quarterly</SelectItem>
                       <SelectItem value="yearly">Yearly</SelectItem>
                     </SelectContent>
                  </Select>
        </div>
              </div>
              <div className="grid gap-1">
                <Label>Renewal Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={`w-[240px] justify-start text-left font-normal ${!form.renewalDate ? "text-muted-foreground" : ""}`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {form.renewalDate ? format(new Date(form.renewalDate), "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={form.renewalDate ? new Date(form.renewalDate) : undefined}
                      onSelect={(d) => setForm({ ...form, renewalDate: d ? d.toISOString() : form.renewalDate })}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="grid gap-1">
                <Label>Notes</Label>
                <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={onSubmit}>Save</Button>
            </DialogFooter>
          </DialogContent>
          </Dialog>
        </div>

        {edit && (
          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Subscription</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4">
                <div className="grid gap-1">
                  <Label>Service Name</Label>
                  <Input value={edit.serviceName} onChange={(e) => setEdit({ ...edit!, serviceName: e.target.value })} />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="grid gap-1">
                    <Label>Cost</Label>
                    <Input type="number" value={edit.cost} onChange={(e) => setEdit({ ...edit!, cost: Number(e.target.value) })} />
                  </div>
                  <div className="grid gap-1">
                    <Label>Currency</Label>
                    <Input value={edit.currency} onChange={(e) => setEdit({ ...edit!, currency: e.target.value })} />
                  </div>
                  <div className="grid gap-1">
                    <Label>Cycle</Label>
                    <Select value={edit.cycle} onValueChange={(v) => setEdit({ ...edit!, cycle: v as any })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                       <SelectContent>
                         <SelectItem value="monthly">Monthly</SelectItem>
                         <SelectItem value="quarterly">Quarterly</SelectItem>
                         <SelectItem value="yearly">Yearly</SelectItem>
                       </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-1">
                  <Label>Renewal Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={`w-[240px] justify-start text-left font-normal ${!edit?.renewalDate ? "text-muted-foreground" : ""}`}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {edit?.renewalDate ? format(new Date(edit.renewalDate), "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={edit?.renewalDate ? new Date(edit.renewalDate) : undefined}
                        onSelect={(d) => setEdit({ ...edit!, renewalDate: d ? d.toISOString() : edit!.renewalDate })}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="grid gap-1">
                  <Label>Notes</Label>
                  <Input value={edit.notes || ""} onChange={(e) => setEdit({ ...edit!, notes: e.target.value })} />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => { if (edit) updateSubscription(edit); setEditOpen(false); }}>Save</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        <Card className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service</TableHead>
              <TableHead>Cost</TableHead>
              <TableHead>Cycle</TableHead>
              <TableHead>Renewal</TableHead>
              <TableHead className="w-[100px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subsForSelected.map((s) => (
              <Fragment key={s.id}>
                <TableRow
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => setExpanded((e) => ({ ...e, [s.id]: !e[s.id] }))}
                >
                  <TableCell className="font-medium">{s.serviceName}</TableCell>
                  <TableCell>
                    {s.currency} {s.cost.toFixed(2)}
                  </TableCell>
                  <TableCell className="capitalize">{s.cycle}</TableCell>
                  <TableCell>{new Date(s.renewalDate).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" aria-label="Edit" onClick={(e) => { e.stopPropagation(); startEdit(s); }}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" aria-label="Delete" onClick={(e) => { e.stopPropagation(); removeSubscription(s.id); }}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
                {expanded[s.id] && s.notes && (
                  <TableRow className="bg-muted/30">
                    <TableCell colSpan={5}>
                      <div className="text-sm text-muted-foreground">{s.notes}</div>
                    </TableCell>
                  </TableRow>
                )}
              </Fragment>
            ))}
          </TableBody>
        </Table>
      </Card>
      <UIDialog open={aiOpen} onOpenChange={setAiOpen}>
        <UIDialogContent>
          <UIDialogHeader>
            <UIDialogTitle>AI suggestions for renewals</UIDialogTitle>
          </UIDialogHeader>
          <div className="space-y-3">
            <div className="text-sm whitespace-pre-wrap bg-muted/40 p-2 rounded">{aiSummary}</div>
            {aiTasks.length > 0 && (
              <div>
                <div className="font-semibold mb-2">Draft tasks</div>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  {aiTasks.map((t, i) => (
                    <li key={i}>{t.title}</li>
                  ))}
                </ul>
                <div className="flex justify-end mt-3">
                  <Button
                    onClick={() => {
                      if (!currentBusiness) return;
                      // Minimal apply: add each suggested task for the current business
                      const { addTask } = require("@/context/DataContext");
                    }}
                    disabled
                  >
                    Apply tasks (coming soon)
                  </Button>
                </div>
              </div>
            )}
          </div>
        </UIDialogContent>
      </UIDialog>
    </div>
  );
}
