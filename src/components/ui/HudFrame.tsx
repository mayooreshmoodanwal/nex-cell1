"use client";

export default function HudFrame() {
  return (
    <div className="fixed inset-0 pointer-events-none z-[9995]" aria-hidden="true">
      {/* Top-left bracket */}
      <div className="absolute top-3 left-3">
        <div className="w-6 h-6 border-t-[1.5px] border-l-[1.5px] border-cyan-400/25" style={{ animation: "hud-pulse 3s ease-in-out infinite" }} />
      </div>
      {/* Top-right bracket */}
      <div className="absolute top-3 right-3">
        <div className="w-6 h-6 border-t-[1.5px] border-r-[1.5px] border-cyan-400/25" style={{ animation: "hud-pulse 3s ease-in-out infinite 0.5s" }} />
      </div>
      {/* Bottom-left bracket */}
      <div className="absolute bottom-3 left-3">
        <div className="w-6 h-6 border-b-[1.5px] border-l-[1.5px] border-cyan-400/25" style={{ animation: "hud-pulse 3s ease-in-out infinite 1s" }} />
      </div>
      {/* Bottom-right bracket */}
      <div className="absolute bottom-3 right-3">
        <div className="w-6 h-6 border-b-[1.5px] border-r-[1.5px] border-cyan-400/25" style={{ animation: "hud-pulse 3s ease-in-out infinite 1.5s" }} />
      </div>

      {/* Top edge line */}
      <div className="absolute top-3 left-12 right-12 h-[1px]">
        <div className="h-full w-full" style={{ background: "linear-gradient(90deg, rgba(6,182,212,0.15), rgba(6,182,212,0.05) 30%, transparent 50%, rgba(6,182,212,0.05) 70%, rgba(6,182,212,0.15))" }} />
      </div>
      {/* Bottom edge line */}
      <div className="absolute bottom-3 left-12 right-12 h-[1px]">
        <div className="h-full w-full" style={{ background: "linear-gradient(90deg, rgba(6,182,212,0.15), rgba(6,182,212,0.05) 30%, transparent 50%, rgba(6,182,212,0.05) 70%, rgba(6,182,212,0.15))" }} />
      </div>
    </div>
  );
}
