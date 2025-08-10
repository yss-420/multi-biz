import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type ID = string;

export type Business = { id: ID; name: string; color?: string };
export type Subscription = {
  id: ID;
  businessId: ID;
  serviceName: string;
  cost: number;
  currency: string;
  cycle: "monthly" | "yearly";
  renewalDate: string; // ISO
  autoRenew: boolean;
  notes?: string;
  status: "active" | "cancelled";
};
export type Priority = "low" | "medium" | "high";
export type TaskStatus = "todo" | "in-progress" | "completed";
export type Task = {
  id: ID;
  businessId: ID;
  title: string;
  description?: string;
  completed: boolean;
  priority: Priority;
  dueDate?: string;
  assigneeId?: ID;
  status?: TaskStatus;
};
export type ApiKey = {
  id: ID;
  businessId: ID;
  label: string;
  provider?: string;
  secret: string;
  createdAt: string;
  lastUsedAt?: string;
};
export type TeamMember = {
  id: ID;
  name: string;
  email: string;
  assignedBusinessIds: ID[];
  status: "active" | "inactive";
  role?: string;
  department?: string;
};

export type Settings = {
  reminderDays: number[]; // e.g., [3,1]
};

export type DataState = {
  businesses: Business[];
  selectedBusinessId: ID;
  subscriptions: Subscription[];
  tasks: Task[];
  apiKeys: ApiKey[];
  team: TeamMember[];
  settings: Settings;
};

type DataContextValue = DataState & {
  selectBusiness: (id: ID) => void;
  addBusiness: (name: string, color?: string) => Business;
  updateBusiness: (id: ID, patch: Partial<Business>) => void;
  removeBusiness: (id: ID) => void;
  addSubscription: (s: Omit<Subscription, "id">) => void;
  updateSubscription: (s: Subscription) => void;
  removeSubscription: (id: ID) => void;
  addTask: (t: Omit<Task, "id">) => void;
  toggleTask: (id: ID) => void;
  updateTask: (id: ID, patch: Partial<Task>) => void;
  removeTask: (id: ID) => void;
  addApiKey: (k: Omit<ApiKey, "id" | "createdAt">) => void;
  removeApiKey: (id: ID) => void;
  addTeamMember: (m: Omit<TeamMember, "id" | "status">) => void;
  assignMemberToBusinesses: (memberId: ID, businessIds: ID[]) => void;
  updateTeamMember: (memberId: ID, patch: Partial<TeamMember>) => void;
  removeTeamMember: (memberId: ID) => void;
  currentBusiness: Business | undefined;
  subsForSelected: Subscription[];
  tasksForSelected: Task[];
  upcomingRenewals: () => Subscription[];
};

const DataContext = createContext<DataContextValue | undefined>(undefined);
const LS_KEY = "multibiz_data_v1";

const uid = () => Math.random().toString(36).slice(2, 10);

const initialState = (): DataState => {
  const stored = localStorage.getItem(LS_KEY);
  if (stored) return JSON.parse(stored);
  const biz1: Business = { id: uid(), name: "Secret Share", color: "biz-blue" };
  const today = new Date();
  const inDays = (d: number) => new Date(today.getTime() + d * 86400000).toISOString();
  return {
    businesses: [biz1],
    selectedBusinessId: biz1.id,
    subscriptions: [
      {
        id: uid(),
        businessId: biz1.id,
        serviceName: "Lovable",
        cost: 25,
        currency: "USD",
        cycle: "monthly",
        renewalDate: inDays(20),
        autoRenew: true,
        notes: "Not on auto-renew (demo)",
        status: "active",
      },
      {
        id: uid(),
        businessId: biz1.id,
        serviceName: "Claude",
        cost: 23,
        currency: "USD",
        cycle: "monthly",
        renewalDate: inDays(5),
        autoRenew: true,
        status: "active",
      },
    ],
    tasks: [
      {
        id: uid(),
        businessId: biz1.id,
        title: "Make MultiBiz via Lovable",
        description: "Frontend-only MVP",
        completed: false,
        priority: "high",
        dueDate: inDays(1),
      },
    ],
    apiKeys: [
      {
        id: uid(),
        businessId: biz1.id,
        label: "Supabase Key",
        provider: "Supabase",
        secret: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.DEMO",
        createdAt: new Date().toISOString(),
      },
    ],
    team: [
      { id: uid(), name: "Manav", email: "you@example.com", assignedBusinessIds: [biz1.id], status: "active" },
    ],
    settings: { reminderDays: [3, 1] },
  };
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<DataState>(() => initialState());

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(state));
  }, [state]);

  const api = useMemo<DataContextValue>(() => {
    const selectBusiness = (id: ID) => setState((s) => ({ ...s, selectedBusinessId: id }));

const addBusiness = (name: string, color?: string): Business => {
  const b: Business = { id: uid(), name, color };
  setState((st) => ({ ...st, businesses: [...st.businesses, b] }));
  return b;
};

const updateBusiness = (id: ID, patch: Partial<Business>) =>
  setState((st) => ({
    ...st,
    businesses: st.businesses.map((b) => (b.id === id ? { ...b, ...patch } : b)),
  }));

const removeBusiness = (id: ID) =>
  setState((st) => {
    const businesses = st.businesses.filter((b) => b.id !== id);
    const selectedBusinessId = st.selectedBusinessId === id ? (businesses[0]?.id || "") : st.selectedBusinessId;
    return { ...st, businesses, selectedBusinessId };
  });

    const addSubscription = (s: Omit<Subscription, "id">) =>
      setState((st) => ({ ...st, subscriptions: [{ id: uid(), ...s }, ...st.subscriptions] }));

    const updateSubscription = (sub: Subscription) =>
      setState((st) => ({
        ...st,
        subscriptions: st.subscriptions.map((x) => (x.id === sub.id ? sub : x)),
      }));

    const removeSubscription = (id: ID) =>
      setState((st) => ({ ...st, subscriptions: st.subscriptions.filter((x) => x.id !== id) }));

    const addTask = (t: Omit<Task, "id">) => setState((st) => ({ ...st, tasks: [{ id: uid(), ...t }, ...st.tasks] }));

    const toggleTask = (id: ID) =>
      setState((st) => ({
        ...st,
        tasks: st.tasks.map((t) =>
          t.id === id ? { ...t, completed: !t.completed, status: !t.completed ? "completed" : (t.status === "completed" ? "todo" : t.status) } : t
        ),
      }));

    const updateTask = (id: ID, patch: Partial<Task>) =>
      setState((st) => ({
        ...st,
        tasks: st.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)),
      }));

    const removeTask = (id: ID) => setState((st) => ({ ...st, tasks: st.tasks.filter((t) => t.id !== id) }));

    const addApiKey = (k: Omit<ApiKey, "id" | "createdAt">) =>
      setState((st) => ({ ...st, apiKeys: [{ id: uid(), createdAt: new Date().toISOString(), ...k }, ...st.apiKeys] }));

    const removeApiKey = (id: ID) => setState((st) => ({ ...st, apiKeys: st.apiKeys.filter((k) => k.id !== id) }));

    const addTeamMember = (m: Omit<TeamMember, "id" | "status">) =>
      setState((st) => ({ ...st, team: [...st.team, { id: uid(), status: "active", ...m }] }));

    const assignMemberToBusinesses = (memberId: ID, businessIds: ID[]) =>
      setState((st) => ({
        ...st,
        team: st.team.map((m) => (m.id === memberId ? { ...m, assignedBusinessIds: businessIds } : m)),
      }));

const updateTeamMember = (memberId: ID, patch: Partial<TeamMember>) =>
  setState((st) => ({
    ...st,
    team: st.team.map((m) => (m.id === memberId ? { ...m, ...patch } : m)),
  }));

const removeTeamMember = (memberId: ID) =>
  setState((st) => ({
    ...st,
    team: st.team.filter((m) => m.id !== memberId),
  }));

    const currentBusiness = state.businesses.find((b) => b.id === state.selectedBusinessId);

    const subsForSelected = state.subscriptions.filter((s) => s.businessId === state.selectedBusinessId);
    const tasksForSelected = state.tasks.filter((t) => t.businessId === state.selectedBusinessId);

    const upcomingRenewals = () => {
      const now = new Date();
      const in30 = new Date(now.getTime() + 30 * 86400000);
      return state.subscriptions
        .filter((s) => s.businessId === state.selectedBusinessId)
        .filter((s) => new Date(s.renewalDate) <= in30 && new Date(s.renewalDate) >= now)
        .sort((a, b) => new Date(a.renewalDate).getTime() - new Date(b.renewalDate).getTime())
        .slice(0, 5);
    };

return {
  ...state,
  selectBusiness,
  addBusiness,
  updateBusiness,
  removeBusiness,
  addSubscription,
  updateSubscription,
  removeSubscription,
  addTask,
  toggleTask,
  updateTask,
  removeTask,
  addApiKey,
  removeApiKey,
  addTeamMember,
  assignMemberToBusinesses,
  updateTeamMember,
  removeTeamMember,
  currentBusiness,
  subsForSelected,
  tasksForSelected,
  upcomingRenewals,
};
  }, [state]);

  return <DataContext.Provider value={api}>{children}</DataContext.Provider>;
};

export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
};
