"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";

// ── Types ──────────────────────────────────────────────────────────
interface Perm {
  module_id: number;
  module_name: string;
  slug: string;
  can_view: boolean;
  can_add: boolean;
  can_edit: boolean;
  can_delete: boolean;
}

// Modules where add/edit/delete don't apply
// "Dashboard" is view-only, add more slugs here if needed
const VIEW_ONLY = ["Dashboard"];

const API = `${process.env.NEXT_PUBLIC_API_URL}/api/roles`;

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function EditRolePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { can } = useAuth();

  const [roleName, setRoleName] = useState("");
  const [perms, setPerms] = useState<Perm[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Load role + permissions ────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/${id}/permissions`, {
        headers: getAuthHeaders(),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      setRoleName(json.data.role.name);
      setPerms(json.data.permissions);
    } catch (e: any) {
      showToast(`❌ ${e.message}`, false);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);
  // ── Block while loading ────────────────────────────────────────
  if (loading) {
    return (
      <div style={{
        display: "flex", alignItems: "center",
        justifyContent: "center", height: "60vh"
      }}>
        <p style={{ color: "#6366f1", fontWeight: 600 }}>Loading...</p>
      </div>
    );
  }

  // ── Block if no permission ─────────────────────────────────────
  if (!can("Manage Roles", "edit")) {
    return (
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", height: "60vh", gap: 12
      }}>
        <div style={{ fontSize: 48 }}>⛔</div>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#1e293b" }}>Access Denied</h2>
        <p style={{ color: "#94a3b8", fontSize: "0.84rem" }}>
          You don't have permission to edit roles.
        </p>
      </div>
    );
  }

  // ── Toggle single checkbox ─────────────────────────────────────
  const toggle = (moduleId: number, action: keyof Perm) => {
    setPerms(prev => prev.map(p => {
      if (p.module_id !== moduleId) return p;

      const currentValue = p[action];
      if (typeof currentValue !== 'boolean') return p;

      const next = { ...p, [action]: !currentValue } as Perm;
      // Uncheck view → uncheck everything
      if (action === "can_view" && !next.can_view)
        return { ...next, can_add: false, can_edit: false, can_delete: false };
      // Check any action → auto-check view
      if (action !== "can_view" && next[action])
        return { ...next, can_view: true };
      return next;
    }));
  };

  // ── Toggle whole row ───────────────────────────────────────────
  const toggleRow = (moduleId: number, slug: string) => {
    setPerms(prev => prev.map(p => {
      if (p.module_id !== moduleId) return p;
      const isVO = VIEW_ONLY.includes(slug);
      const newVal = isVO ? !p.can_view : !p.can_view;
      return isVO
        ? { ...p, can_view: newVal }
        : { ...p, can_view: newVal, can_add: newVal, can_edit: newVal, can_delete: newVal };
    }));
  };

  // ── Select all / deselect all ──────────────────────────────────
  const allOn = perms.length > 0 && perms.every(p =>
    VIEW_ONLY.includes(p.slug)
      ? p.can_view
      : p.can_view && p.can_add && p.can_edit && p.can_delete
  );

  const selectAll = (val: boolean) => {
    setPerms(prev => prev.map(p => {
      const isVO = VIEW_ONLY.includes(p.slug);
      return isVO
        ? { ...p, can_view: val }
        : { ...p, can_view: val, can_add: val, can_edit: val, can_delete: val };
    }));
  };

  // ── Save ───────────────────────────────────────────────────────
  const save = async () => {
    setSaving(true);
    try {
      // 1. Update role name
      await fetch(`${API}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ name: roleName }),
      });

      // 2. Save permissions
      const res = await fetch(`${API}/${id}/permissions`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({
          permissions: perms.map(p => ({
            module_slug: p.slug, // Use slug for correct backend matching
            can_view: p.can_view,
            can_add: p.can_add,
            can_edit: p.can_edit,
            can_delete: p.can_delete,
          })),
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      
      // 3. Reload permissions to confirm they were saved
      await load();
      showToast("✅ Permissions saved successfully!");
    } catch (e: any) {
      showToast(`❌ ${e.message}`, false);
    } finally {
      setSaving(false);
    }
  };

  const filtered = perms.filter(p =>
    p.module_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <style>{`
        @keyframes fadeUp  { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
        @keyframes toastIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:none} }
        .perm-row:hover { background: #fafbff !important; }
        .skeleton { background:linear-gradient(90deg,#f1f5f9 25%,#e9eef5 50%,#f1f5f9 75%);
          background-size:200% 100%; animation:shimmer 1.4s infinite; border-radius:6px; }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
      `}</style>

      {/* ── Header ── */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: 14, marginBottom: 24
      }}>
        <div>
          <h1 style={{ fontSize: "1.45rem", fontWeight: 800, color: "#1e293b" }}>
            Edit Role:{" "}
            <span style={{ color: "#6366f1", textTransform: "capitalize" }}>
              {roleName}
            </span>
          </h1>
          <p style={{ fontSize: "0.78rem", color: "#94a3b8", marginTop: 2 }}>
            Assign module-level permissions for this role
          </p>
        </div>
        <button
          onClick={() => router.push("/dashboard/manage-roles")}
          style={{
            display: "flex", alignItems: "center", gap: 6, padding: "9px 16px",
            border: "1.5px solid #e2e8f0", borderRadius: 10, background: "#fff",
            fontSize: "0.8rem", fontWeight: 700, color: "#64748b",
            cursor: "pointer", fontFamily: "inherit"
          }}>
          ← Back to Roles
        </button>
      </div>

      {/* ── Role Name input ── */}
      <div style={{
        background: "#fff", borderRadius: 16, border: "1.5px solid #f1f5f9",
        padding: "20px 24px", marginBottom: 20
      }}>
        <label style={{
          display: "block", fontSize: "0.72rem", fontWeight: 700,
          color: "#475569", textTransform: "uppercase",
          letterSpacing: "0.07em", marginBottom: 8
        }}>
          Role Name
        </label>
        <input
          value={roleName}
          onChange={e => setRoleName(e.target.value)}
          style={{
            padding: "9px 12px", borderRadius: 9, fontSize: "0.84rem",
            border: "1.5px solid #e2e8f0", outline: "none", width: 280,
            fontFamily: "inherit", color: "#1e293b", boxSizing: "border-box"
          }}
        />
      </div>

      {/* ── Permissions table ── */}
      <div style={{
        background: "#fff", borderRadius: 16,
        border: "1.5px solid #f1f5f9", overflow: "hidden"
      }}>

        {/* Table header bar */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 20px", borderBottom: "1.5px solid #f1f5f9", flexWrap: "wrap", gap: 12
        }}>
          <h2 style={{ fontSize: "0.95rem", fontWeight: 800, color: "#1e293b" }}>
            Assign Permissions
          </h2>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* Module search */}
            <div style={{ position: "relative" }}>
              <span style={{
                position: "absolute", left: 9, top: "50%",
                transform: "translateY(-50%)", fontSize: 12
              }}>🔍</span>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search modules…"
                style={{
                  padding: "7px 12px 7px 28px", borderRadius: 9,
                  border: "1.5px solid #e2e8f0", fontSize: "0.78rem",
                  outline: "none", fontFamily: "inherit", width: 180
                }}
              />
            </div>
            {/* Select all button */}
            <button
              onClick={() => selectAll(!allOn)}
              style={{
                display: "flex", alignItems: "center", gap: 7,
                padding: "7px 14px", border: "1.5px solid #6366f1",
                borderRadius: 9, background: allOn ? "#6366f1" : "#fff",
                color: allOn ? "#fff" : "#6366f1", fontSize: "0.78rem",
                fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                transition: "all 0.15s"
              }}>
              {allOn ? "☑ Deselect All" : "☐ Select All"}
            </button>
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                <th style={{
                  padding: "12px 20px", textAlign: "left", fontSize: "0.62rem",
                  fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.09em",
                  color: "#94a3b8", borderBottom: "1.5px solid #f1f5f9"
                }}>
                  Module
                </th>
                {["View", "Add", "Edit", "Delete"].map(h => (
                  <th key={h} style={{
                    padding: "12px 16px", textAlign: "center",
                    fontSize: "0.62rem", fontWeight: 800, textTransform: "uppercase",
                    letterSpacing: "0.09em", color: "#94a3b8",
                    borderBottom: "1.5px solid #f1f5f9", width: 80
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Skeleton loading */}
              {loading && Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td style={{ padding: "14px 20px", borderTop: "1px solid #f8fafc" }}>
                    <div className="skeleton" style={{ height: 14, width: 140 }} />
                  </td>
                  {[1, 2, 3, 4].map(j => (
                    <td key={j} style={{
                      padding: "14px 16px", textAlign: "center",
                      borderTop: "1px solid #f8fafc"
                    }}>
                      <div className="skeleton" style={{ height: 16, width: 16, margin: "0 auto", borderRadius: 4 }} />
                    </td>
                  ))}
                </tr>
              ))}

              {/* Permission rows */}
              {!loading && filtered.map((p, i) => {
                const isVO = VIEW_ONLY.includes(p.slug);
                const rowOn = isVO
                  ? p.can_view
                  : p.can_view && p.can_add && p.can_edit && p.can_delete;

                return (
                  <tr key={p.module_id} className="perm-row"
                    style={{
                      borderTop: "1px solid #f8fafc", transition: "background 0.1s",
                      animation: "fadeUp 0.22s ease both",
                      animationDelay: `${i * 0.03}s`
                    }}>

                    {/* Module name with row toggle */}
                    <td style={{ padding: "12px 20px" }}>
                      <label style={{
                        display: "flex", alignItems: "center",
                        gap: 10, cursor: "pointer"
                      }}>
                        <input
                          type="checkbox"
                          checked={rowOn}
                          onChange={() => toggleRow(p.module_id, p.slug)}
                          style={{
                            width: 16, height: 16, accentColor: "#6366f1",
                            cursor: "pointer", flexShrink: 0
                          }}
                        />
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{
                            width: 30, height: 30, borderRadius: 8,
                            background: rowOn ? "rgba(99,102,241,0.1)" : "#f8fafc",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 14, border: "1px solid #e2e8f0",
                            transition: "all 0.15s"
                          }}>
                            📋
                          </div>
                          <span style={{ fontWeight: 600, color: "#1e293b" }}>
                            {p.module_name}
                          </span>
                          {isVO && (
                            <span style={{
                              fontSize: "0.6rem", background: "#fef3c7",
                              color: "#92400e", padding: "2px 7px", borderRadius: 99,
                              fontWeight: 700
                            }}>
                              View only
                            </span>
                          )}
                        </div>
                      </label>
                    </td>

                    {/* VIEW */}
                    <td style={{ padding: "12px 16px", textAlign: "center" }}>
                      <input
                        type="checkbox"
                        checked={p.can_view}
                        onChange={() => toggle(p.module_id, "can_view")}
                        style={{ width: 16, height: 16, accentColor: "#6366f1", cursor: "pointer" }}
                      />
                    </td>

                    {/* ADD */}
                    <td style={{ padding: "12px 16px", textAlign: "center" }}>
                      {isVO
                        ? <span style={{ color: "#e2e8f0", fontSize: 16 }}>—</span>
                        : <input
                          type="checkbox"
                          checked={p.can_add}
                          onChange={() => toggle(p.module_id, "can_add")}
                          style={{ width: 16, height: 16, accentColor: "#6366f1", cursor: "pointer" }}
                        />
                      }
                    </td>

                    {/* EDIT */}
                    <td style={{ padding: "12px 16px", textAlign: "center" }}>
                      {isVO
                        ? <span style={{ color: "#e2e8f0", fontSize: 16 }}>—</span>
                        : <input
                          type="checkbox"
                          checked={p.can_edit}
                          onChange={() => toggle(p.module_id, "can_edit")}
                          style={{ width: 16, height: 16, accentColor: "#6366f1", cursor: "pointer" }}
                        />
                      }
                    </td>

                    {/* DELETE */}
                    <td style={{ padding: "12px 16px", textAlign: "center" }}>
                      {isVO
                        ? <span style={{ color: "#e2e8f0", fontSize: 16 }}>—</span>
                        : <input
                          type="checkbox"
                          checked={p.can_delete}
                          onChange={() => toggle(p.module_id, "can_delete")}
                          style={{ width: 16, height: 16, accentColor: "#6366f1", cursor: "pointer" }}
                        />
                      }
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Save button ── */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}>
        <button
          onClick={save}
          disabled={saving}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "11px 32px", borderRadius: 11,
            background: saving
              ? "#a5b4fc"
              : "linear-gradient(135deg,#6366f1,#7c3aed)",
            color: "#fff", border: "none", fontSize: "0.88rem",
            fontWeight: 700, cursor: saving ? "not-allowed" : "pointer",
            fontFamily: "inherit",
            boxShadow: saving ? "none" : "0 4px 16px rgba(99,102,241,0.35)"
          }}>
          {saving ? (
            <>
              <span style={{
                width: 14, height: 14, border: "2px solid rgba(255,255,255,0.4)",
                borderTopColor: "#fff", borderRadius: "50%",
                animation: "spin 0.7s linear infinite", display: "inline-block"
              }} />
              Saving…
            </>
          ) : "💾 Save Permissions"}
        </button>
      </div>

      {/* ── Toast ── */}
      {toast && (
        <div style={{
          position: "fixed", bottom: 24, right: 24, zIndex: 10000,
          background: toast.ok ? "#1e293b" : "#ef4444",
          color: "#fff", padding: "12px 20px", borderRadius: 12,
          fontSize: "0.83rem", fontWeight: 600,
          boxShadow: "0 8px 24px rgba(0,0,0,0.2)", animation: "toastIn 0.25s ease"
        }}>
          {toast.msg}
        </div>
      )}

      <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
    </>
  );
}
