"use client";
import { useState, useEffect, use } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Calendar, MapPin, Users, Image, Tag, Loader2, ArrowLeft, Zap, Trash2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router  = useRouter();

  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [deleting,   setDeleting]   = useState(false);
  const [form, setForm] = useState({
    title:                "",
    description:          "",
    shortDescription:     "",
    eventDate:            "",
    registrationDeadline: "",
    type:                 "free" as "free" | "paid_mb",
    priceMb:              "",
    maxParticipants:      "",
    venue:                "",
    imageUrl:             "",
    tags:                 "",
    isPublished:          true,
  });

  const csrf = () =>
    document.cookie.split(";").find((c) => c.trim().startsWith("csrf_token="))?.split("=")[1];

  // Format datetime-local value
  const toLocal = (iso: string) => {
    if (!iso) return "";
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  useEffect(() => {
    fetch(`/api/events/${id}`)
      .then((r) => r.json())
      .then((d) => {
        const e = d.data;
        if (!e) { toast.error("Event not found"); router.push("/events"); return; }
        setForm({
          title:                e.title ?? "",
          description:          e.description ?? "",
          shortDescription:     e.shortDescription ?? "",
          eventDate:            toLocal(e.eventDate),
          registrationDeadline: toLocal(e.registrationDeadline),
          type:                 e.type ?? "free",
          priceMb:              e.priceMb ? String(e.priceMb) : "",
          maxParticipants:      e.maxParticipants ? String(e.maxParticipants) : "",
          venue:                e.venue ?? "",
          imageUrl:             e.imageUrl ?? "",
          tags:                 e.tags?.join(", ") ?? "",
          isPublished:          e.isPublished ?? true,
        });
        setLoading(false);
      });
  }, [id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload: Record<string, unknown> = {
      title:                form.title.trim(),
      description:          form.description.trim(),
      shortDescription:     form.shortDescription.trim() || undefined,
      eventDate:            new Date(form.eventDate).toISOString(),
      registrationDeadline: new Date(form.registrationDeadline).toISOString(),
      type:                 form.type,
      venue:                form.venue.trim() || undefined,
      imageUrl:             form.imageUrl.trim() || undefined,
      isPublished:          form.isPublished,
      tags:                 form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : undefined,
    };
    if (form.type === "paid_mb" && form.priceMb) payload.priceMb = parseInt(form.priceMb);
    if (form.maxParticipants) payload.maxParticipants = parseInt(form.maxParticipants);

    try {
      const res = await fetch(`/api/events/${id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json", ...(csrf() ? { "x-csrf-token": csrf()! } : {}) },
        body:    JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Failed to save event"); return; }
      toast.success("Event updated successfully!");
      router.push(`/events/${id}`);
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this event? This cannot be undone.")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/events/${id}`, {
        method:  "DELETE",
        headers: { ...(csrf() ? { "x-csrf-token": csrf()! } : {}) },
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Failed to delete event"); return; }
      toast.success("Event deleted.");
      router.push("/events");
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  const togglePublish = async () => {
    const newVal = !form.isPublished;
    setForm((f) => ({ ...f, isPublished: newVal }));
    const res = await fetch(`/api/events/${id}`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json", ...(csrf() ? { "x-csrf-token": csrf()! } : {}) },
      body:    JSON.stringify({ isPublished: newVal }),
    });
    const data = await res.json();
    if (!res.ok) {
      setForm((f) => ({ ...f, isPublished: !newVal }));
      toast.error(data.error ?? "Failed to update visibility");
    } else {
      toast.success(newVal ? "Event published — visible to all users" : "Event unpublished — hidden from participants");
    }
  };

  const set = (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <Link href={`/events/${id}`}
          className="flex items-center gap-1 text-sm text-slate-400 hover:text-white mb-5 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to event
        </Link>

        <div className="flex items-start justify-between gap-4 flex-wrap mb-2">
          <div>
            <h1 className="page-title">Edit event</h1>
            <p className="text-slate-400 mt-1">Update event details and visibility</p>
          </div>

          {/* Publish toggle */}
          <button onClick={togglePublish}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
              form.isPublished
                ? "bg-green-500/10 text-green-400 border-green-500/30 hover:bg-green-500/20"
                : "bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20"
            }`}>
            {form.isPublished
              ? <><Eye className="w-4 h-4" /> Published</>
              : <><EyeOff className="w-4 h-4" /> Unpublished</>
            }
          </button>
        </div>

        {!form.isPublished && (
          <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs text-amber-400 mb-4">
            ⚠ This event is unpublished — only admins and members can see it. Click "Unpublished" above to make it visible to all users.
          </div>
        )}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <form onSubmit={handleSave} className="glass-card p-6 space-y-5">

          {/* Title */}
          <div>
            <label className="text-xs font-medium text-slate-400 mb-1.5 block">Event title *</label>
            <input value={form.title} onChange={set("title")} required minLength={3} maxLength={200}
              className="input-dark" />
          </div>

          {/* Short description */}
          <div>
            <label className="text-xs font-medium text-slate-400 mb-1.5 block">
              Short description <span className="text-slate-600">(shown on cards)</span>
            </label>
            <input value={form.shortDescription} onChange={set("shortDescription")} maxLength={300}
              className="input-dark" />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-medium text-slate-400 mb-1.5 block">Full description *</label>
            <textarea value={form.description} onChange={set("description")} required minLength={10} rows={5}
              className="input-dark resize-none" />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-400 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-cyan-500" /> Event date & time *
              </label>
              <input type="datetime-local" value={form.eventDate} onChange={set("eventDate")} required
                className="input-dark" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-500" /> Registration deadline *
              </label>
              <input type="datetime-local" value={form.registrationDeadline} onChange={set("registrationDeadline")} required
                className="input-dark" />
            </div>
          </div>

          {/* Type + Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-400 mb-1.5 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-cyan-500" /> Event type *
              </label>
              <select value={form.type} onChange={set("type")} className="input-dark">
                <option value="free">Free</option>
                <option value="paid_mb">Paid (Mirai Bucks)</option>
              </select>
            </div>
            {form.type === "paid_mb" && (
              <div>
                <label className="text-xs font-medium text-slate-400 mb-1.5 block">Price (₥ Mirai Bucks) *</label>
                <input type="number" min="1" value={form.priceMb} onChange={set("priceMb")} className="input-dark" />
              </div>
            )}
          </div>

          {/* Venue + Max participants */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-400 mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-cyan-500" /> Venue
              </label>
              <input value={form.venue} onChange={set("venue")} maxLength={200} className="input-dark" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 mb-1.5 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-cyan-500" /> Max participants
              </label>
              <input type="number" min="1" value={form.maxParticipants} onChange={set("maxParticipants")}
                placeholder="Leave blank for unlimited" className="input-dark" />
            </div>
          </div>

          {/* Image URL */}
          <div>
            <label className="text-xs font-medium text-slate-400 mb-1.5 flex items-center gap-1.5">
              <Image className="w-3.5 h-3.5 text-cyan-500" /> Cover image URL
            </label>
            <input value={form.imageUrl} onChange={set("imageUrl")} className="input-dark"
              placeholder="https://res.cloudinary.com/..." />
          </div>

          {/* Tags */}
          <div>
            <label className="text-xs font-medium text-slate-400 mb-1.5 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-cyan-500" /> Tags
            </label>
            <input value={form.tags} onChange={set("tags")} className="input-dark"
              placeholder="hackathon, workshop (comma separated)" />
          </div>

          {/* Actions */}
          <div className="pt-2 flex gap-3 flex-wrap">
            <button type="submit" disabled={saving} className="btn-neon flex-1 disabled:opacity-50">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : "Save changes"}
            </button>
            <Link href={`/events/${id}`} className="btn-ghost">Cancel</Link>
          </div>
        </form>
      </motion.div>

      {/* Danger zone */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        <div className="glass-card p-5 border border-red-500/10">
          <h3 className="font-medium text-red-400 mb-2 flex items-center gap-2">
            <Trash2 className="w-4 h-4" /> Danger zone
          </h3>
          <p className="text-xs text-slate-500 mb-3">
            Deleting this event is permanent. All registrations, comments, and likes will be removed.
          </p>
          <button onClick={handleDelete} disabled={deleting}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 text-sm font-medium transition-all disabled:opacity-50">
            {deleting ? <><Loader2 className="w-4 h-4 animate-spin" /> Deleting...</> : <><Trash2 className="w-4 h-4" /> Delete this event</>}
          </button>
        </div>
      </motion.div>
    </div>
  );
}