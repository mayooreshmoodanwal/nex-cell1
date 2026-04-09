"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { Users, Calendar, FileText, DollarSign, ArrowRight, Shield, Settings, Award } from "lucide-react";

const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07 } }) };

export default function AdminDashboardClient({ stats }: { stats: any }) {
  const statCards = [
    { label: "Total Users",         value: stats.users,         icon: Users,    color: "text-blue-400",   bg: "bg-blue-500/10 border-blue-500/20" },
    { label: "Total Events",        value: stats.events,        icon: Calendar, color: "text-cyan-400",   bg: "bg-cyan-500/10 border-cyan-500/20" },
    { label: "Registrations",       value: stats.registrations, icon: FileText, color: "text-green-400",  bg: "bg-green-500/10 border-green-500/20" },
    { label: "₥ Circulation",       value: `₥${stats.totalMb.toLocaleString()}`, icon: DollarSign, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
  ];

  const quickLinks = [
    { href: "/admin/users",         icon: Users,     label: "Manage Users",       desc: "View, assign roles, credit wallets" },
    { href: "/admin/certificates",   icon: Award,     label: "Certificate Manager",desc: "Issue and manage certificates" },
    { href: "/admin/comments",       icon: FileText,  label: "Comment Moderation", desc: "Approve or reject pending comments" },
    { href: "/admin/treasurer",      icon: DollarSign,label: "Financial Panel",    desc: "Payment requests and expenses" },
    { href: "/admin/audit-logs",     icon: Shield,    label: "Audit Logs",         desc: "Full action history" },
    { href: "/admin/config",         icon: Settings,  label: "Platform Settings",  desc: "Config, limits, toggles" },
  ];

  return (
    <div className="space-y-8">
      <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp}>
        <p className="hud-label mb-2">Admin</p>
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 clip-cyber-sm">
            <Shield className="w-5 h-5 text-red-400" />
          </div>
          <h1 className="display-heading text-xl text-white glitch-text">Command Center</h1>
        </div>
        <p className="text-slate-500 text-sm font-mono">Full platform control · System oversight</p>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div key={s.label} custom={i + 1} initial="hidden" animate="visible" variants={fadeUp}>
              <div className="hud-card perspective-card p-5">
                <div className={`inline-flex p-2.5 rounded-lg border mb-3 ${s.bg} clip-cyber-sm`}>
                  <Icon className={`w-5 h-5 ${s.color}`} />
                </div>
                <div className="text-2xl font-bold text-white tabular-nums font-orbitron">{s.value}</div>
                <div className="text-sm text-slate-400 mt-0.5 font-mono text-xs">{s.label}</div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <motion.div custom={5} initial="hidden" animate="visible" variants={fadeUp}>
        <p className="hud-label mb-4">Quick Access</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link key={link.href} href={link.href}>
                <div className="hud-card perspective-card p-5 cursor-pointer group">
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 rounded-lg bg-navy-800/60 border border-navy-700/60 clip-cyber-sm">
                      <Icon className="w-4 h-4 text-cyan-400" />
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                  </div>
                  <p className="font-medium text-white text-sm">{link.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5 font-mono">{link.desc}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
