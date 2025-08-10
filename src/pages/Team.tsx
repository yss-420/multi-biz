import { useEffect, useState } from "react";
import { useData } from "@/context/DataContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RequireOwner } from "@/context/AuthContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

function TeamContent() {
  const { team, businesses, addTeamMember, assignMemberToBusinesses, currentBusiness } = useData();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    document.title = `Team – ${currentBusiness?.name ?? "MultiBiz"}`;
  }, [currentBusiness?.name]);

  const invite = () => {
    if (!name || !email) return;
    addTeamMember({ name, email, assignedBusinessIds: selected });
    setName("");
    setEmail("");
    setSelected([]);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Team</h1>

      <Card className="p-4 space-y-3">
        <div className="font-semibold">Invite Member</div>
        <div className="grid md:grid-cols-3 gap-3">
          <div className="grid gap-1">
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="grid gap-1">
            <Label>Email</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="grid gap-1">
            <Label>Assign to</Label>
            <Select value={selected[0]} onValueChange={(v) => setSelected([v])}>
              <SelectTrigger>
                <SelectValue placeholder="Select business" />
              </SelectTrigger>
              <SelectContent>
                {businesses.map((b) => (
                  <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button onClick={invite}>Invite</Button>
      </Card>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {team.map((m) => (
          <Card key={m.id} className="p-4 space-y-3">
            <div className="font-semibold">{m.name}</div>
            <div className="text-sm text-muted-foreground">{m.email}</div>
            <div className="text-sm">Assigned: {m.assignedBusinessIds.map((id) => businesses.find((b) => b.id === id)?.name).join(", ") || "—"}</div>
            <div className="grid gap-1">
              <Label>Change Assignment</Label>
              <Select value={m.assignedBusinessIds[0]} onValueChange={(v) => assignMemberToBusinesses(m.id, [v])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {businesses.map((b) => (
                    <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function TeamPage() {
  return (
    <RequireOwner>
      <TeamContent />
    </RequireOwner>
  );
}
