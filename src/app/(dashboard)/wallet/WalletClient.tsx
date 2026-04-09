"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Wallet, ArrowUpRight, ArrowDownLeft, Plus, Clock, CheckCircle, XCircle, Upload } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { toast } from "sonner";

const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.35 } }) };

export default function WalletClient({ walletData, paymentRequests }: any) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ amountInr: "", upiTransactionId: "", proofUrl: "" });
  const [submitting, setSubmitting] = useState(false);

  const balance = walletData?.wallet?.balanceMb ?? 0;
  const transactions = walletData?.transactions ?? [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const csrfToken = document.cookie.split(";").find(c => c.trim().startsWith("csrf_token="))?.split("=")[1];
    try {
      const res = await fetch("/api/wallet/payment-request", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(csrfToken ? { "x-csrf-token": csrfToken } : {}) },
        body: JSON.stringify({ amountInr: Number(form.amountInr), upiTransactionId: form.upiTransactionId, proofUrl: form.proofUrl }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }
      toast.success("Payment request submitted for verification!");
      setShowForm(false);
      setForm({ amountInr: "", upiTransactionId: "", proofUrl: "" });
    } catch { toast.error("Network error. Please try again."); }
    finally { setSubmitting(false); }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = { pending: "badge-amber", approved: "badge-green", rejected: "badge-red" };
    return <span className={map[status] ?? "badge-amber"}>{status}</span>;
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp}>
        <p className="hud-label mb-2">Finance</p>
        <h1 className="display-heading text-xl text-white glitch-text">Wallet</h1>
        <p className="text-slate-500 mt-1 text-sm font-mono">Mirai Bucks balance · Transaction history</p>
      </motion.div>

      {/* Balance card — 3D perspective with neon border */}
      <motion.div custom={1} initial="hidden" animate="visible" variants={fadeUp}>
        <div className="hud-card perspective-card relative overflow-hidden p-6 scan-overlay">
          {/* Ambient glow */}
          <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ background: "radial-gradient(ellipse at top right, rgba(6,182,212,0.6) 0%, transparent 60%)" }} />
          <div className="relative">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 clip-cyber-sm">
                <Wallet className="w-5 h-5 text-cyan-400" />
              </div>
              <span className="hud-label text-[9px]">Total Balance</span>
            </div>
            <div className="text-5xl font-black text-white mb-1 font-orbitron" style={{ letterSpacing: "-0.02em" }}>
              <span className="text-cyan-400">₥</span>{balance.toLocaleString("en-IN")}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Add MB form */}
      {showForm && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="hud-card p-5 scan-overlay">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2 display-heading text-xs">
            <Plus className="w-4 h-4 text-cyan-400" /> Submit Payment Request
          </h3>
          <p className="text-sm text-slate-400 mb-4 p-3 bg-amber-500/5 border border-amber-500/15 rounded-lg font-mono text-xs">
            Pay via UPI and submit the screenshot + transaction ID for verification by a treasurer.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[10px] font-medium text-slate-400 mb-1.5 block font-mono uppercase tracking-wider">Amount (INR) *</label>
              <input type="number" min="1" max="500" required value={form.amountInr}
                onChange={e => setForm(f => ({ ...f, amountInr: e.target.value }))}
                className="input-dark" placeholder="Enter amount in ₹ (max ₹500 per request)" />
              {form.amountInr && <p className="text-xs text-cyan-400 mt-1 font-mono">= ₥{(Number(form.amountInr) * 100).toLocaleString()} Mirai Bucks</p>}
            </div>
            <div>
              <label className="text-[10px] font-medium text-slate-400 mb-1.5 block font-mono uppercase tracking-wider">UPI Transaction ID *</label>
              <input type="text" required value={form.upiTransactionId}
                onChange={e => setForm(f => ({ ...f, upiTransactionId: e.target.value }))}
                className="input-dark" placeholder="e.g. 123456789012" />
            </div>
            <div>
              <label className="text-[10px] font-medium text-slate-400 mb-1.5 block font-mono uppercase tracking-wider">Payment Screenshot URL *</label>
              <input type="url" required value={form.proofUrl}
                onChange={e => setForm(f => ({ ...f, proofUrl: e.target.value }))}
                className="input-dark" placeholder="Upload to Cloudinary and paste URL here" />
              <p className="text-[10px] text-slate-600 mt-1 font-mono">Tip: Use /profile to upload images via our uploader</p>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={submitting} className="cyber-btn flex-1 disabled:opacity-50">
                <span>{submitting ? "Submitting..." : "Submit Request"}</span>
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-ghost">Cancel</button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Transactions */}
      <motion.div custom={2} initial="hidden" animate="visible" variants={fadeUp}>
        <div className="hud-card p-5 scan-overlay">
          <h2 className="font-semibold text-white mb-4 display-heading text-xs">Transaction History</h2>
          {transactions.length === 0 ? (
            <div className="text-center py-10 text-slate-500 font-mono text-sm">No transactions yet</div>
          ) : (
            <div className="space-y-1">
              {transactions.map((tx: any) => (
                <div key={tx.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-navy-800/40 transition-colors group">
                  <div className={`p-2 rounded-lg flex-shrink-0 clip-cyber-sm ${tx.amountMb > 0 ? "bg-green-500/10 border border-green-500/20" : "bg-red-500/10 border border-red-500/20"}`}>
                    {tx.amountMb > 0 ? <ArrowDownLeft className="w-4 h-4 text-green-400" /> : <ArrowUpRight className="w-4 h-4 text-red-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{tx.description}</p>
                    <p className="text-xs text-slate-500 font-mono">{format(new Date(tx.createdAt), "dd MMM yyyy, HH:mm")}</p>
                  </div>
                  <span className={`text-sm font-bold tabular-nums flex-shrink-0 font-orbitron ${tx.amountMb > 0 ? "text-green-400" : "text-red-400"}`}>
                    {tx.amountMb > 0 ? "+" : ""}₥{Math.abs(tx.amountMb).toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Payment requests */}
      {paymentRequests.length > 0 && (
        <motion.div custom={3} initial="hidden" animate="visible" variants={fadeUp}>
          <div className="hud-card p-5 scan-overlay">
            <h2 className="font-semibold text-white mb-4 display-heading text-xs">Payment Requests</h2>
            <div className="space-y-3">
              {paymentRequests.map((req: any) => (
                <div key={req.id} className="flex items-center justify-between p-3 rounded-lg bg-navy-800/40 border border-navy-700/40 hover:border-cyan-500/15 transition-colors">
                  <div>
                    <p className="text-sm text-white font-mono">₹{req.amountInr} → <span className="font-orbitron">₥{req.amountMb.toLocaleString()}</span></p>
                    <p className="text-xs text-slate-500 font-mono">UPI: {req.upiTransactionId}</p>
                    <p className="text-xs text-slate-600 font-mono">{formatDistanceToNow(new Date(req.createdAt), { addSuffix: true })}</p>
                  </div>
                  {statusBadge(req.status)}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
