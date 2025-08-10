import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useData } from "@/context/DataContext";

export default function Dashboard() {
  const { upcomingRenewals, tasksForSelected, currentBusiness } = useData();
  const upcoming = upcomingRenewals();

  useEffect(() => {
    document.title = `Dashboard – ${currentBusiness?.name ?? "MultiBiz"}`;
  }, [currentBusiness?.name]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
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
    </div>
  );
}
