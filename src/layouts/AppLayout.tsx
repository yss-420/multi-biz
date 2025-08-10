import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LogOut } from "lucide-react";
import { Outlet } from "react-router-dom";
import { useEffect } from "react";

export default function AppLayout() {
  const { businesses, selectedBusinessId, selectBusiness } = useData();
  const { user, logout } = useAuth();

  useEffect(() => {
    document.title = "MultiBiz – Operations Hub";
  }, []);

  return (
    <SidebarProvider>
      <div className="min-h-screen w-full flex flex-col">
        <header className="h-14 flex items-center border-b gap-3 px-3">
          <SidebarTrigger className="" />
          <div className="font-semibold">MultiBiz</div>
          <div className="ml-auto flex items-center gap-3">
            <Select value={selectedBusinessId} onValueChange={selectBusiness}>
              <SelectTrigger className="w-56">
                <SelectValue placeholder="Select a business" />
              </SelectTrigger>
              <SelectContent>
                {businesses.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.name}
                  </SelectItem>
                ))}
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
          <main className="flex-1 p-6 bg-background">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
