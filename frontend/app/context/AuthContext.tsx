// // "use client";

// // import {
// //   createContext,
// //   useContext,
// //   useState,
// //   useEffect,
// //   ReactNode,
// // } from "react";
// // import { useRouter } from "next/navigation";

// // // ── Types ──────────────────────────────────────────────────────────
// // interface User {
// //   id: number;
// //   name: string;
// //   email: string;
// //   role: string;
// // }

// // type ModulePermission = {
// //   view:   boolean;
// //   add:    boolean;
// //   edit:   boolean;
// //   delete: boolean;
// // };

// // type Permissions = Record<string, ModulePermission>;

// // interface AuthContextType {
// //   user:        User | null;
// //   permissions: Permissions;
// //   loading:     boolean;
// //   logout:      () => void;
// //   can:         (module: string, action: "view" | "add" | "edit" | "delete") => boolean;
// // }

// // // ── Context ────────────────────────────────────────────────────────
// // const AuthContext = createContext<AuthContextType>({
// //   user:        null,
// //   permissions: {},
// //   loading:     true,
// //   logout:      () => {},
// //   can:         () => false,
// // });

// // // ── Provider ───────────────────────────────────────────────────────
// // export function AuthProvider({ children }: { children: ReactNode }) {
// //   const [user,        setUser]        = useState<User | null>(null);
// //   const [permissions, setPermissions] = useState<Permissions>({});
// //   const [loading,     setLoading]     = useState<boolean>(true);
// //   const router = useRouter();

// //   // ✅ FIXED: Only restore session — NO redirect here
// //   // Redirects are handled by dashboard/layout.tsx only
// //   useEffect(() => {
// //     try {
// //       const token      = localStorage.getItem("token");
// //       const savedUser  = localStorage.getItem("user");
// //       const savedPerms = localStorage.getItem("permissions");

// //       if (token && savedUser) {
// //         setUser(JSON.parse(savedUser));
// //         setPermissions(JSON.parse(savedPerms || "{}"));
// //       }
// //       // ✅ No router.push("/login") here — that caused the blink!
// //     } catch {
// //       // Corrupted storage — clear it silently
// //       localStorage.removeItem("token");
// //       localStorage.removeItem("user");
// //       localStorage.removeItem("permissions");
// //     } finally {
// //       setLoading(false); // ← always set false so pages can proceed
// //     }
// //   }, []);

// //   const logout = () => {
// //     localStorage.removeItem("token");
// //     localStorage.removeItem("user");
// //     localStorage.removeItem("permissions");
// //     setUser(null);
// //     setPermissions({});
// //     router.push("/login");
// //   };

// //   const can = (
// //     module: string,
// //     action: "view" | "add" | "edit" | "delete"
// //   ): boolean => {
// //     return permissions[module]?.[action] === true;
// //   };

// //   return (
// //     <AuthContext.Provider value={{ user, permissions, loading, logout, can }}>
// //       {children}
// //     </AuthContext.Provider>
// //   );
// // }

// // export const useAuth = () => useContext(AuthContext);

// "use client";

// import {
//   createContext,
//   useContext,
//   useState,
//   useEffect,
//   ReactNode,
// } from "react";
// import { useRouter } from "next/navigation";

// // ── Types ──────────────────────────────────────────────────────────
// interface User {
//   id:    number;
//   name:  string;
//   email: string;
//   role:  string;
//   admission_number?: string;
// }

// type ModulePermission = {
//   view:   boolean;
//   add:    boolean;
//   edit:   boolean;
//   delete: boolean;
// };

// type Permissions = Record<string, ModulePermission>;

// interface AuthContextType {
//   user:        User | null;
//   permissions: Permissions;
//   loading:     boolean;
//   logout:      () => void;
//   can:         (module: string, action: "view" | "add" | "edit" | "delete") => boolean;
// }

// const AuthContext = createContext<AuthContextType>({
//   user:        null,
//   permissions: {},
//   loading:     true,
//   logout:      () => {},
//   can:         () => false,
// });

// export function AuthProvider({ children }: { children: ReactNode }) {
//   const [user,        setUser]        = useState<User | null>(null);
//   const [permissions, setPermissions] = useState<Permissions>({});
//   const [loading,     setLoading]     = useState<boolean>(true);
//   const router = useRouter();

//   useEffect(() => {
//     try {
//       const token      = localStorage.getItem("token");
//       const savedUser  = localStorage.getItem("user");
//       const savedPerms = localStorage.getItem("permissions");

//       console.log("[AuthContext] token:", !!token, "user:", !!savedUser); // ← check browser console

//       if (token && savedUser) {
//         setUser(JSON.parse(savedUser));
//         setPermissions(savedPerms ? JSON.parse(savedPerms) : {});
//       }
//     } catch (err) {
//       console.error("[AuthContext] Failed to restore session:", err);
//       localStorage.removeItem("token");
//       localStorage.removeItem("user");
//       localStorage.removeItem("permissions");
//     } finally {
//       // ✅ This MUST always run — if it doesn't, loading stays true forever
//       setLoading(false);
//     }
//   }, []);

//   const logout = () => {
//     localStorage.removeItem("token");
//     localStorage.removeItem("user");
//     localStorage.removeItem("permissions");
//     setUser(null);
//     setPermissions({});
//     router.push("/");
//   };

//   const can = (
//     module: string,
//     action: "view" | "add" | "edit" | "delete"
//   ): boolean => {
//     if (user?.role === "Super Admin" || user?.role === "Admin") return true;
//     return permissions[module]?.[action] === true;
//   };

//   return (
//     <AuthContext.Provider value={{ user, permissions, loading, logout, can }}>
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export const useAuth = () => useContext(AuthContext);

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

        setUser(parsedUser);

        // ✅ FIX: Normalize permissions — backend returns can_view but
        // layout checks .view — map both formats so it works either way
        const normalized: Permissions = {};
        Object.entries(parsedPerms).forEach(([module, perm]: [string, any]) => {
          normalized[module] = {
            // Support both { view: true } and { can_view: true } formats
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
      // ✅ Clear corrupted data silently
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("permissions");
    } finally {
      // ✅ CRITICAL: Always set loading false — if this doesn't run,
      // the whole app stays on loading screen forever
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
    router.push("/login");
  };

  /* ── Permission check ───────────────────────────── */
  const can = (
    module: string,
    action: "view" | "add" | "edit" | "delete"
  ): boolean => {
    // ✅ Super Admin and Admin bypass all permission checks
    if (user?.role === "Super Admin" || user?.role === "Admin") return true;
    return permissions[module]?.[action] === true;
  };

  return (
    <AuthContext.Provider value={{ user, permissions, loading, logout, can }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
