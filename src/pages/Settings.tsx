import { useEffect, useState } from "react";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2 } from "lucide-react";

export default function SettingsPage() {
  const { settings, currentBusiness, businesses, updateBusiness, removeBusiness, updateSettings } = useData();
  const { profile } = useAuth();
  const { toast } = useToast();
  const [days, setDays] = useState<number[]>(settings.reminderDays);
  const [aiTemp, setAiTemp] = useState<number>(settings.aiTemperature ?? 0.2);
  const [aiMax, setAiMax] = useState<number>(settings.aiMaxTokens ?? 384);

  // Owner-only business editing state
  const [bizName, setBizName] = useState(currentBusiness?.name ?? "");
  const [bizColor, setBizColor] = useState(currentBusiness?.color ?? "biz-blue");

  useEffect(() => {
    document.title = `Settings – ${currentBusiness?.name ?? "MultiBiz"}`;
    setBizName(currentBusiness?.name ?? "");
    setBizColor(currentBusiness?.color ?? "biz-blue");
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
            <Input value={profile?.email || ""} readOnly />
          </div>
          <div className="grid gap-1">
            <Label>Role</Label>
            <Input value={profile?.role || ""} readOnly />
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
        <div className="font-semibold">AI Settings</div>
        <div className="grid md:grid-cols-3 gap-3">
          <div className="grid gap-1">
            <Label>Temperature</Label>
            <Input type="number" step="0.1" value={aiTemp} onChange={(e) => setAiTemp(Number(e.target.value))} />
          </div>
          <div className="grid gap-1">
            <Label>Max tokens</Label>
            <Input type="number" value={aiMax} onChange={(e) => setAiMax(Number(e.target.value))} />
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={() => { updateSettings({ aiTemperature: aiTemp, aiMaxTokens: aiMax }); toast({ title: "AI settings saved" }); }}>Save</Button>
        </div>
      </Card>

      {profile?.role === "owner" && (
        <Card className="p-4 space-y-3">
          <div className="font-semibold">Business Details (Owner)</div>
          <div className="grid md:grid-cols-3 gap-3">
            <div className="grid gap-1 md:col-span-2">
              <Label>Business name</Label>
              <Input value={bizName} onChange={(e) => setBizName(e.target.value)} placeholder="Enter business name" />
            </div>
            <div className="grid gap-1">
              <Label>Color</Label>
              <Select value={bizColor} onValueChange={(v) => setBizColor(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[
                    { v: "biz-red", label: "Red" },
                    { v: "biz-green", label: "Green" },
                    { v: "biz-yellow", label: "Yellow" },
                    { v: "biz-blue", label: "Blue" },
                    { v: "biz-purple", label: "Purple" },
                  ].map((c) => (
                    <SelectItem key={c.v} value={c.v}>
                      <span className="inline-flex items-center">
                        <span className="mr-2 h-3 w-3 rounded-full border" style={{ backgroundColor: `hsl(var(--${c.v}))` }} />
                        {c.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => {
                if (!currentBusiness) return;
                updateBusiness(currentBusiness.id, { name: bizName, color: bizColor });
                toast({ title: "Business updated" });
              }}
            >
              Save changes
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Delete business"
              onClick={() => {
                if (!currentBusiness) return;
                if (!confirm("Delete this business? This cannot be undone.")) return;
                removeBusiness(currentBusiness.id);
                toast({ title: "Business deleted" });
              }}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </Card>
      )}

      <Card className="p-4 space-y-3">
        <div className="font-semibold">Administration</div>
        <div className="text-sm text-muted-foreground">
          Password changes and advanced settings will be available in production version.
        </div>
      </Card>

    </div>
  );
}
