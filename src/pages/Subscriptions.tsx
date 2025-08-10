import { useEffect, useState } from "react";
import { useData, Subscription } from "@/context/DataContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";

export default function SubscriptionsPage() {
  const { subsForSelected, addSubscription, currentBusiness } = useData();
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
        <h1 className="text-3xl font-bold">Subscriptions</h1>
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
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-1">
                <Label>Renewal Date</Label>
                <Input type="date" value={form.renewalDate.slice(0,10)} onChange={(e) => setForm({ ...form, renewalDate: new Date(e.target.value).toISOString() })} />
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

      <Card className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service</TableHead>
              <TableHead>Cost</TableHead>
              <TableHead>Cycle</TableHead>
              <TableHead>Renewal</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subsForSelected.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-medium">{s.serviceName}</TableCell>
                <TableCell>
                  {s.currency} {s.cost.toFixed(2)}
                </TableCell>
                <TableCell className="capitalize">{s.cycle}</TableCell>
                <TableCell>{new Date(s.renewalDate).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
