import { SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LogOut, PanelLeft } from "lucide-react";
import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import AddBusinessDialog from "@/components/AddBusinessDialog";

function SidebarFloatingToggle() {
  const { toggleSidebar, state } = useSidebar();
  return (
    <Button
      size="icon"
      aria-label="Toggle sidebar"
      aria-pressed={state === "expanded"}
      className="fixed left-3 bottom-4 z-50 rounded-full shadow-md bg-primary text-primary-foreground hover:opacity-90 hover-scale animate-enter"
      onClick={toggleSidebar}
    >
      <PanelLeft className="h-4 w-4" />
      <span className="sr-only">Toggle sidebar</span>
    </Button>
  );
}

export default function AppLayout() {
  const { businesses, selectedBusinessId, selectBusiness, team } = useData();
  const { user, logout } = useAuth();
  const [addOpen, setAddOpen] = useState(false);

  useEffect(() => {
    document.title = "MultiBiz – Operations Hub";
  }, []);

  // Compute visible businesses for members
  const visibleBusinesses = user?.role === "owner"
    ? businesses
    : (() => {
        const member = team.find((m) => m.email.toLowerCase() === user?.email.toLowerCase());
        const allowed = member ? businesses.filter((b) => member.assignedBusinessIds.includes(b.id)) : [];
        return allowed;
      })();

  useEffect(() => {
    if (user?.role === "member") {
      const member = team.find((m) => m.email.toLowerCase() === user.email.toLowerCase());
      const allowedIds = member ? member.assignedBusinessIds : [];
      if (allowedIds.length && !allowedIds.includes(selectedBusinessId)) {
        selectBusiness(allowedIds[0]);
      }
    }
  }, [user?.role, team, selectedBusinessId]);

  return (
    <SidebarProvider>
      <div className="min-h-screen w-full flex flex-col">
        <header className="h-14 flex items-center border-b gap-3 px-3">
          <SidebarTrigger className="" />
          <div className="font-semibold">MultiBiz</div>
          <div className="ml-auto flex items-center gap-3">
            <Select value={selectedBusinessId} onValueChange={(v) => (v === "__add__" ? setAddOpen(true) : selectBusiness(v))}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select a business" />
              </SelectTrigger>
              <SelectContent>
                {visibleBusinesses.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    <span className="inline-flex items-center">
                      <span
                        className="mr-2 h-3 w-3 rounded-full border"
                        style={{ backgroundColor: b.color ? `hsl(var(--${b.color}))` : undefined }}
                      />
                      {b.name}
                    </span>
                  </SelectItem>
                ))}
                {user?.role === "owner" && (
                  <SelectItem value="__add__">+ Add new business…</SelectItem>
                )}
              </SelectContent>
            </Select>
            {user && (
              <Button variant="secondary" size="sm" onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" /> Logout
              </Button>
            )}
          </div>
        </header>
        <div className="flex flex-1 w-full">
          <AppSidebar />
          <main className="flex-1 p-6 bg-background animate-enter">
            <Outlet />
          </main>
        </div>
      </div>
      <AddBusinessDialog open={addOpen} onOpenChange={setAddOpen} />
      <SidebarFloatingToggle />
    </SidebarProvider>
  );
}
