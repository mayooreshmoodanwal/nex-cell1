import { getEvents } from "@/lib/services/event.service";
import { format } from "date-fns";
import Link from "next/link";
export const metadata = { title: "Archive" };

export default async function ArchivePage() {
  const events = await getEvents({ archived: true, limit: 100 });
  return (
    <div className="space-y-6">
      <div>
        <p className="hud-label mb-2">History</p>
        <h1 className="display-heading text-xl text-white glitch-text">Archive</h1>
        <p className="text-slate-500 mt-1 text-sm font-mono">Past NexCell events</p>
      </div>
      {events.length === 0 ? (
        <div className="text-center py-20 text-slate-500 hud-card p-10 font-mono">No past events yet</div>
      ) : (
        <div className="space-y-3">
          {events.map((event: any) => (
            <Link key={event.id} href={`/events/${event.id}`}>
              <div className="hud-card perspective-card p-4 flex items-center gap-4 cursor-pointer group">
                {/* Neon left bar */}
                <div className="w-[3px] h-12 rounded-full bg-slate-700/50 group-hover:bg-cyan-400/50 transition-colors" />
                <div className="w-12 h-12 rounded-lg bg-navy-800/60 flex flex-col items-center justify-center flex-shrink-0 border border-navy-700/50 clip-cyber-sm">
                  <span className="text-[10px] font-bold text-slate-500 uppercase font-mono">{format(new Date(event.eventDate), "MMM")}</span>
                  <span className="text-lg font-bold text-white leading-none font-orbitron">{format(new Date(event.eventDate), "d")}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white truncate group-hover:text-cyan-400 transition-colors">{event.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5 font-mono">{format(new Date(event.eventDate), "yyyy")} · {Number(event.registrationCount ?? 0)} participants</p>
                </div>
                {/* Archived badge */}
                <span className="text-[9px] font-bold text-slate-500 font-mono tracking-widest uppercase bg-navy-800/50 px-2 py-1 rounded mr-2 border border-navy-700/40">
                  Archived
                </span>
                <span className={event.type === "free" ? "badge-green" : "badge-cyan"}>
                  {event.type === "free" ? "Free" : `₥${event.priceMb?.toLocaleString()}`}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
