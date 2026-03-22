"use client";
import { useState, useEffect, use } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Users, ArrowLeft, Trash2, UserPlus, Loader2, Search, CheckCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

export default function EventRegistrationsPage({ params }: { params: Promise<{ id: string }> }) {
  // Next.js 15: params is a Promise — unwrap with React.use()
  const { id } = use(params);

  const [registrations, setRegistrations] = useState<any[]>([]);
  const [allUsers,       setAllUsers]       = useState<any[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [acting,         setActing]         = useState<string | null>(null);
  const [showAddUser,    setShowAddUser]    = useState(false);
  const [userSearch,     setUserSearch]     = useState("");
  const [eventTitle,     setEventTitle]     = useState("");

  const csrf = () =>
    document.cookie.split(";").find((c) => c.trim().startsWith("csrf_token="))?.split("=")[1];

  const fetchData = async () => {
    const [regsRes, usersRes, eventRes] = await Promise.all([
      fetch(`/api/admin/events/${id}/registrations`),
      fetch("/api/admin/users?limit=200"),
      fetch(`/api/events/${id}`),
    ]);
    const [regs, usersData, eventData] = await Promise.all([
      regsRes.json(), usersRes.json(), eventRes.json(),
    ]);
    setRegistrations(regs.data ?? []);
    setAllUsers(usersData.data ?? []);
    setEventTitle(eventData.data?.title ?? "Event");
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [id]);

  const handleRemove = async (userId: string, userName: string) => {
    if (!confirm(`Remove ${userName || "this user"} from the event?`)) return;
    setActing("remove:" + userId);
    const res = await fetch(`/api/admin/events/${id}/registrations`, {
      method:  "DELETE",
      headers: { "Content-Type": "application/json", ...(csrf() ? { "x-csrf-token": csrf()! } : {}) },
      body:    JSON.stringify({ userId }),
    });
    const data = await res.json();
    if (!res.ok) { toast.error(data.error); }
    else { toast.success("User removed from event."); fetchData(); }
    setActing(null);
  };

  const handleAdd = async (userId: string, userName: string) => {
    setActing("add:" + userId);
    const res = await fetch(`/api/admin/events/${id}/registrations`, {
      method:  "POST",
      headers: { "Content-Type": "application/json", ...(csrf() ? { "x-csrf-token": csrf()! } : {}) },
      body:    JSON.stringify({ userId }),
    });
    const data = await res.json();
    if (!res.ok) { toast.error(data.error); }
    else {
      toast.success(`${userName || "User"} added to event.`);
      fetchData();
      setShowAddUser(false);
      setUserSearch("");
    }
    setActing(null);
  };

  const registeredIds     = new Set(registrations.map((r) => r.userId));
  const unregisteredUsers = allUsers.filter(
    (u) => !registeredIds.has(u.id) && !u.isDeleted &&
      (!userSearch ||
        u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.name?.toLowerCase().includes(userSearch.toLowerCase()))
  );

  return (
    <div className="space-y-6 max-w-4xl">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <Link href={`/events/${id}`}
          className="flex items-center gap-1 text-sm text-slate-400 hover:text-white mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to event
        </Link>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="page-title">Registrations</h1>
            <p className="text-slate-400 mt-1 text-sm">{eventTitle}</p>
          </div>
          <button onClick={() => setShowAddUser((v) => !v)} className="btn-neon">
            <UserPlus className="w-4 h-4" />
            {showAddUser ? "Cancel" : "Add user manually"}
          </button>
        </div>
      </motion.div>

      {/* Add user panel */}
      {showAddUser && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          <div className="glass-card p-5">
            <h3 className="font-medium text-white mb-3 flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-cyan-400" /> Add user to event
            </h3>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input value={userSearch} onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search by name or email..." className="input-dark pl-10" autoFocus />
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {unregisteredUsers.length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-4">
                  {userSearch ? "No matching users found" : "All users are already registered"}
                </p>
              ) : (
                unregisteredUsers.slice(0, 20).map((u) => (
                  <div key={u.id} className="flex items-center justify-between p-3 rounded-xl bg-navy-800 hover:bg-navy-700 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-600 to-blue-700 flex items-center justify-center">
                        <span className="text-xs font-bold text-white">{u.email?.[0]?.toUpperCase()}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{u.name ?? "—"}</p>
                        <p className="text-xs text-slate-500">{u.email}</p>
                      </div>
                    </div>
                    <button onClick={() => handleAdd(u.id, u.name ?? u.email)} disabled={!!acting}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/20 text-xs font-medium transition-all disabled:opacity-50">
                      {acting === "add:" + u.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <UserPlus className="w-3 h-3" />}
                      Add
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Registrations list */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="glass-card overflow-hidden">
          <div className="p-4 border-b border-navy-800 flex items-center justify-between">
            <h2 className="font-medium text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-400" />
              {registrations.length} registered
            </h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
            </div>
          ) : registrations.length === 0 ? (
            <div className="text-center py-16">
              <Users className="w-12 h-12 text-slate-700 mx-auto mb-3" />
              <p className="text-slate-400">No registrations yet</p>
            </div>
          ) : (
            <div className="divide-y divide-navy-800">
              {registrations.map((reg, i) => (
                <motion.div key={reg.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
                  <div className="flex items-center justify-between p-4 hover:bg-navy-800/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-600 to-blue-700 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-white">
                          {reg.userEmail?.[0]?.toUpperCase() ?? "U"}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{reg.userName ?? "—"}</p>
                        <p className="text-xs text-slate-500">{reg.userEmail}</p>
                        <p className="text-xs text-slate-600 mt-0.5">
                          Registered {reg.registeredAt
                            ? formatDistanceToNow(new Date(reg.registeredAt), { addSuffix: true })
                            : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-end gap-1">
                        <span className={reg.status === "confirmed" ? "badge-green" : "badge-amber"}>
                          <CheckCircle className="w-3 h-3" /> {reg.status}
                        </span>
                        {reg.amountPaidMb > 0 && (
                          <span className="badge-cyan text-xs">₥{reg.amountPaidMb.toLocaleString()}</span>
                        )}
                      </div>
                      <button
                        onClick={() => handleRemove(reg.userId, reg.userName ?? reg.userEmail)}
                        disabled={!!acting}
                        className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all disabled:opacity-50"
                        title="Remove from event"
                      >
                        {acting === "remove:" + reg.userId
                          ? <Loader2 className="w-4 h-4 animate-spin" />
                          : <Trash2 className="w-4 h-4" />
                        }
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      <div className="text-xs text-slate-600 p-3 bg-navy-900 rounded-lg border border-navy-800">
        All manual registration changes (add/remove) are recorded in the audit log at{" "}
        <Link href="/admin/audit-logs" className="text-cyan-400 hover:underline">/admin/audit-logs</Link>.
      </div>
    </div>
  );
}