import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./layouts/AppLayout";
import { AuthProvider, RequireAuth } from "./context/AuthContext";
import { DataProvider } from "./context/DataContext";
import { AiProvider } from "./context/AiContext";
import AiChat from "./components/AiChat";
import Dashboard from "./pages/Dashboard";
import SubscriptionsPage from "./pages/Subscriptions";
import TasksPage from "./pages/Tasks";
import VaultPage from "./pages/Vault";
import TeamPage from "./pages/Team";
import SettingsPage from "./pages/Settings";
import LoginPage from "./pages/Login";
import SignupPage from "./pages/Signup";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <DataProvider>
            <AiProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route
                path="/"
                element={<Navigate to="/dashboard" replace />}
              />
              <Route
                path="/"
                element={
                  <RequireAuth>
                    <AppLayout>
                      {/* Nested routes render inside layout */}
                    </AppLayout>
                  </RequireAuth>
                }
              >
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="subscriptions" element={<SubscriptionsPage />} />
                <Route path="tasks" element={<TasksPage />} />
                <Route path="vault" element={<VaultPage />} />
                <Route path="team" element={<TeamPage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
            <AiChat />
            </AiProvider>
          </DataProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
