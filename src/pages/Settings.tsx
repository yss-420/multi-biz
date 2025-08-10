import { useEffect, useState } from "react";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export default function SettingsPage() {
  const { settings, currentBusiness } = useData();
  const { user } = useAuth();
  const [days, setDays] = useState<number[]>(settings.reminderDays);

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
    </div>
  );
}
