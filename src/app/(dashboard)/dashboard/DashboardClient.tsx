"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Wallet, Calendar, Bell, TrendingUp,
  ArrowRight, CheckCircle, Zap,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

interface Props {
  user:          any;
  wallet:        any;
  registrations: any[];
  notifications: any[];
  unreadCount:   number;
}

const fadeUp = {
  hidden:  { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: "easeOut" },
  }),
};

export default function DashboardClient({ user, wallet, registrations, notifications, unreadCount }: Props) {
  const upcomingEvents = registrations.filter(
    (r) => new Date(r.eventDate) > new Date()
  );
  const pastEvents = registrations.filter(
    (r) => new Date(r.eventDate) <= new Date()
  );

  const stats = [
    {
      label:  "Wallet Balance",
      value:  `₥${(wallet?.wallet?.balanceMb ?? 0).toLocaleString("en-IN")}`,
      sub:    `≈ ₹${((wallet?.wallet?.balanceMb ?? 0) / 100).toFixed(2)}`,
      icon:   Wallet,
      color:  "text-cyan-400",
      bg:     "bg-cyan-500/10 border-cyan-500/20",
      glow:   "rgba(6, 182, 212, 0.1)",
      href:   "/wallet",
    },
    {
      label:  "Events Registered",
      value:  registrations.length,
      sub:    `${upcomingEvents.length} upcoming`,
      icon:   Calendar,
      color:  "text-blue-400",
      bg:     "bg-blue-500/10 border-blue-500/20",
      glow:   "rgba(14, 165, 233, 0.1)",
      href:   "/events",
    },
    {
      label:  "Notifications",
      value:  unreadCount,
      sub:    "unread",
      icon:   Bell,
      color:  "text-purple-400",
      bg:     "bg-purple-500/10 border-purple-500/20",
      glow:   "rgba(168, 85, 247, 0.1)",
      href:   "/notifications",
    },
    {
      label:  "Events Attended",
      value:  pastEvents.length,
      sub:    "completed",
      icon:   TrendingUp,
      color:  "text-green-400",
      bg:     "bg-green-500/10 border-green-500/20",
      glow:   "rgba(16, 185, 129, 0.1)",
      href:   "/archive",
    },
  ];

  return (
    <div className="space-y-8">

      {/* Welcome header */}
      <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp}>
        <p className="hud-label mb-2">Dashboard Overview</p>
        <h1 className="text-3xl font-bold text-white display-heading text-xl glitch-text">
          Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
        </h1>
        <p className="text-slate-500 mt-1 text-sm font-mono">
          System status: <span className="text-green-400">● Online</span> · {format(new Date(), "dd MMM yyyy, HH:mm")}
        </p>
      </motion.div>

      {/* Stats grid — perspective cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div key={stat.label} custom={i + 1} initial="hidden" animate="visible" variants={fadeUp}>
              <Link href={stat.href}>
                <div className="hud-card perspective-card p-5 cursor-pointer group">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-2.5 rounded-lg border ${stat.bg} clip-cyber-sm`}>
                      <Icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                  </div>
                  <div className="text-2xl font-bold text-white tabular-nums font-orbitron">{stat.value}</div>
                  <div className="text-sm font-medium text-slate-300 mt-0.5">{stat.label}</div>
                  <div className="text-xs text-slate-500 mt-0.5 font-mono">{stat.sub}</div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Upcoming events */}
        <motion.div custom={5} initial="hidden" animate="visible" variants={fadeUp}>
          <div className="hud-card p-5 scan-overlay">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-white display-heading text-xs">Upcoming Events</h2>
              <Link href="/events" className="text-xs text-cyan-400 hover:text-cyan-300 neon-underline font-mono">
                View all →
              </Link>
            </div>
            {upcomingEvents.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-10 h-10 text-slate-700 mx-auto mb-2" />
                <p className="text-sm text-slate-500 font-mono">No upcoming events</p>
                <Link href="/events" className="text-xs text-cyan-400 hover:underline mt-1 block neon-underline">
                  Browse events →
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingEvents.slice(0, 3).map((reg) => (
                  <Link key={reg.registrationId} href={`/events/${reg.eventId}`}>
                    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-navy-800/60 transition-colors border border-transparent hover:border-cyan-500/10 group">
                      {/* Neon left bar */}
                      <div className="w-[3px] h-10 rounded-full bg-cyan-400/30 group-hover:bg-cyan-400 transition-colors" style={{ boxShadow: "0 0 6px rgba(6,182,212,0.3)" }} />
                      <div className="w-10 h-10 rounded-lg bg-navy-800 border border-navy-700/60 flex flex-col items-center justify-center flex-shrink-0 clip-cyber-sm">
                        <span className="text-[10px] font-bold text-cyan-400 uppercase leading-none font-mono">
                          {format(new Date(reg.eventDate), "MMM")}
                        </span>
                        <span className="text-sm font-bold text-white leading-tight font-orbitron">
                          {format(new Date(reg.eventDate), "d")}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{reg.title}</p>
                        <p className="text-xs text-slate-500 font-mono">
                          {format(new Date(reg.eventDate), "HH:mm")}
                        </p>
                      </div>
                      <span className="badge-green flex-shrink-0">
                        <CheckCircle className="w-3 h-3" /> Registered
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Recent transactions */}
        <motion.div custom={6} initial="hidden" animate="visible" variants={fadeUp}>
          <div className="hud-card p-5 scan-overlay">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-white display-heading text-xs">Recent Transactions</h2>
              <Link href="/wallet" className="text-xs text-cyan-400 hover:text-cyan-300 neon-underline font-mono">
                View all →
              </Link>
            </div>
            {!wallet?.transactions?.length ? (
              <div className="text-center py-8">
                <Wallet className="w-10 h-10 text-slate-700 mx-auto mb-2" />
                <p className="text-sm text-slate-500 font-mono">No transactions yet</p>
                <Link href="/wallet" className="text-xs text-cyan-400 hover:underline mt-1 block neon-underline">
                  Add Mirai Bucks →
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {wallet.transactions.slice(0, 5).map((tx: any) => (
                  <div key={tx.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-navy-800/40 transition-colors">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 clip-cyber-sm
                      ${tx.amountMb > 0 ? "bg-green-500/10 border border-green-500/20" : "bg-red-500/10 border border-red-500/20"}`}>
                      <Zap className={`w-4 h-4 ${tx.amountMb > 0 ? "text-green-400" : "text-red-400"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-300 truncate">{tx.description}</p>
                      <p className="text-xs text-slate-600 font-mono">
                        {formatDistanceToNow(new Date(tx.createdAt), { addSuffix: true })}
                      </p>
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
      </div>

      {/* Recent notifications */}
      {notifications.length > 0 && (
        <motion.div custom={7} initial="hidden" animate="visible" variants={fadeUp}>
          <div className="hud-card p-5 scan-overlay">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-white flex items-center gap-2 display-heading text-xs">
                Notifications
                {unreadCount > 0 && (
                  <span className="badge-cyan">{unreadCount} new</span>
                )}
              </h2>
              <Link href="/notifications" className="text-xs text-cyan-400 hover:text-cyan-300 neon-underline font-mono">
                View all →
              </Link>
            </div>
            <div className="space-y-2">
              {notifications.slice(0, 4).map((notif: any) => (
                <div key={notif.id}
                  className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                    !notif.isRead ? "bg-cyan-500/5 border border-cyan-500/10" : "hover:bg-navy-800/40"
                  }`}>
                  <div className={`mt-1.5 flex-shrink-0 ${!notif.isRead ? "pulse-dot" : "w-2 h-2 rounded-full bg-slate-700"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">{notif.title}</p>
                    <p className="text-xs text-slate-500">{notif.body}</p>
                  </div>
                  <span className="text-xs text-slate-600 flex-shrink-0 font-mono">
                    {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
