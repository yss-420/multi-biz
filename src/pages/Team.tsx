import { useEffect, useMemo, useState } from "react";
import { useData, TeamMember } from "@/context/DataContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RequireOwner } from "@/context/AuthContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Pencil } from "lucide-react";

function TeamContent() {
  const { team, businesses, addTeamMember, assignMemberToBusinesses, currentBusiness, updateTeamMember } = useData();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const departments = [
    "leadership",
    "product",
    "engineering",
    "design",
    "data",
    "marketing",
    "sales",
    "customer-success",
    "operations",
    "finance",
    "hr",
    "legal",
    "it-security",
    "partnerships",
    "support",
  ];
  const rolesByDept: Record<string, string[]> = {
    leadership: ["CEO", "Co-Founder", "CTO", "COO", "CFO", "CPO"],
    product: ["Product Manager", "Product Owner", "Business Analyst"],
    engineering: ["Frontend Engineer", "Backend Engineer", "Fullstack Engineer", "Mobile Engineer", "QA Engineer", "SRE", "DevOps", "Data Engineer", "ML Engineer"],
    design: ["Product Designer", "UX Researcher", "Brand Designer", "Graphic Designer", "UX Writer"],
    data: ["Data Analyst", "Data Scientist", "BI Analyst"],
    marketing: ["Marketing Manager", "Content Marketer", "SEO Specialist", "Growth Marketer", "Performance Marketer", "Social Media Manager"],
    sales: ["SDR", "Account Executive", "Account Manager", "Sales Manager"],
    "customer-success": ["Customer Success Manager", "Onboarding Specialist"],
    operations: ["Operations Manager", "Project Manager", "Program Manager"],
    finance: ["Finance Manager", "Accountant", "Controller"],
    hr: ["HR Manager", "Recruiter", "People Ops"],
    legal: ["Legal Counsel", "Compliance Officer"],
    "it-security": ["IT Admin", "Security Engineer"],
    partnerships: ["Partnerships Manager", "BD Manager"],
    support: ["Support Specialist", "Support Engineer"],
  };
  const [department, setDepartment] = useState<string>(departments[0]);
  const roles = useMemo(() => rolesByDept[department] ?? [], [department]);
  const [role, setRole] = useState<string>(rolesByDept[departments[0]][0]);
  useEffect(() => { setRole((rolesByDept[department] ?? [""])[0]); }, [department]);
  const [edit, setEdit] = useState<TeamMember | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    document.title = `Team – ${currentBusiness?.name ?? "MultiBiz"}`;
  }, [currentBusiness?.name]);

  const invite = () => {
    if (!name || !email) return;
    addTeamMember({ name, email, assignedBusinessIds: selected, role, department });
    setName("");
    setEmail("");
    setSelected([]);
    setRole(roles[0]);
    setDepartment(departments[0]);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Team</h1>

      <Card className="p-4 space-y-3">
        <div className="font-semibold">Invite Member</div>
        <div className="grid md:grid-cols-5 gap-3">
          <div className="grid gap-1">
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="grid gap-1">
            <Label>Email</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="grid gap-1">
            <Label>Department</Label>
            <Select value={department} onValueChange={setDepartment}>
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((d) => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1">
            <Label>Role</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1">
            <Label>Assign to</Label>
            <Select value={selected.length === businesses.length ? "all" : (selected[0] || undefined)} onValueChange={(v) => v === "all" ? setSelected(businesses.map((b) => b.id)) : setSelected([v])}>
              <SelectTrigger>
                <SelectValue placeholder="Select business" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All businesses</SelectItem>
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
            <div className="text-sm">Role: {m.role || "—"} · Dept: {m.department || "—"}</div>
            <div className="text-sm">Assigned: {m.assignedBusinessIds.map((id) => businesses.find((b) => b.id === id)?.name).join(", ") || "—"}</div>
            <div className="grid gap-1">
              <Label>Change Assignment</Label>
              <Select value={m.assignedBusinessIds.length === businesses.length ? "all" : (m.assignedBusinessIds[0] || undefined)} onValueChange={(v) => v === "all" ? assignMemberToBusinesses(m.id, businesses.map((b) => b.id)) : assignMemberToBusinesses(m.id, [v])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All businesses</SelectItem>
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
