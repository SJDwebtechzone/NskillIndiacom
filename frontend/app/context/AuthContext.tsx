"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";

/* ── Types ──────────────────────────────────────────── */
interface User {
  id:               number;
  name:             string;
  email:            string;
  role:             string;
  roleName?:        string;   // ← added
  admission_number?: string;
}

type ModulePermission = {
  view:   boolean;
  add:    boolean;
  edit:   boolean;
  delete: boolean;
};

type Permissions = Record<string, ModulePermission>;

interface AuthContextType {
  user:        User | null;
  permissions: Permissions;
  loading:     boolean;
  logout:      () => void;
  can:         (module: string, action: "view" | "add" | "edit" | "delete") => boolean;
}

/* ── Context ────────────────────────────────────────── */
const AuthContext = createContext<AuthContextType>({
  user:        null,
  permissions: {},
  loading:     true,
  logout:      () => {},
  can:         () => false,
});

/* ── Provider ───────────────────────────────────────── */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,        setUser]        = useState<User | null>(null);
  const [permissions, setPermissions] = useState<Permissions>({});
  const [loading,     setLoading]     = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const token      = localStorage.getItem("token");
      const savedUser  = localStorage.getItem("user");
      const savedPerms = localStorage.getItem("permissions");

      if (token && savedUser) {
        const parsedUser  = JSON.parse(savedUser);
        const parsedPerms = savedPerms ? JSON.parse(savedPerms) : {};

        // ── Ensure roleName is always set ─────────────────────────────────
        if (!parsedUser.roleName && parsedUser.role) {
          parsedUser.roleName = parsedUser.role;
        }
        if (!parsedUser.role && parsedUser.roleName) {
          parsedUser.role = parsedUser.roleName;
        }

        setUser(parsedUser);

        // ── Normalize permissions ─────────────────────────────────────────
        // Backend returns can_view but layout checks .view — map both formats
        const normalized: Permissions = {};
        Object.entries(parsedPerms).forEach(([module, perm]: [string, any]) => {
          normalized[module] = {
            view:   perm?.view   ?? perm?.can_view   ?? false,
            add:    perm?.add    ?? perm?.can_add    ?? false,
            edit:   perm?.edit   ?? perm?.can_edit   ?? false,
            delete: perm?.delete ?? perm?.can_delete ?? false,
          };
        });

        setPermissions(normalized);
      }
    } catch (err) {
      console.error("[AuthContext] Failed to restore session:", err);
      // Clear corrupted data silently
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("permissions");
    } finally {
      // CRITICAL: Always set loading false
      setLoading(false);
    }
  }, []);

  /* ── Logout ─────────────────────────────────────── */
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("permissions");
    setUser(null);
    setPermissions({});
    router.push("/");   // ← redirects to homepage not /login
  };

  /* ── Permission check ───────────────────────────── */
  const can = (
    module: string,
    action: "view" | "add" | "edit" | "delete"
  ): boolean => {
    // Super Admin and Admin bypass all permission checks
    if (
      user?.role     === "Super Admin" || user?.role     === "Admin" ||
      user?.roleName === "Super Admin" || user?.roleName === "Admin"
    ) return true;
    return permissions[module]?.[action] === true;
  };

  return (
    <AuthContext.Provider value={{ user, permissions, loading, logout, can }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
