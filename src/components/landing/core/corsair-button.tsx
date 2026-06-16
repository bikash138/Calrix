"use client";

import { useRef } from "react";
import type { MouseEvent } from "react";

export default function CorsairButton() {
  const ref = useRef<HTMLAnchorElement>(null);

  const handleMove = (e: MouseEvent<HTMLAnchorElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--x", `${e.clientX - rect.left}px`);
    el.style.setProperty("--y", `${e.clientY - rect.top}px`);
  };

  return (
    <a
      ref={ref}
      href="https://corsair.dev"
      target="_blank"
      rel="noopener noreferrer"
      onMouseMove={handleMove}
      className="group relative flex items-center gap-2 overflow-hidden rounded-full border border-accent/30 bg-transparent px-8 py-4 font-display font-medium text-foreground transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-accent/60 hover:shadow-lg active:translate-y-0"
    >
      {/* cursor-tracking orange glow */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(160px circle at var(--x, 50%) var(--y, 50%), rgba(255,64,0,0.45), rgba(255,138,26,0.2) 45%, transparent 70%)",
        }}
      />
      <span className="relative z-10">Powered by Corsair</span>
      <span className="relative z-10 transition-transform duration-300 ease-out group-hover:translate-x-1">
        →
      </span>
    </a>
  );
}
