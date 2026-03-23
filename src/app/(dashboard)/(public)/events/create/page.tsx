"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Calendar, MapPin, Users, Image, Tag, Loader2, ArrowLeft, Zap } from "lucide-react";
import { toast } from "sonner";

export default function CreateEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
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
  });

  const csrf = () =>
    document.cookie.split(";").find((c) => c.trim().startsWith("csrf_token="))?.split("=")[1];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validate dates
    if (new Date(form.eventDate) <= new Date(form.registrationDeadline)) {
      toast.error("Event date must be after registration deadline");
      setLoading(false);
      return;
    }

    const payload: Record<string, unknown> = {
      title:                form.title.trim(),
      description:          form.description.trim(),
      shortDescription:     form.shortDescription.trim() || undefined,
      eventDate:            new Date(form.eventDate).toISOString(),
      registrationDeadline: new Date(form.registrationDeadline).toISOString(),
      type:                 form.type,
      venue:                form.venue.trim() || undefined,
      imageUrl:             form.imageUrl.trim() || undefined,
      tags:                 form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : undefined,
    };

    if (form.type === "paid_mb") {
      if (!form.priceMb) { toast.error("Price in Mirai Bucks is required for paid events"); setLoading(false); return; }
      payload.priceMb = parseInt(form.priceMb);
    }
    if (form.maxParticipants) {
      payload.maxParticipants = parseInt(form.maxParticipants);
    }

    try {
      const res = await fetch("/api/events", {
        method:  "POST",
        headers: { "Content-Type": "application/json", ...(csrf() ? { "x-csrf-token": csrf()! } : {}) },
        body:    JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? data.fields?.[0]?.message ?? "Failed to create event");
        return;
      }
      toast.success("Event created successfully!");
      router.push(`/events/${data.data?.id ?? ""}`);
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-slate-400 hover:text-white mb-5 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <h1 className="page-title">Create event</h1>
        <p className="text-slate-400 mt-1">Fill in the details below to publish a new event</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <form onSubmit={handleSubmit} className="glass-card p-6 space-y-5">

          {/* Title */}
          <div>
            <label className="text-xs font-medium text-slate-400 mb-1.5 block">Event title *</label>
            <input value={form.title} onChange={set("title")} required minLength={3} maxLength={200}
              placeholder="e.g. NexCell Hackathon 2025" className="input-dark" />
          </div>

          {/* Short description */}
          <div>
            <label className="text-xs font-medium text-slate-400 mb-1.5 block">Short description <span className="text-slate-600">(shown on cards)</span></label>
            <input value={form.shortDescription} onChange={set("shortDescription")} maxLength={300}
              placeholder="One-line summary of the event" className="input-dark" />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-medium text-slate-400 mb-1.5 block">Full description *</label>
            <textarea value={form.description} onChange={set("description")} required minLength={10} rows={5}
              placeholder="Describe the event in detail — what will happen, who should attend, what to bring..."
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
                <input type="number" min="1" value={form.priceMb} onChange={set("priceMb")}
                  placeholder="e.g. 500" className="input-dark" />
              </div>
            )}
          </div>

          {/* Venue + Max participants */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-400 mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-cyan-500" /> Venue
              </label>
              <input value={form.venue} onChange={set("venue")} maxLength={200}
                placeholder="e.g. Room 301, Mirai Campus" className="input-dark" />
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
            <input value={form.imageUrl} onChange={set("imageUrl")}
              placeholder="https://res.cloudinary.com/..." className="input-dark" />
            <p className="text-xs text-slate-600 mt-1">Upload to Cloudinary first, then paste the URL here</p>
          </div>

          {/* Tags */}
          <div>
            <label className="text-xs font-medium text-slate-400 mb-1.5 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-cyan-500" /> Tags
            </label>
            <input value={form.tags} onChange={set("tags")}
              placeholder="hackathon, workshop, networking (comma separated)" className="input-dark" />
          </div>

          {/* Submit */}
          <div className="pt-2 flex gap-3">
            <button type="submit" disabled={loading} className="btn-neon flex-1 disabled:opacity-50">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating event...</> : "Create event"}
            </button>
            <button type="button" onClick={() => router.back()} className="btn-ghost">Cancel</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}