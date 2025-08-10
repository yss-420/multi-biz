import { useEffect, useState } from "react";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import AddBusinessDialog from "@/components/AddBusinessDialog";
import { useToast } from "@/components/ui/use-toast";

export default function SettingsPage() {
  const { settings, currentBusiness } = useData();
  const { user, changePassword } = useAuth();
  const { toast } = useToast();
  const [days, setDays] = useState<number[]>(settings.reminderDays);
  const [addOpen, setAddOpen] = useState(false);
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");

  useEffect(() => {
    document.title = `Settings – ${currentBusiness?.name ?? "MultiBiz"}`;
  }, [currentBusiness?.name]);

  const toggleDay = (d: number) => setDays((arr) => (arr.includes(d) ? arr.filter((x) => x !== d) : [...arr, d]));

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>

      <Card className="p-4 space-y-3">
        <div className="font-semibold">Profile</div>
        <div className="grid md:grid-cols-2 gap-3">
          <div className="grid gap-1">
            <Label>Email</Label>
            <Input value={user?.email || ""} readOnly />
          </div>
          <div className="grid gap-1">
            <Label>Role</Label>
            <Input value={user?.role || ""} readOnly />
          </div>
        </div>
      </Card>

      <Card className="p-4 space-y-3">
        <div className="font-semibold">Notifications</div>
        <div className="flex items-center gap-4 text-sm">
          {[7, 3, 1].map((d) => (
            <label key={d} className="flex items-center gap-2">
              <Checkbox checked={days.includes(d)} onCheckedChange={() => toggleDay(d)} />
              {d} day{d > 1 ? "s" : ""} before renewal
            </label>
          ))}
        </div>
        <div className="text-xs text-muted-foreground">Demo only – not persisted separately.</div>
      </Card>

      <Card className="p-4 space-y-3">
        <div className="font-semibold">Administration</div>
        <div className="flex items-center gap-3">
          <Button onClick={() => setAddOpen(true)}>Add new business</Button>
        </div>
        {user?.role === "owner" && (
          <div className="grid md:grid-cols-3 gap-3 pt-4">
            <div className="grid gap-1">
              <Label>Current password</Label>
              <Input type="password" value={currentPwd} onChange={(e) => setCurrentPwd(e.target.value)} />
            </div>
            <div className="grid gap-1">
              <Label>New password</Label>
              <Input type="password" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} />
            </div>
            <div className="grid gap-1">
              <Label>Confirm new password</Label>
              <Input type="password" value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)} />
            </div>
            <div className="md:col-span-3">
              <Button
                variant="secondary"
                onClick={() => {
                  if (!currentPwd || !newPwd || !confirmPwd) return;
                  if (newPwd !== confirmPwd) {
                    toast({ variant: "destructive", title: "Passwords do not match" });
                    return;
                  }
                  const ok = changePassword(currentPwd, newPwd);
                  if (ok) toast({ title: "Password updated" });
                  else toast({ variant: "destructive", title: "Current password incorrect" });
                  setCurrentPwd("");
                  setNewPwd("");
                  setConfirmPwd("");
                }}
              >
                Change password
              </Button>
            </div>
          </div>
        )}
        <div className="text-xs text-muted-foreground">Notifications are local-only and will trigger in-app while open.</div>
      </Card>

      <AddBusinessDialog open={addOpen} onOpenChange={setAddOpen} />
    </div>
  );
}
