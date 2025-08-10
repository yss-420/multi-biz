import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

export type Role = "owner" | "member";

export type User = {
  email: string;
  name?: string;
  phone?: string;
  role: Role;
  password: string; // Demo only (insecure). For production use Supabase auth.
  verified: boolean;
};

type AuthContextValue = {
  user: User | null;
  login: (email: string, password: string, role?: Role) => Promise<void>;
  signup: (user: Omit<User, "verified">) => Promise<void>;
  logout: () => void;
  isOwner: boolean;
  requirePasswordCheck: (password: string) => boolean;
  changePassword: (current: string, next: string) => boolean;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const LS_KEY = "multibiz_auth_v1";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem(LS_KEY);
    if (stored) setUser(JSON.parse(stored));
  }, []);

  useEffect(() => {
    if (user) localStorage.setItem(LS_KEY, JSON.stringify(user));
    else localStorage.removeItem(LS_KEY);
  }, [user]);

  const login = async (email: string, password: string, role: Role = "owner") => {
    // Demo: if an account exists in LS, validate password. Otherwise create session on the fly.
    const stored = localStorage.getItem(LS_KEY);
    if (stored) {
      const u: User = JSON.parse(stored);
      if (u.email.toLowerCase() === email.toLowerCase() && u.password === password) {
        setUser(u);
        navigate("/dashboard");
        return;
      }
    }
    // Create ephemeral session
    const newUser: User = { email, role, password, verified: true };
    setUser(newUser);
    navigate("/dashboard");
  };

  const signup = async (payload: Omit<User, "verified">) => {
    const newUser: User = { ...payload, verified: true };
    setUser(newUser);
    navigate("/dashboard");
  };

  const logout = () => {
    setUser(null);
    navigate("/login");
  };

  const changePassword = (current: string, next: string) => {
    if (!user) return false;
    if (user.password !== current) return false;
    const updated = { ...user, password: next };
    setUser(updated);
    return true;
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      login,
      signup,
      logout,
      isOwner: user?.role === "owner",
      requirePasswordCheck: (password: string) => (user ? user.password === password : false),
      changePassword,
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

// Route guards
import { Navigate } from "react-router-dom";

export const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

export const RequireOwner: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "owner") return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};
