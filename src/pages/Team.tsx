import { useEffect, useMemo, useState } from "react";
import { useData, TeamMember } from "@/context/DataContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RequireOwner, useAuth } from "@/context/AuthContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Pencil, Trash2 } from "lucide-react";

function TeamContent() {
  const { team, businesses, addTeamMember, assignMemberToBusinesses, currentBusiness, updateTeamMember, removeTeamMember } = useData();
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
    leadership: ["CEO", "Co-Founder", "CTO", "COO", "CFO", "CPO", "Chief of Staff", "VP of Engineering", "VP of Product"],
    product: ["Product Manager", "Sr. Product Manager", "Product Owner", "Business Analyst"],
    engineering: [
      "Frontend Engineer",
      "Backend Engineer",
      "Full-Stack Engineer",
      "Mobile Engineer",
      "QA Engineer",
      "QA Lead",
      "SRE",
      "DevOps Engineer",
      "Security Engineer",
      "Staff Engineer",
      "Principal Engineer",
      "Data Engineer",
      "ML Engineer",
    ],
    design: ["Product Designer", "UX Researcher", "UX Writer", "Brand Designer", "Graphic Designer", "Design Manager"],
    data: ["Data Analyst", "Data Scientist", "BI Analyst", "Analytics Engineer"],
    marketing: ["Marketing Manager", "Content Marketer", "SEO Specialist", "Growth Marketer", "Performance Marketer", "Social Media Manager", "Marketing Ops"],
    sales: ["SDR", "Account Executive", "Account Manager", "Sales Manager", "Sales Ops"],
    "customer-success": ["Customer Success Manager", "Onboarding Specialist", "Support Engineer"],
    operations: ["Operations Manager", "Project Manager", "Program Manager"],
    finance: ["Finance Manager", "Accountant", "Controller", "FP&A Analyst"],
    hr: ["HR Manager", "Recruiter", "People Ops"],
    legal: ["Legal Counsel", "Compliance Officer"],
    "it-security": ["IT Admin", "Security Engineer", "Security Analyst"],
    partnerships: ["Partnerships Manager", "Business Development Manager"],
    support: ["Support Specialist", "Support Engineer"],
  };
  const [department, setDepartment] = useState<string>(departments[0]);
  const roles = useMemo(() => rolesByDept[department] ?? [], [department]);
  const [role, setRole] = useState<string>(rolesByDept[departments[0]][0]);
  useEffect(() => { setRole((rolesByDept[department] ?? [""])[0]); }, [department]);
  const [edit, setEdit] = useState<TeamMember | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const { requirePasswordCheck } = useAuth();
  const toTitle = (s: string) => s.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

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
                  <SelectItem key={d} value={d}>{toTitle(d)}</SelectItem>
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
            <div className="flex items-center justify-between">
              <div className="font-semibold">{m.name}</div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" aria-label="Edit" onClick={() => { setEdit(m); setEditOpen(true); }}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" aria-label="Delete" onClick={() => {
                  const pwd = prompt("Enter owner password to delete member");
                  if (!pwd) return;
                  if (!requirePasswordCheck(pwd)) return;
                  removeTeamMember(m.id);
                }}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">{m.email}</div>
            <div className="text-sm">Role: {m.role || "—"} · Dept: {m.department ? toTitle(m.department) : "—"}</div>
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

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Member</DialogTitle>
          </DialogHeader>
          {edit && (
            <div className="grid md:grid-cols-2 gap-3">
              <div className="grid gap-1">
                <Label>Name</Label>
                <Input value={edit.name} onChange={(e) => setEdit({ ...edit!, name: e.target.value })} />
              </div>
              <div className="grid gap-1">
                <Label>Email</Label>
                <Input value={edit.email} onChange={(e) => setEdit({ ...edit!, email: e.target.value })} />
              </div>
              <div className="grid gap-1">
                <Label>Department</Label>
                <Select value={edit.department || departments[0]} onValueChange={(v) => setEdit({ ...edit!, department: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((d) => (
                      <SelectItem key={d} value={d}>{toTitle(d)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1">
                <Label>Role</Label>
                <Select value={edit.role || rolesByDept[edit.department || departments[0]][0]} onValueChange={(v) => setEdit({ ...edit!, role: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(rolesByDept[edit.department || departments[0]] || []).map((r) => (
                      <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="secondary" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={() => { if (!edit) return; updateTeamMember(edit.id, { name: edit.name, email: edit.email, department: edit.department, role: edit.role }); setEditOpen(false); }}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
