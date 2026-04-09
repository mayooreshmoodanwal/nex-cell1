"use client";

import { motion } from "framer-motion";
import { Award, Download, Calendar, User, ExternalLink } from "lucide-react";
import { useState } from "react";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07 } }),
};

interface CertificateItem {
  id:             string;
  title:          string;
  description:    string | null;
  certificateUrl: string;
  issuedAt:       string;
  eventId:        string | null;
  eventTitle:     string | null;
  issuerName:     string;
  userName:       string | null;
  userEmail:      string;
}

export default function CertificatesClient({
  certificates,
  userRoles,
}: {
  certificates: CertificateItem[];
  userRoles: string[];
}) {
  const [filter, setFilter] = useState<"all" | "event" | "standalone">("all");

  const filtered = certificates.filter((c) => {
    if (filter === "event")      return c.eventId !== null;
    if (filter === "standalone") return c.eventId === null;
    return true;
  });

  const handleDownload = async (url: string, title: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      const ext = url.split(".").pop()?.split("?")[0] || "pdf";
      link.download = `${title.replace(/[^a-zA-Z0-9]/g, "_")}.${ext}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      // Fallback: open in new tab
      window.open(url, "_blank");
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp}>
        <p className="hud-label mb-2">Achievements</p>
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 clip-cyber-sm">
            <Award className="w-5 h-5 text-amber-400" />
          </div>
          <h1 className="display-heading text-xl text-white">My Certificates</h1>
        </div>
        <p className="text-slate-500 text-sm font-mono">Your earned certificates and achievements</p>
      </motion.div>

      {/* Filters */}
      <motion.div custom={1} initial="hidden" animate="visible" variants={fadeUp}>
        <div className="flex gap-2">
          {(["all", "event", "standalone"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-xs font-medium uppercase tracking-wider transition-all duration-200 font-mono ${
                filter === f
                  ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30"
                  : "bg-navy-800/60 text-slate-400 border border-navy-700/40 hover:text-white hover:border-navy-600"
              }`}
            >
              {f === "all" ? "All" : f === "event" ? "Event-Linked" : "Standalone"}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Certificates Grid */}
      {filtered.length === 0 ? (
        <motion.div custom={2} initial="hidden" animate="visible" variants={fadeUp}>
          <div className="hud-card p-12 text-center">
            <div className="inline-flex p-4 rounded-2xl bg-navy-800/60 border border-navy-700/40 mb-5">
              <Award className="w-10 h-10 text-slate-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-400 mb-2">No Certificates Yet</h3>
            <p className="text-sm text-slate-600 font-mono">
              {filter === "all"
                ? "Participate in events to earn certificates!"
                : `No ${filter} certificates found.`}
            </p>
          </div>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((cert, i) => (
            <motion.div
              key={cert.id}
              custom={i + 2}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
            >
              <div className="hud-card perspective-card overflow-hidden group">
                {/* Certificate Preview */}
                <div className="relative h-44 bg-gradient-to-br from-navy-800 to-navy-900 overflow-hidden">
                  {cert.certificateUrl.match(/\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/i) ? (
                    <img
                      src={cert.certificateUrl}
                      alt={cert.title}
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <Award className="w-12 h-12 text-cyan-400/40 mx-auto mb-2" />
                        <p className="text-xs text-slate-500 font-mono uppercase tracking-wider">Certificate Document</p>
                      </div>
                    </div>
                  )}
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-900/90 via-transparent to-transparent" />

                  {/* Badge */}
                  <div className="absolute top-3 right-3">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                      cert.eventId
                        ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                        : "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                    }`}>
                      {cert.eventId ? "Event" : "Standalone"}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="text-base font-bold text-white mb-1.5 line-clamp-2">{cert.title}</h3>

                  {cert.description && (
                    <p className="text-xs text-slate-400 mb-3 line-clamp-2">{cert.description}</p>
                  )}

                  {cert.eventTitle && (
                    <div className="flex items-center gap-1.5 mb-2">
                      <Calendar className="w-3 h-3 text-cyan-400/60" />
                      <span className="text-xs text-cyan-400/80 font-mono truncate">{cert.eventTitle}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-1.5 mb-4">
                    <User className="w-3 h-3 text-slate-500" />
                    <span className="text-[11px] text-slate-500 font-mono">
                      Issued by {cert.issuerName} · {new Date(cert.issuedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDownload(cert.certificateUrl, cert.title)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 text-xs font-semibold uppercase tracking-wider hover:bg-cyan-500/20 hover:border-cyan-500/40 transition-all duration-200"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download
                    </button>
                    <a
                      href={cert.certificateUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center px-3 py-2.5 rounded-lg bg-navy-800/60 border border-navy-700/40 text-slate-400 text-xs hover:text-white hover:border-navy-600 transition-all duration-200"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
