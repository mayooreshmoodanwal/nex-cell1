"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Linkedin, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { fetchWithAuth } from "@/lib/fetch-with-auth";
import { useRouter } from "next/navigation";

export default function MembersDirectoryPage() {
  const router = useRouter();
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState<any>(null);

  useEffect(() => {
    fetchWithAuth("/api/users/me")
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.data) {
          setMe(data.data);
          const roles = data.data.roles || [];
          if ((roles.includes("member") || roles.includes("admin")) && !data.data.linkedinUrl) {
             toast("Complete your profile", {
                description: "Add your LinkedIn profile to appear properly in the directory.",
                 action: {
                   label: "Go to Profile",
                   onClick: () => router.push("/profile")
                 },
                 duration: 10000,
             });
          }
        }
      })
      .catch(() => {});

    fetch("/api/members")
      .then(res => res.json())
      .then(data => {
        setMembers(data.data || []);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        toast.error("Failed to load members directory");
      });
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="text-center space-y-3">
        <p className="hud-label">Team Directory</p>
        <h1 className="display-heading text-2xl md:text-3xl text-white glitch-text">
          Our <span className="gradient-text">Members</span>
        </h1>
        <p className="text-slate-500 text-sm max-w-2xl mx-auto font-mono">
          The team driving innovation at NexCell · Mirai School of Technology
        </p>
      </div>

      {members.length === 0 ? (
        <div className="text-center text-slate-500 py-20 hud-card">
          <UserIcon className="w-12 h-12 text-slate-700 mx-auto mb-3" />
          <p className="font-mono text-sm">No members listed in the directory yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {members.map((member, idx) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
            >
              <div className="hud-card perspective-card overflow-hidden group flex flex-col h-full">
                {/* Photo & Header Section */}
                <div className="p-5 pb-0 flex gap-4">
                  <div className="relative flex-shrink-0">
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-navy-950 flex items-center justify-center border border-navy-800/60 clip-cyber">
                      {member.avatarUrl ? (
                        <img src={member.avatarUrl} alt={member.name} className="w-full h-full object-cover" />
                      ) : (
                        <UserIcon className="w-7 h-7 text-slate-600" />
                      )}
                    </div>
                    {/* Neon ring effect on hover */}
                    <div className="absolute inset-[-3px] rounded-xl border border-cyan-400/0 group-hover:border-cyan-400/30 transition-colors pointer-events-none" />
                  </div>
                  <div className="flex flex-col justify-center pt-1">
                    <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors leading-tight">
                      {member.name || "Anonymous Member"}
                    </h3>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {member.directoryRole ? (
                        <span className="text-[10px] font-medium text-cyan-400 font-mono uppercase tracking-wider bg-cyan-400/10 px-2 py-0.5 rounded clip-cyber-sm">
                          {member.directoryRole}
                        </span>
                      ) : (
                        member.roles?.map((r: string) => (
                          <span key={r} className="text-[10px] font-medium text-cyan-400 font-mono uppercase tracking-wider bg-cyan-400/10 px-2 py-0.5 rounded">
                            {r === 'admin' ? 'Admin' : r === 'treasurer' ? 'Treasurer' : r === 'member' ? 'Core Member' : 'Participant'}
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Bio block */}
                <div className="p-5 mt-3 bg-navy-950/30 flex-grow relative border-t border-navy-800/50">
                  <p className="text-sm text-slate-400 leading-relaxed pr-10 line-clamp-3">
                    {member.bio || "A member of the NexCell community."}
                  </p>
                  
                  {member.linkedinUrl && (
                    <Link href={member.linkedinUrl} target="_blank" rel="noopener noreferrer" 
                      className="absolute bottom-5 right-5 p-2 bg-blue-600/20 hover:bg-blue-600 border border-blue-500/30 hover:border-blue-500 rounded-lg text-blue-400 hover:text-white transition-all hover:-translate-y-1 hover:shadow-[0_0_15px_rgba(37,99,235,0.4)]">
                      <Linkedin className="w-4 h-4" />
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
