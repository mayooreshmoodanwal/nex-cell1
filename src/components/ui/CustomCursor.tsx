"use client";

import { useEffect, useRef, useState } from "react";

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    // Detect touch device
    if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) {
      setIsTouch(true);
      return;
    }

    let mx = 0, my = 0, rx = 0, ry = 0;
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    const onMouseMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
    };

    const animate = () => {
      if (dot && ring) {
        dot.style.left = mx + "px";
        dot.style.top = my + "px";
        rx += (mx - rx) * 0.12;
        ry += (my - ry) * 0.12;
        ring.style.left = rx + "px";
        ring.style.top = ry + "px";
      }
      requestAnimationFrame(animate);
    };

    // Scale cursor on hoverable elements
    const onMouseEnter = () => {
      if (dot) { dot.style.transform = "translate(-50%,-50%) scale(2.5)"; dot.style.background = "#06B6D4"; }
      if (ring) { ring.style.width = "56px"; ring.style.height = "56px"; ring.style.borderColor = "#06B6D4"; }
    };
    const onMouseLeave = () => {
      if (dot) { dot.style.transform = "translate(-50%,-50%) scale(1)"; dot.style.background = "#22D3EE"; }
      if (ring) { ring.style.width = "36px"; ring.style.height = "36px"; ring.style.borderColor = "rgba(34,211,238,0.3)"; }
    };

    document.addEventListener("mousemove", onMouseMove);
    animate();

    // Observe for hoverable elements
    const observeHoverables = () => {
      document.querySelectorAll("a, button, [role='button'], .hoverable, input, textarea, select").forEach((el) => {
        el.addEventListener("mouseenter", onMouseEnter);
        el.addEventListener("mouseleave", onMouseLeave);
      });
    };

    observeHoverables();

    // Re-observe on DOM changes
    const observer = new MutationObserver(() => observeHoverables());
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      observer.disconnect();
    };
  }, [isTouch]);

  if (isTouch) return null;

  return (
    <>
      <div
        ref={dotRef}
        id="custom-cursor"
        style={{
          width: 8,
          height: 8,
          background: "#22D3EE",
          borderRadius: "50%",
          position: "fixed",
          top: 0,
          left: 0,
          pointerEvents: "none",
          zIndex: 99999,
          transform: "translate(-50%, -50%)",
          transition: "transform 0.15s, background 0.2s",
          mixBlendMode: "screen" as const,
        }}
      />
      <div
        ref={ringRef}
        id="custom-cursor-ring"
        style={{
          width: 36,
          height: 36,
          border: "1.5px solid rgba(34,211,238,0.3)",
          borderRadius: "50%",
          position: "fixed",
          top: 0,
          left: 0,
          pointerEvents: "none",
          zIndex: 99998,
          transform: "translate(-50%, -50%)",
          transition: "width 0.3s, height 0.3s, border-color 0.3s",
        }}
      />
    </>
  );
}
