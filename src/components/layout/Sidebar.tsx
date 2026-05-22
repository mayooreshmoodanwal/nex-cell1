"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard, Calendar, Archive, Wallet,
  Bell, User, Settings, Users,
  Menu, X, ShieldCheck, MessageSquare, Activity, DollarSign, Award
} from "lucide-react";
import { useState } from "react";

interface SidebarUser {
  id:     string;
  email:  string;
  roles:  string[];
}

const NAV_ITEMS = [
  {
    group: "MAIN",
    items: [
      { href: "/dashboard",      icon: LayoutDashboard, label: "Dashboard",     roles: [] },
      { href: "/events",         icon: Calendar,         label: "Events",       roles: [] },
      { href: "/members",        icon: Users,            label: "Members",      roles: [] },
      { href: "/archive",        icon: Archive,          label: "Archive",      roles: [] },
      { href: "/certificates",   icon: Award,            label: "Certificates", roles: [] },
      { href: "/wallet",         icon: Wallet,           label: "Wallet",       roles: [] },
      { href: "/notifications",  icon: Bell,             label: "Notifications",roles: [] },
    ],
  },
  {
    group: "TREASURY",
    items: [
      { href: "/admin/treasurer",icon: DollarSign,       label: "Finances",     roles: ["treasurer", "admin"] },
    ],
  },
  {
    group: "COMMAND",
    items: [
      { href: "/admin",              icon: ShieldCheck,      label: "Admin Panel",  roles: ["admin"] },
      { href: "/admin/users",         icon: Users,            label: "Users",        roles: ["admin"] },
      { href: "/admin/members",       icon: Users,            label: "Directory",    roles: ["admin"] },
      { href: "/admin/certificates",  icon: Award,            label: "Certificates", roles: ["admin", "member"] },
      { href: "/admin/comments",      icon: MessageSquare,    label: "Comments",     roles: ["admin"] },
      { href: "/admin/audit-logs",    icon: Activity,         label: "Audit Logs",   roles: ["admin"] },
    ],
  },
  {
    group: "ACCOUNT",
    items: [
      { href: "/profile",        icon: User,             label: "Profile",      roles: [] },
      { href: "/admin/config",   icon: Settings,         label: "Settings",     roles: ["admin"] },
    ],
  },
];

function hasAccess(userRoles: string[], requiredRoles: string[]): boolean {
  if (requiredRoles.length === 0) return true;
  return requiredRoles.some((r) => userRoles.includes(r));
}

export default function Sidebar({ user }: { user: SidebarUser }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-navy-800/80">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="relative">
            <img
              src="/logo.png"
              alt="NexCell Logo"
              width={36}
              height={36}
              className="rounded-lg relative z-10"
            />
            <div className="absolute inset-[-2px] rounded-lg border border-cyan-400/15 group-hover:border-cyan-400/30 transition-colors" />
          </div>
          <div>
            <span className="text-lg font-black text-white">Nex<span className="gradient-text">Cell</span></span>
            <p className="text-[9px] text-cyan-400/40 uppercase tracking-[0.25em] -mt-0.5 font-mono">Platform v2.0.1</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-5 overflow-y-auto no-scrollbar">
        {NAV_ITEMS.map((group) => {
          const visibleItems = group.items.filter((item) =>
            hasAccess(user.roles, item.roles)
          );
          if (visibleItems.length === 0) return null;

          return (
            <div key={group.group}>
              <p className="hud-label px-3 mb-2 text-[9px]">{group.group}</p>
              <div className="space-y-0.5">
                {visibleItems.map((item) => {
                  const Icon      = item.icon;
                  const isActive  = pathname === item.href || pathname.startsWith(item.href + "/");
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`
                        flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                        relative overflow-hidden group
                        ${isActive
                          ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                          : "text-slate-400 hover:text-white hover:bg-navy-800/60 border border-transparent"
                        }
                      `}
                    >
                      {/* Active glow bar */}
                      {isActive && (
                        <motion.div
                          layoutId="sidebar-glow"
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-cyan-400"
                          style={{ boxShadow: "0 0 12px rgba(6, 182, 212, 0.6)" }}
                        />
                      )}
                      <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-cyan-400" : "group-hover:text-cyan-400/60"} transition-colors`} />
                      <span className="neon-underline">{item.label}</span>
                      {isActive && (
                        <div className="ml-auto pulse-dot" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="p-4 border-t border-navy-800/80">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-white">
                {user.email[0].toUpperCase()}
              </span>
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-400 border-2 border-navy-900" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user.email}</p>
            <p className="text-[10px] text-cyan-400/50 capitalize font-mono tracking-wider">
              {user.roles.includes("admin") ? "ADMIN" :
               user.roles.includes("treasurer") ? "TREASURER" :
               user.roles.includes("member") ? "MEMBER" : "PARTICIPANT"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-screen w-64 bg-navy-900/95 backdrop-blur-md border-r border-navy-800/60 z-40">
        <SidebarContent />
        {/* Sidebar scan line */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute left-0 right-0 h-[1px] opacity-[0.07]"
            style={{
              background: "linear-gradient(90deg, transparent, rgba(6,182,212,0.5), transparent)",
              animation: "scan-line 5s linear infinite",
            }}
          />
        </div>
      </aside>

      {/* Mobile menu button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-navy-900 border border-navy-800 text-white"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="lg:hidden fixed inset-0 z-50 flex"
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <motion.aside
            initial={{ x: -256 }}
            animate={{ x: 0 }}
            exit={{ x: -256 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="relative w-64 h-full bg-navy-900 border-r border-navy-800 z-10"
          >
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-navy-800"
            >
              <X className="w-4 h-4" />
            </button>
            <SidebarContent />
          </motion.aside>
        </motion.div>
      )}
    </>
  );
}
