import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useData } from "@/context/DataContext";
import { useNavigate } from "react-router-dom";
import { PlusCircle, ListChecks, CreditCard, Key } from "lucide-react";
import AddBusinessDialog from "@/components/AddBusinessDialog";

export default function Dashboard() {
  const { upcomingRenewals, tasksForSelected, currentBusiness, subscriptions, apiKeys, team, selectedBusinessId } = useData();
  const upcoming = upcomingRenewals();
  const navigate = useNavigate();
  const [addOpen, setAddOpen] = useState(false);

  useEffect(() => {
    document.title = `${currentBusiness?.name ?? "Business"} Dashboard`;
  }, [currentBusiness?.name]);

  const kpis = useMemo(() => {
    const subs = subscriptions.filter((s) => s.businessId === selectedBusinessId);
    const monthly = subs.reduce((sum, s) => sum + (s.cycle === "monthly" ? s.cost : s.cost / 12), 0);
    const apiCount = apiKeys.filter((k) => k.businessId === selectedBusinessId).length;
    const teamCount = team.filter((m) => m.assignedBusinessIds.includes(selectedBusinessId)).length;
    const completed = tasksForSelected.filter((t) => t.completed).length;
    return { monthly: monthly.toFixed(2), apiCount, teamCount, completed };
  }, [subscriptions, selectedBusinessId, apiKeys, team, tasksForSelected]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{currentBusiness?.name ?? "Business"} Dashboard</h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Active Tasks</div>
          <div className="text-2xl font-bold">{tasksForSelected.filter((t) => !t.completed).length}</div>
          <div className="text-xs text-muted-foreground mt-1">{kpis.completed} completed</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Subscriptions</div>
          <div className="text-2xl font-bold">{subscriptions.filter((s) => s.businessId === selectedBusinessId).length}</div>
          <div className="text-xs text-muted-foreground mt-1">${kpis.monthly}/month</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">API Keys</div>
          <div className="text-2xl font-bold">{kpis.apiCount}</div>
          <div className="text-xs text-muted-foreground mt-1">Secure vault</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Team Members</div>
          <div className="text-2xl font-bold">{kpis.teamCount}</div>
          <div className="text-xs text-muted-foreground mt-1">Active members</div>
        </Card>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Button variant="secondary" className="justify-start" onClick={() => setAddOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Business
        </Button>
        <Button variant="secondary" className="justify-start" onClick={() => navigate("/tasks") }>
          <ListChecks className="mr-2 h-4 w-4" /> Create Task
        </Button>
        <Button variant="secondary" className="justify-start" onClick={() => navigate("/subscriptions")}>
          <CreditCard className="mr-2 h-4 w-4" /> Track Subscription
        </Button>
        <Button variant="secondary" className="justify-start" onClick={() => navigate("/vault")}>
          <Key className="mr-2 h-4 w-4" /> Store API Key
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Renewals (30 days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {upcoming.length === 0 && <li className="text-muted-foreground">No renewals in the next 30 days.</li>}
              {upcoming.map((s) => (
                <li key={s.id} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{s.serviceName}</div>
                    <div className="text-sm text-muted-foreground">
                      {s.cycle} · {s.currency} {s.cost.toFixed(2)}
                    </div>
                  </div>
                  <div className="text-sm">{new Date(s.renewalDate).toLocaleDateString()}</div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Pending Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {tasksForSelected.filter((t) => !t.completed).slice(0, 5).map((t) => (
                <li key={t.id} className="flex items-center justify-between">
                  <span>{t.title}</span>
                  {t.dueDate && (
                    <span className="text-sm text-muted-foreground">Due {new Date(t.dueDate).toLocaleDateString()}</span>
                  )}
                </li>
              ))}
              {tasksForSelected.filter((t) => !t.completed).length === 0 && (
                <li className="text-muted-foreground">All caught up! 🎉</li>
              )}
            </ul>
          </CardContent>
        </Card>
      </div>

      <AddBusinessDialog open={addOpen} onOpenChange={setAddOpen} />
    </div>
  );
}
