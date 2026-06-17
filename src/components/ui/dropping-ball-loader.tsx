"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * A squash-and-stretch "sticky" dropping ball built from the Calrix mark.
 * The ball falls under gravity, squashes on impact, and springs back up in a
 * seamless loop — usable as a page/section loader.
 */
export function DroppingBallLoader({
  size = 44,
  className,
  label,
}: {
  size?: number;
  className?: string;
  label?: string;
}) {
  const drop = Math.round(size * 1.7); // how far the ball travels upward
  const shadowGap = Math.round(size * 0.28); // ground clearance below the ball
  const laneHeight = drop + size + shadowGap;
  const dur = "0.9s";

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      <div
        className="relative"
        style={{ width: size * 1.6, height: laneHeight }}
      >
        {/* Ball lane — flex keeps it horizontally centered and bottom-aligned */}
        <div
          className="absolute inset-0 flex items-end justify-center"
          style={{ paddingBottom: shadowGap }}
        >
          <div
            className="cbl-bounce"
            style={{ width: size, height: size }}
          >
            <div
              className="cbl-squash"
              style={{
                width: size,
                height: size,
                transformOrigin: "center bottom",
              }}
            >
              <Image
                src="/icon.svg"
                alt=""
                width={size}
                height={size}
                priority
                draggable={false}
                className="select-none"
              />
            </div>
          </div>
        </div>

        {/* Ground shadow */}
        <div
          className="cbl-shadow absolute left-1/2 rounded-[50%] bg-foreground/40 blur-[3px]"
          style={{
            width: size * 0.82,
            height: Math.max(6, size * 0.16),
            bottom: shadowGap * 0.35,
          }}
        />
      </div>

      {label && (
        <p className="animate-pulse text-xs font-medium tracking-wide text-muted-foreground">
          {label}
        </p>
      )}

      <style>{`
        @keyframes cbl-bounce {
          0%, 100% {
            transform: translateY(-${drop}px);
            animation-timing-function: cubic-bezier(0.5, 0, 1, 0.45);
          }
          50% {
            transform: translateY(0);
            animation-timing-function: cubic-bezier(0, 0.55, 0.45, 1);
          }
        }
        @keyframes cbl-squash {
          0%, 100% { transform: scale(1, 1); }
          35%      { transform: scale(0.94, 1.08); }
          50%      { transform: scale(1.28, 0.72); }
          65%      { transform: scale(0.96, 1.06); }
        }
        @keyframes cbl-shadow {
          0%, 100% { transform: translateX(-50%) scaleX(0.5); opacity: 0.12; }
          50%      { transform: translateX(-50%) scaleX(1.1); opacity: 0.5; }
        }
        .cbl-bounce { animation: cbl-bounce ${dur} infinite; will-change: transform; }
        .cbl-squash { animation: cbl-squash ${dur} infinite; will-change: transform; }
        .cbl-shadow { animation: cbl-shadow ${dur} infinite; will-change: transform, opacity; }
        @media (prefers-reduced-motion: reduce) {
          .cbl-bounce, .cbl-squash, .cbl-shadow { animation: none; }
          .cbl-bounce { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
