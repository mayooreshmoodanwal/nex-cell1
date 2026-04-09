"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Award, Trash2, Plus, Download, Calendar, User, Search,
  X, ExternalLink, Filter, FileText, Upload, Link,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { fetchWithAuth } from "@/lib/fetch-with-auth";

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
  userId:         string;
}

interface EventOption {
  id:        string;
  title:     string;
  eventDate: string;
}

interface UserOption {
  id:    string;
  name:  string | null;
  email: string;
}

export default function AdminCertificatesClient({
  certificates: initialCerts,
  totalCertificates,
  events,
  users,
}: {
  certificates:      CertificateItem[];
  totalCertificates: number;
  events:            EventOption[];
  users:             UserOption[];
}) {
  const [certificates, setCertificates] = useState(initialCerts);
  const [filter, setFilter]             = useState<"all" | "event" | "standalone">("all");
  const [eventFilter, setEventFilter]   = useState<string>("");
  const [searchQuery, setSearchQuery]   = useState("");
  const [showModal, setShowModal]       = useState(false);
  const [deleting, setDeleting]         = useState<string | null>(null);

  // Issue modal state
  const [formData, setFormData] = useState({
    userId:         "",
    type:           "standalone" as "standalone" | "event",
    eventId:        "",
    title:          "",
    description:    "",
    certificateUrl: "",
  });
  const [issuing, setIssuing]         = useState(false);
  const [userSearch, setUserSearch]   = useState("");
  const [uploadMode, setUploadMode]   = useState<"file" | "url">("file");
  const [uploading, setUploading]     = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState("");

  // Filter certificates
  const filtered = certificates.filter((c) => {
    // Type filter
    if (filter === "event" && c.eventId === null) return false;
    if (filter === "standalone" && c.eventId !== null) return false;
    // Event filter
    if (eventFilter && c.eventId !== eventFilter) return false;
    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        c.title.toLowerCase().includes(q) ||
        (c.userName?.toLowerCase().includes(q) ?? false) ||
        c.userEmail.toLowerCase().includes(q) ||
        (c.eventTitle?.toLowerCase().includes(q) ?? false)
      );
    }
    return true;
  });

  // Filtered users for dropdown
  const filteredUsers = userSearch
    ? users.filter(
        (u) =>
          (u.name?.toLowerCase().includes(userSearch.toLowerCase()) ?? false) ||
          u.email.toLowerCase().includes(userSearch.toLowerCase())
      ).slice(0, 10)
    : users.slice(0, 10);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this certificate? This action cannot be undone.")) return;
    setDeleting(id);
    try {
      const res = await fetchWithAuth(`/api/certificates/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error ?? "Failed to delete certificate");
        return;
      }
      setCertificates((prev) => prev.filter((c) => c.id !== id));
      toast.success("Certificate deleted");
    } catch {
      toast.error("Network error");
    } finally {
      setDeleting(null);
    }
  };

  const handleIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.userId || !formData.title || !formData.certificateUrl) {
      toast.error("Please fill all required fields");
      return;
    }
    setIssuing(true);
    try {
      const payload: Record<string, string> = {
        userId:         formData.userId,
        title:          formData.title,
        certificateUrl: formData.certificateUrl,
      };
      if (formData.description) payload.description = formData.description;
      if (formData.type === "event" && formData.eventId) payload.eventId = formData.eventId;

      const res = await fetchWithAuth("/api/certificates", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Failed to issue certificate");
        return;
      }

      toast.success("Certificate issued successfully!");
      setShowModal(false);
      setFormData({ userId: "", type: "standalone", eventId: "", title: "", description: "", certificateUrl: "" });
      setUserSearch("");

      // Refresh page to get enriched data
      window.location.reload();
    } catch {
      toast.error("Network error");
    } finally {
      setIssuing(false);
    }
  };

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
      window.open(url, "_blank");
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp}>
        <p className="hud-label mb-2">Admin</p>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 clip-cyber-sm">
                <Award className="w-5 h-5 text-amber-400" />
              </div>
              <h1 className="display-heading text-xl text-white">Certificate Manager</h1>
            </div>
            <p className="text-slate-500 text-sm font-mono">
              {totalCertificates} total certificate{totalCertificates !== 1 ? "s" : ""} issued
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="cyber-btn !py-2.5 !px-5 !text-xs"
          >
            <span className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Issue Certificate
            </span>
          </button>
        </div>
      </motion.div>

      {/* Filters Row */}
      <motion.div custom={1} initial="hidden" animate="visible" variants={fadeUp}>
        <div className="flex flex-wrap gap-3 items-center">
          {/* Type filter */}
          <div className="flex gap-1.5">
            {(["all", "event", "standalone"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-medium uppercase tracking-wider transition-all duration-200 font-mono ${
                  filter === f
                    ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30"
                    : "bg-navy-800/60 text-slate-400 border border-navy-700/40 hover:text-white hover:border-navy-600"
                }`}
              >
                {f === "all" ? "All" : f === "event" ? "Event" : "Standalone"}
              </button>
            ))}
          </div>

          {/* Event filter */}
          <select
            value={eventFilter}
            onChange={(e) => setEventFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg text-xs bg-navy-800/80 border border-navy-700/60 text-slate-300 outline-none focus:border-cyan-500/40 transition-colors font-mono"
          >
            <option value="">All Events</option>
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.title}
              </option>
            ))}
          </select>

          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search by name, email, title, event..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg text-xs bg-navy-800/80 border border-navy-700/60 text-white placeholder-slate-500 outline-none focus:border-cyan-500/40 transition-colors font-mono"
            />
          </div>
        </div>
      </motion.div>

      {/* Certificates Table */}
      {filtered.length === 0 ? (
        <motion.div custom={2} initial="hidden" animate="visible" variants={fadeUp}>
          <div className="hud-card p-12 text-center">
            <div className="inline-flex p-4 rounded-2xl bg-navy-800/60 border border-navy-700/40 mb-5">
              <Award className="w-10 h-10 text-slate-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-400 mb-2">No Certificates Found</h3>
            <p className="text-sm text-slate-600 font-mono">
              {searchQuery || filter !== "all" || eventFilter
                ? "Try adjusting your filters."
                : "Issue your first certificate to get started."}
            </p>
          </div>
        </motion.div>
      ) : (
        <motion.div custom={2} initial="hidden" animate="visible" variants={fadeUp}>
          <div className="hud-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th className="pl-5">Recipient</th>
                    <th>Certificate</th>
                    <th>Type</th>
                    <th>Issued By</th>
                    <th>Date</th>
                    <th className="pr-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((cert) => (
                    <tr key={cert.id}>
                      <td className="pl-5">
                        <div>
                          <p className="text-sm font-medium text-white">{cert.userName ?? "—"}</p>
                          <p className="text-[11px] text-slate-500 font-mono">{cert.userEmail}</p>
                        </div>
                      </td>
                      <td>
                        <p className="text-sm text-white font-medium line-clamp-1">{cert.title}</p>
                        {cert.description && (
                          <p className="text-[11px] text-slate-500 line-clamp-1">{cert.description}</p>
                        )}
                      </td>
                      <td>
                        {cert.eventId ? (
                          <span className="badge-cyan text-[10px]">
                            <Calendar className="w-3 h-3" />
                            {cert.eventTitle ?? "Event"}
                          </span>
                        ) : (
                          <span className="badge-purple text-[10px]">
                            <FileText className="w-3 h-3" />
                            Standalone
                          </span>
                        )}
                      </td>
                      <td>
                        <span className="text-xs text-slate-400 font-mono">{cert.issuerName}</span>
                      </td>
                      <td>
                        <span className="text-xs text-slate-400 font-mono tabular-nums">
                          {new Date(cert.issuedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                        </span>
                      </td>
                      <td className="pr-5">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleDownload(cert.certificateUrl, cert.title)}
                            className="p-1.5 rounded-md bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 transition-colors"
                            title="Download"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          <a
                            href={cert.certificateUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-md bg-navy-800/60 text-slate-400 hover:text-white transition-colors"
                            title="Open in new tab"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                          <button
                            onClick={() => handleDelete(cert.id)}
                            disabled={deleting === cert.id}
                            className="p-1.5 rounded-md bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      {/* Issue Certificate Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.97 }}
              transition={{ duration: 0.25 }}
              className="relative w-full max-w-lg"
            >
              <div className="hud-card p-6 scan-overlay">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 clip-cyber-sm">
                      <Award className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <h2 className="display-heading text-sm text-white">Issue Certificate</h2>
                      <p className="text-[11px] text-slate-500 font-mono">Create a new certificate for a user</p>
                    </div>
                  </div>
                  <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-navy-800 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleIssue} className="space-y-4">
                  {/* Certificate Type */}
                  <div>
                    <label className="text-xs font-medium text-slate-400 mb-1.5 block font-mono uppercase tracking-wider text-[0.65rem]">
                      Certificate Type
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setFormData((p) => ({ ...p, type: "standalone", eventId: "" }))}
                        className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                          formData.type === "standalone"
                            ? "bg-purple-500/15 text-purple-400 border border-purple-500/30"
                            : "bg-navy-800/60 text-slate-400 border border-navy-700/40"
                        }`}
                      >
                        Standalone
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData((p) => ({ ...p, type: "event" }))}
                        className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                          formData.type === "event"
                            ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30"
                            : "bg-navy-800/60 text-slate-400 border border-navy-700/40"
                        }`}
                      >
                        Event-Linked
                      </button>
                    </div>
                  </div>

                  {/* Event Selector */}
                  {formData.type === "event" && (
                    <div>
                      <label className="text-xs font-medium text-slate-400 mb-1.5 block font-mono uppercase tracking-wider text-[0.65rem]">
                        Select Event *
                      </label>
                      <select
                        value={formData.eventId}
                        onChange={(e) => setFormData((p) => ({ ...p, eventId: e.target.value }))}
                        required
                        className="input-dark text-xs"
                      >
                        <option value="">Choose an event...</option>
                        {events.map((ev) => (
                          <option key={ev.id} value={ev.id}>
                            {ev.title} — {new Date(ev.eventDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Recipient */}
                  <div>
                    <label className="text-xs font-medium text-slate-400 mb-1.5 block font-mono uppercase tracking-wider text-[0.65rem]">
                      Recipient *
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={userSearch}
                        onChange={(e) => {
                          setUserSearch(e.target.value);
                          setFormData((p) => ({ ...p, userId: "" }));
                        }}
                        className="input-dark pl-10 text-xs"
                      />
                    </div>
                    {formData.userId && (
                      <div className="mt-1.5 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                        <User className="w-3 h-3 text-cyan-400" />
                        <span className="text-xs text-cyan-400 font-mono">
                          {users.find((u) => u.id === formData.userId)?.name ?? users.find((u) => u.id === formData.userId)?.email}
                        </span>
                        <button type="button" onClick={() => { setFormData((p) => ({ ...p, userId: "" })); setUserSearch(""); }} className="ml-auto">
                          <X className="w-3 h-3 text-cyan-400/60 hover:text-cyan-400" />
                        </button>
                      </div>
                    )}
                    {!formData.userId && userSearch && (
                      <div className="mt-1 max-h-36 overflow-y-auto rounded-lg bg-navy-800 border border-navy-700/60">
                        {filteredUsers.length === 0 ? (
                          <p className="px-3 py-2 text-xs text-slate-500 font-mono">No users found</p>
                        ) : (
                          filteredUsers.map((u) => (
                            <button
                              key={u.id}
                              type="button"
                              onClick={() => {
                                setFormData((p) => ({ ...p, userId: u.id }));
                                setUserSearch(u.name ?? u.email);
                              }}
                              className="w-full text-left px-3 py-2 hover:bg-navy-700/60 transition-colors"
                            >
                              <p className="text-xs text-white">{u.name ?? "—"}</p>
                              <p className="text-[10px] text-slate-500 font-mono">{u.email}</p>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>

                  {/* Title */}
                  <div>
                    <label className="text-xs font-medium text-slate-400 mb-1.5 block font-mono uppercase tracking-wider text-[0.65rem]">
                      Certificate Title *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Participation Certificate, Winner - Hackathon 2025"
                      value={formData.title}
                      onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                      required
                      className="input-dark text-xs"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="text-xs font-medium text-slate-400 mb-1.5 block font-mono uppercase tracking-wider text-[0.65rem]">
                      Description
                    </label>
                    <textarea
                      placeholder="Optional description..."
                      value={formData.description}
                      onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                      rows={2}
                      className="input-dark text-xs resize-none"
                    />
                  </div>

                  {/* Certificate File */}
                  <div>
                    <label className="text-xs font-medium text-slate-400 mb-1.5 block font-mono uppercase tracking-wider text-[0.65rem]">
                      Certificate File *
                    </label>
                    {/* Toggle: File Upload vs URL */}
                    <div className="flex gap-1.5 mb-2">
                      <button
                        type="button"
                        onClick={() => setUploadMode("file")}
                        className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all duration-200 ${
                          uploadMode === "file"
                            ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30"
                            : "bg-navy-800/60 text-slate-400 border border-navy-700/40"
                        }`}
                      >
                        <Upload className="w-3 h-3" />
                        Upload File
                      </button>
                      <button
                        type="button"
                        onClick={() => setUploadMode("url")}
                        className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all duration-200 ${
                          uploadMode === "url"
                            ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30"
                            : "bg-navy-800/60 text-slate-400 border border-navy-700/40"
                        }`}
                      >
                        <Link className="w-3 h-3" />
                        Paste URL
                      </button>
                    </div>

                    {uploadMode === "file" ? (
                      <div>
                        <label
                          className={`flex flex-col items-center justify-center w-full px-4 py-6 rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer ${
                            formData.certificateUrl
                              ? "border-cyan-500/30 bg-cyan-500/5"
                              : "border-navy-700/60 bg-navy-900/40 hover:border-cyan-500/30 hover:bg-cyan-500/5"
                          }`}
                        >
                          {uploading ? (
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
                              <span className="text-xs text-cyan-400 font-mono">Uploading...</span>
                            </div>
                          ) : formData.certificateUrl ? (
                            <div className="flex items-center gap-2">
                              <Award className="w-5 h-5 text-cyan-400" />
                              <div className="text-center">
                                <p className="text-xs text-cyan-400 font-medium">{uploadedFileName || "File uploaded"}</p>
                                <p className="text-[10px] text-slate-500 font-mono mt-0.5">Click to replace</p>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center">
                              <Upload className="w-6 h-6 text-slate-500 mx-auto mb-1.5" />
                              <p className="text-xs text-slate-400">Click to browse files</p>
                              <p className="text-[10px] text-slate-600 font-mono mt-0.5">JPG, PNG, WebP, GIF — Max 5MB</p>
                            </div>
                          )}
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              if (file.size > 5 * 1024 * 1024) {
                                toast.error("File must be under 5MB");
                                return;
                              }
                              setUploading(true);
                              setUploadedFileName(file.name);
                              try {
                                const fd = new FormData();
                                fd.append("file", file);
                                fd.append("folder", "certificates");
                                const res = await fetchWithAuth("/api/upload", {
                                  method: "POST",
                                  body: fd,
                                });
                                const data = await res.json();
                                if (!res.ok) {
                                  toast.error(data.error ?? "Upload failed");
                                  setUploadedFileName("");
                                  return;
                                }
                                setFormData((p) => ({ ...p, certificateUrl: data.data.url }));
                                toast.success("File uploaded!");
                              } catch {
                                toast.error("Upload failed");
                                setUploadedFileName("");
                              } finally {
                                setUploading(false);
                              }
                            }}
                          />
                        </label>
                      </div>
                    ) : (
                      <div>
                        <input
                          type="url"
                          placeholder="https://res.cloudinary.com/... or any direct URL"
                          value={formData.certificateUrl}
                          onChange={(e) => setFormData((p) => ({ ...p, certificateUrl: e.target.value }))}
                          className="input-dark text-xs"
                        />
                        <p className="text-[10px] text-slate-600 mt-1 font-mono">
                          Paste a direct link to the certificate image or PDF
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={issuing || !formData.userId || !formData.title || !formData.certificateUrl}
                    className="cyber-btn w-full !py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="flex items-center justify-center gap-2 text-xs">
                      {issuing ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Issuing...
                        </>
                      ) : (
                        <>
                          <Award className="w-4 h-4" />
                          Issue Certificate
                        </>
                      )}
                    </span>
                  </button>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
