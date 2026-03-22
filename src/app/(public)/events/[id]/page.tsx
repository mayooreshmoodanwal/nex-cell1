"use client";
import { useState, useEffect, use } from "react";
import { motion } from "framer-motion";
import {
  Calendar, MapPin, Users, Heart, Share2,
  ArrowLeft, Loader2, CheckCircle, Lock, Settings,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { toast } from "sonner";

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // Next.js 15: params is a Promise — unwrap with React.use()
  const { id } = use(params);

  const [event,       setEvent]       = useState<any>(null);
  const [loading,     setLoading]     = useState(true);
  const [registering, setRegistering] = useState(false);
  const [liking,      setLiking]      = useState(false);
  const [comments,    setComments]    = useState<any[]>([]);
  const [commentText, setCommentText] = useState("");
  const [posting,     setPosting]     = useState(false);
  const [userRoles,   setUserRoles]   = useState<string[]>([]);

  useEffect(() => {
    fetch(`/api/events/${id}`)
      .then((r) => r.json())
      .then((d) => { setEvent(d.data); setLoading(false); });

    fetch(`/api/comments?eventId=${id}`)
      .then((r) => r.json())
      .then((d) => setComments(d.data ?? []));

    fetch("/api/users/me")
      .then((r) => r.json())
      .then((d) => setUserRoles(d.data?.roles ?? []))
      .catch(() => {});
  }, [id]);

  const csrf = () =>
    document.cookie.split(";").find((c) => c.trim().startsWith("csrf_token="))?.split("=")[1];

  const canManage = userRoles.includes("admin") || userRoles.includes("member");

  const handleRegister = async () => {
    setRegistering(true);
    try {
      const res = await fetch(`/api/events/${id}/register`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", ...(csrf() ? { "x-csrf-token": csrf()! } : {}) },
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error?.toLowerCase().includes("capacity") || data.error?.toLowerCase().includes("late")) {
          toast.error("Sorry, You Are Late!!! This event is at full capacity.", {
            duration: 5000,
            style: { background: "#1C0A0A", border: "1px solid rgba(239,68,68,0.4)", color: "#FCA5A5" },
          });
        } else {
          toast.error(data.error ?? "Registration failed");
        }
      } else {
        toast.success(data.data?.message ?? "Successfully registered!");
        setEvent((e: any) => ({ ...e, isRegistered: true, registrationCount: Number(e.registrationCount ?? 0) + 1 }));
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setRegistering(false);
    }
  };

  const handleLike = async () => {
    setLiking(true);
    const res = await fetch(`/api/events/${id}/like`, {
      method:  "POST",
      headers: { "Content-Type": "application/json", ...(csrf() ? { "x-csrf-token": csrf()! } : {}) },
    });
    const data = await res.json();
    if (res.ok) {
      setEvent((e: any) => ({
        ...e,
        isLiked:   data.data.liked,
        likeCount: Number(e.likeCount ?? 0) + (data.data.liked ? 1 : -1),
      }));
    }
    setLiking(false);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    setPosting(true);
    const res = await fetch("/api/comments", {
      method:  "POST",
      headers: { "Content-Type": "application/json", ...(csrf() ? { "x-csrf-token": csrf()! } : {}) },
      body:    JSON.stringify({ eventId: id, body: commentText }),
    });
    const data = await res.json();
    if (!res.ok) { toast.error(data.error); }
    else {
      toast.success(data.data?.message);
      setCommentText("");
      if (data.data?.status === "approved") setComments((c) => [data.data.comment, ...c]);
    }
    setPosting(false);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
    </div>
  );

  if (!event) return (
    <div className="text-center py-20">
      <p className="text-slate-400">Event not found</p>
      <Link href="/events" className="text-cyan-400 hover:underline mt-2 block">← Back to events</Link>
    </div>
  );

  const isPast         = new Date(event.eventDate) < new Date();
  const deadlinePassed = new Date(event.registrationDeadline) < new Date();
  const isFull         = event.maxParticipants && Number(event.registrationCount ?? 0) >= event.maxParticipants;
  const spotsLeft      = event.maxParticipants
    ? event.maxParticipants - Number(event.registrationCount ?? 0)
    : null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/events" className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to events
        </Link>
        {canManage && (
          <Link href={`/admin/events/${id}/registrations`}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-navy-800 border border-navy-700 text-sm text-slate-300 hover:text-white hover:border-cyan-500/40 transition-all">
            <Settings className="w-3.5 h-3.5 text-cyan-400" />
            Manage registrations
          </Link>
        )}
      </div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        {event.imageUrl && (
          <div className="rounded-2xl overflow-hidden h-64 mb-6">
            <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
          </div>
        )}

        <div className="glass-card p-6 md:p-8">
          <div className="flex flex-wrap gap-2 mb-4">
            <span className={event.type === "free" ? "badge-green" : "badge-cyan"}>
              {event.type === "free" ? "Free event" : `₥${event.priceMb?.toLocaleString()} to register`}
            </span>
            {isPast             && <span className="badge-red">Past event</span>}
            {isFull && !event.isRegistered && <span className="badge-red flex items-center gap-1"><Lock className="w-3 h-3" /> Full</span>}
            {event.isRegistered && <span className="badge-purple flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Registered</span>}
            {spotsLeft !== null && spotsLeft > 0 && spotsLeft <= 5 && (
              <span className="badge-amber">Only {spotsLeft} spot{spotsLeft !== 1 ? "s" : ""} left!</span>
            )}
          </div>

          <h1 className="text-3xl font-bold text-white mb-4" style={{ letterSpacing: "-0.02em" }}>
            {event.title}
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 p-4 bg-navy-800 rounded-xl">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-cyan-400 flex-shrink-0" />
              <div>
                <p className="text-slate-500 text-xs">Date</p>
                <p className="text-white font-medium">{format(new Date(event.eventDate), "dd MMM yyyy")}</p>
                <p className="text-slate-400 text-xs">{format(new Date(event.eventDate), "h:mm a")}</p>
              </div>
            </div>
            {event.venue && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                <div>
                  <p className="text-slate-500 text-xs">Venue</p>
                  <p className="text-white font-medium">{event.venue}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4 text-cyan-400 flex-shrink-0" />
              <div>
                <p className="text-slate-500 text-xs">Registered</p>
                <p className="text-white font-medium">
                  {Number(event.registrationCount ?? 0)}
                  {event.maxParticipants ? ` / ${event.maxParticipants}` : ""}
                </p>
                {spotsLeft !== null && (
                  <p className={`text-xs ${spotsLeft === 0 ? "text-red-400" : "text-slate-400"}`}>
                    {spotsLeft === 0 ? "No spots left" : `${spotsLeft} spots remaining`}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="prose prose-invert prose-sm max-w-none mb-6">
            <p className="text-slate-300 leading-relaxed whitespace-pre-line">{event.description}</p>
          </div>

          {!isPast && (
            <p className="text-xs text-slate-500 mb-4">
              Registration closes: {format(new Date(event.registrationDeadline), "dd MMM yyyy, h:mm a")}
            </p>
          )}

          <div className="flex flex-wrap gap-3">
            {!isPast && !deadlinePassed && !event.isRegistered && (
              isFull ? (
                <button disabled
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-red-400 border border-red-500/30 bg-red-500/5 cursor-not-allowed opacity-70">
                  <Lock className="w-4 h-4" /> Sorry, You Are Late!!!
                </button>
              ) : (
                <button onClick={handleRegister} disabled={registering} className="btn-neon disabled:opacity-50">
                  {registering
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Registering...</>
                    : event.type === "paid_mb"
                    ? `Register — ₥${event.priceMb?.toLocaleString()}`
                    : "Register for free"
                  }
                </button>
              )
            )}
            {event.isRegistered && (
              <div className="flex items-center gap-2 px-6 py-3 rounded-xl border border-green-500/30 bg-green-500/5 text-green-400 text-sm font-medium">
                <CheckCircle className="w-4 h-4" /> You are registered
              </div>
            )}
            {(isPast || deadlinePassed) && !event.isRegistered && (
              <button disabled className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-slate-500 border border-navy-700 bg-navy-800 cursor-not-allowed">
                Registration closed
              </button>
            )}
            <button onClick={handleLike} disabled={liking}
              className={`btn-ghost gap-2 ${event.isLiked ? "text-red-400 border-red-500/30" : ""}`}>
              <Heart className={`w-4 h-4 ${event.isLiked ? "fill-red-400 text-red-400" : ""}`} />
              {Number(event.likeCount ?? 0)} {event.isLiked ? "Liked" : "Like"}
            </button>
            <button onClick={handleShare} className="btn-ghost">
              <Share2 className="w-4 h-4" /> Share
            </button>
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div className="glass-card p-6">
          <h2 className="font-semibold text-white mb-4">Comments ({comments.length})</h2>
          <form onSubmit={handleComment} className="flex gap-3 mb-5">
            <input value={commentText} onChange={(e) => setCommentText(e.target.value)}
              placeholder="Leave a comment..." className="input-dark flex-1" maxLength={1000} />
            <button type="submit" disabled={posting || !commentText.trim()}
              className="btn-neon flex-shrink-0 disabled:opacity-50 px-4">
              {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Post"}
            </button>
          </form>
          {comments.length === 0 ? (
            <p className="text-center text-slate-500 py-6 text-sm">No comments yet. Be the first!</p>
          ) : (
            <div className="space-y-3">
              {comments.map((c: any) => (
                <div key={c.id} className="flex gap-3 p-3 rounded-xl bg-navy-800">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-600 to-blue-700 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-white">{(c.userName || "U")[0].toUpperCase()}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{c.userName ?? "User"}</p>
                    <p className="text-sm text-slate-300 mt-0.5">{c.body}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}