"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Loader2, Search, Trash2, X,
  ShieldAlert, Wallet, Plus, Minus,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { fetchWithAuth } from "@/lib/fetch-with-auth";

const ROLE_COLORS: Record<string, string> = {
  admin:       "badge-red",
  treasurer:   "badge-amber",
  member:      "badge-cyan",
  participant: "badge-gray",
};

// ── Wallet Adjustment Modal ───────────────────────────────────
function WalletModal({
  user,
  onClose,
  onDone,
}: {
  user:    any;
  onClose: () => void;
  onDone:  () => void;
}) {
  const [type,        setType]        = useState<"credit" | "debit">("credit");
  const [amountMb,    setAmountMb]    = useState("");
  const [description, setDescription] = useState("");
  const [saving,      setSaving]      = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseInt(amountMb);
    if (!amt || amt <= 0) { toast.error("Enter a valid amount"); return; }
    if (!description.trim()) { toast.error("Description is required"); return; }

    setSaving(true);
    const res = await fetchWithAuth("/api/wallet/credit", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({
        userId:      user.id,
        amountMb:    amt,
        type,
        description: description.trim(),
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error ?? "Transaction failed");
    } else {
      toast.success(data.data?.message ?? "Done!");
      onDone();
      onClose();
    }
    setSaving(false);
  };

  const isCredit = type === "credit";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md glass-card p-6"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl border ${isCredit ? "bg-green-500/10 border-green-500/20" : "bg-red-500/10 border-red-500/20"}`}>
              <Wallet className={`w-5 h-5 ${isCredit ? "text-green-400" : "text-red-400"}`} />
            </div>
            <div>
              <h3 className="font-semibold text-white">Manual wallet adjustment</h3>
              <p className="text-xs text-slate-400">{user.name ?? user.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Credit / Debit toggle */}
          <div className="flex rounded-xl overflow-hidden border border-navy-700">
            <button
              type="button"
              onClick={() => setType("credit")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-all ${
                isCredit
                  ? "bg-green-500/20 text-green-400"
                  : "bg-navy-800 text-slate-400 hover:text-white"
              }`}
            >
              <Plus className="w-4 h-4" /> Add Mirai Bucks
            </button>
            <button
              type="button"
              onClick={() => setType("debit")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-all ${
                !isCredit
                  ? "bg-red-500/20 text-red-400"
                  : "bg-navy-800 text-slate-400 hover:text-white"
              }`}
            >
              <Minus className="w-4 h-4" /> Deduct Mirai Bucks
            </button>
          </div>

          {/* Amount */}
          <div>
            <label className="text-xs font-medium text-slate-400 mb-1.5 block">
              Amount (₥ Mirai Bucks)
            </label>
            <input
              type="number"
              min="1"
              value={amountMb}
              onChange={(e) => setAmountMb(e.target.value)}
              placeholder="e.g. 5000"
              className="input-dark"
              required
              autoFocus
            />
            {amountMb && parseInt(amountMb) > 0 && (
              <p className="text-xs text-slate-500 mt-1">
                ≈ ₹{(parseInt(amountMb) / 100).toFixed(2)} INR equivalent
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-medium text-slate-400 mb-1.5 block">
              Reason / Description <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={isCredit ? "e.g. Prize for winning Scrap 2 Scale hackathon" : "e.g. Penalty for no-show at registered event"}
              className="input-dark"
              maxLength={200}
              required
            />
            <p className="text-xs text-slate-600 mt-1">
              This reason will appear in the user's transaction history and audit log.
            </p>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={saving}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 ${
                isCredit
                  ? "bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30"
                  : "bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30"
              }`}
            >
              {saving ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
              ) : isCredit ? (
                <><Plus className="w-4 h-4" /> Add ₥{amountMb || "0"}</>
              ) : (
                <><Minus className="w-4 h-4" /> Deduct ₥{amountMb || "0"}</>
              )}
            </button>
            <button type="button" onClick={onClose} className="btn-ghost px-4">
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ── Delete Modal (unchanged) ──────────────────────────────────
function DeleteModal({
  user,
  adminEmail,
  onClose,
  onDeleted,
}: {
  user:       any;
  adminEmail: string;
  onClose:    () => void;
  onDeleted:  () => void;
}) {
  const [step,     setStep]     = useState<"confirm" | "otp" | "deleting">("confirm");
  const [otpCode,  setOtpCode]  = useState("");
  const [sending,  setSending]  = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const sendOtp = async () => {
    setSending(true);
    const res = await fetchWithAuth("/api/auth/send-otp", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ email: adminEmail }),
    });
    const data = await res.json();
    if (!res.ok) { toast.error(data.error ?? "Failed to send OTP"); }
    else { toast.success(`Verification code sent to ${adminEmail}`); setStep("otp"); setCooldown(60); }
    setSending(false);
  };

  const handleDelete = async () => {
    if (otpCode.length !== 6) return;
    setStep("deleting");
    const res = await fetchWithAuth("/api/admin/users", {
      method:  "DELETE",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ userId: user.id, otpCode }),
    });
    const data = await res.json();
    if (!res.ok) { toast.error(data.error ?? "Deletion failed"); setStep("otp"); }
    else { toast.success(data.data?.message ?? "Account deleted."); onDeleted(); onClose(); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md glass-card p-6 border border-red-500/20"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/20">
              <ShieldAlert className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Delete account</h3>
              <p className="text-xs text-slate-400">This action is permanent</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3 rounded-xl bg-navy-800 border border-navy-700 mb-5">
          <p className="text-sm font-medium text-white">{user.name ?? "—"}</p>
          <p className="text-xs text-slate-400">{user.email}</p>
          <div className="flex gap-1 mt-1 flex-wrap">
            {user.roles?.map((r: string) => (
              <span key={r} className={`${ROLE_COLORS[r] ?? "badge-gray"} text-[10px] capitalize`}>{r}</span>
            ))}
          </div>
        </div>

        {step === "confirm" && (
          <div className="space-y-4">
            <p className="text-sm text-slate-300">
              Deleting this account is permanent. You'll need to verify with an OTP sent to your admin email.
            </p>
            <div className="flex gap-3">
              <button onClick={sendOtp} disabled={sending}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 text-sm font-medium disabled:opacity-50">
                {sending ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : "Send verification code"}
              </button>
              <button onClick={onClose} className="btn-ghost px-4">Cancel</button>
            </div>
          </div>
        )}

        {step === "otp" && (
          <div className="space-y-4">
            <p className="text-sm text-slate-300">
              Enter the 6-digit code sent to <span className="text-cyan-400">{adminEmail}</span>
            </p>
            <input type="text" inputMode="numeric" maxLength={6} value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
              placeholder="000000" autoFocus
              className="input-dark text-center text-2xl font-bold tracking-widest" />
            <div className="flex gap-3">
              <button onClick={handleDelete} disabled={otpCode.length !== 6}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 text-sm font-medium disabled:opacity-50">
                <Trash2 className="w-4 h-4" /> Confirm delete
              </button>
              <button onClick={onClose} className="btn-ghost px-4">Cancel</button>
            </div>
            <div className="text-center">
              {cooldown > 0
                ? <p className="text-xs text-slate-500">Resend in <span className="text-cyan-400">{cooldown}s</span></p>
                : <button onClick={sendOtp} className="text-xs text-cyan-400 hover:text-cyan-300">Resend code</button>
              }
            </div>
          </div>
        )}

        {step === "deleting" && (
          <div className="flex items-center justify-center gap-3 py-4 text-slate-300">
            <Loader2 className="w-5 h-5 animate-spin text-red-400" />
            <span className="text-sm">Deleting and writing to audit log...</span>
          </div>
        )}
      </motion.div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function AdminUsersPage() {
  const [users,        setUsers]        = useState<any[]>([]);
  const [adminEmail,   setAdminEmail]   = useState("");
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState("");
  const [acting,       setActing]       = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [walletTarget, setWalletTarget] = useState<any | null>(null);

  const fetchUsers = () => {
    fetchWithAuth("/api/admin/users?limit=100")
      .then((r) => r.json())
      .then((d) => { setUsers(d.data ?? []); setLoading(false); });
  };

  useEffect(() => {
    fetchUsers();
    fetchWithAuth("/api/users/me")
      .then((r) => r.json())
      .then((d) => setAdminEmail(d.data?.email ?? ""));
  }, []);

  const handleRole = async (userId: string, role: string, action: "assign" | "revoke") => {
    setActing(userId + role);
    const res = await fetchWithAuth("/api/users/role", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ userId, role, action }),
    });
    const data = await res.json();
    if (!res.ok) { toast.error(data.error); }
    else { toast.success(data.data?.message); fetchUsers(); }
    setActing(null);
  };

  const filtered = users.filter((u) =>
    !search ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.name?.toLowerCase().includes(search.toLowerCase())
  );

  const fadeUp = {
    hidden:  { opacity: 0, y: 16 },
    visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.04 } }),
  };

  return (
    <>
      <AnimatePresence>
        {walletTarget && (
          <WalletModal
            user={walletTarget}
            onClose={() => setWalletTarget(null)}
            onDone={fetchUsers}
          />
        )}
        {deleteTarget && (
          <DeleteModal
            user={deleteTarget}
            adminEmail={adminEmail}
            onClose={() => setDeleteTarget(null)}
            onDeleted={fetchUsers}
          />
        )}
      </AnimatePresence>

      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="page-title">Users</h1>
          <p className="text-slate-400 mt-1">
            Manage roles, adjust wallets, and delete accounts.
            Deletions require OTP verification. All actions are audit logged.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..." className="input-dark pl-10" />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <div className="glass-card overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16">
                <Users className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                <p className="text-slate-400">No users found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th className="p-4">User</th>
                      <th className="p-4">Roles</th>
                      <th className="p-4">Joined</th>
                      <th className="p-4">Last login</th>
                      <th className="p-4">Role actions</th>
                      <th className="p-4">Wallet</th>
                      <th className="p-4">Delete</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((user, i) => (
                      <motion.tr key={user.id} custom={i} initial="hidden" animate="visible" variants={fadeUp}>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-bold text-white">
                                {user.email?.[0]?.toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white">{user.name ?? "—"}</p>
                              <p className="text-xs text-slate-500">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-wrap gap-1">
                            {user.roles?.length > 0
                              ? user.roles.map((r: string) => (
                                  <span key={r} className={`${ROLE_COLORS[r] ?? "badge-gray"} capitalize`}>{r}</span>
                                ))
                              : <span className="badge-gray">participant</span>
                            }
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="text-xs text-slate-500">
                            {user.createdAt ? formatDistanceToNow(new Date(user.createdAt), { addSuffix: true }) : "—"}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="text-xs text-slate-500">
                            {user.lastLoginAt ? formatDistanceToNow(new Date(user.lastLoginAt), { addSuffix: true }) : "Never"}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2 flex-wrap">
                            {["member", "treasurer", "admin"].map((role) => {
                              const hasRole  = user.roles?.includes(role);
                              const isActing = acting === user.id + role;
                              return (
                                <button key={role}
                                  onClick={() => handleRole(user.id, role, hasRole ? "revoke" : "assign")}
                                  disabled={!!acting}
                                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all border disabled:opacity-50 ${
                                    hasRole
                                      ? "bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20"
                                      : "bg-cyan-500/10 text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/20"
                                  }`}
                                >
                                  {isActing && <Loader2 className="w-3 h-3 animate-spin inline mr-1" />}
                                  {hasRole ? `Remove ${role}` : `Add ${role}`}
                                </button>
                              );
                            })}
                          </div>
                        </td>

                        {/* ── Wallet adjust button ── */}
                        <td className="p-4">
                          <button
                            onClick={() => setWalletTarget(user)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/20 text-xs font-medium transition-all"
                            title="Manually add or deduct Mirai Bucks"
                          >
                            <Wallet className="w-3.5 h-3.5" />
                            Adjust ₥
                          </button>
                        </td>

                        {/* ── Delete button ── */}
                        <td className="p-4">
                          {user.email === adminEmail ? (
                            <span className="text-xs text-slate-600">Your account</span>
                          ) : (
                            <button
                              onClick={() => setDeleteTarget(user)}
                              className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all"
                              title="Delete account (requires OTP)"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </motion.div>

        <div className="text-xs text-slate-600 p-3 bg-navy-900 rounded-lg border border-navy-800">
          All wallet adjustments and deletions are recorded in the audit log at{" "}
          <a href="/admin/audit-logs" className="text-cyan-400 hover:underline">/admin/audit-logs</a>.
        </div>
      </div>
    </>
  );
}
