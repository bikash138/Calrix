"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Loader, Check, X } from "lucide-react";

export type LoadingStep = {
  label: string;
  done: boolean;
  error?: boolean;
};

const WHEEL = [
  { y: 0, scale: 1, opacity: 1, rotateX: 0 },
  { y: -78, scale: 0.8, opacity: 0.42, rotateX: -30 },
  { y: -124, scale: 0.63, opacity: 0.18, rotateX: -48 },
  { y: -154, scale: 0.5, opacity: 0.06, rotateX: -58 },
];

type ExitPhase = 0 | 1 | 2;

export function LoadingScreen({
  steps,
  onComplete,
}: {
  steps: LoadingStep[];
  onComplete?: () => void;
}) {
  const allDone = steps.every((s) => s.done);
  const activeIndex = steps.findIndex((s) => !s.done);
  const current = activeIndex === -1 ? steps.length - 1 : activeIndex;

  const [phase, setPhase] = useState<ExitPhase>(0);

  useEffect(() => {
    if (!allDone) return;
    const t1 = setTimeout(() => setPhase(1), 400);
    const t2 = setTimeout(() => setPhase(2), 850);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [allDone]);

  return (
    <motion.div
      className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-background"
      animate={
        phase === 2
          ? { clipPath: "inset(100% 0% 0% 0% round 0px 0px 32px 32px)" }
          : { clipPath: "inset(0% 0% 0% 0% round 0px)" }
      }
      transition={
        phase === 2 ? { duration: 0.55, ease: [0.7, 0, 1, 1] } : { duration: 0 }
      }
      onAnimationComplete={() => {
        if (phase === 2) onComplete?.();
      }}
    >
      {/* Grid */}
      <motion.div
        className="absolute inset-0 bg-[linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)] bg-size-[40px_40px] opacity-50"
        animate={phase === 2 ? { scale: 1.1, y: "-6%" } : { scale: 1, y: "0%" }}
        transition={{ duration: 0.55, ease: [0.7, 0, 1, 1] }}
      />
      <div className="pointer-events-none absolute inset-0 bg-background mask-[radial-gradient(ellipse_at_center,transparent_30%,black)]" />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(to right, rgba(255,64,0,0.03) 0%, transparent 35%, transparent 65%, rgba(255,64,0,0.03) 100%)",
        }}
      />

      {/* 3-D wheel stack */}
      <div
        className="relative"
        style={{ perspective: "600px", height: "200px", width: "340px" }}
      >
        {steps.map((step, i) => {
          const rel = i - current;
          if (rel > 0) return null;

          const slot = WHEEL[Math.min(Math.abs(rel), WHEEL.length - 1)]!;
          const isDone   = step.done;
          const isError  = !!step.error;
          const isActive = i === current;

          // stagger pills upward during phase 1 — bottom pill exits last
          const exitDelay = (steps.length - 1 - i) * 0.055;

          return (
            <motion.div
              key={step.label}
              initial={
                isActive
                  ? { y: 64, scale: 0.88, opacity: 0, rotateX: 18 }
                  : false
              }
              animate={
                phase >= 1
                  ? {
                      y: slot.y - 120,
                      scale: slot.scale * 0.75,
                      opacity: 0,
                      rotateX: slot.rotateX - 25,
                    }
                  : slot
              }
              transition={
                phase >= 1
                  ? { duration: 0.38, delay: exitDelay, ease: [0.4, 0, 1, 1] }
                  : { type: "spring", stiffness: 170, damping: 26 }
              }
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                marginLeft: "-160px",
                marginTop: "-26px",
                transformOrigin: "center center",
                boxShadow: isError
                  ? "0 8px 32px rgba(239,68,68,0.18), 0 2px 8px rgba(239,68,68,0.1)"
                  : isActive
                  ? "0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)"
                  : "0 2px 8px rgba(0,0,0,0.04)",
              }}
              className={`flex w-80 items-center gap-3.5 rounded-2xl border bg-card px-5 py-3.5 ${
                isError ? "border-red-500/40" : "border-border"
              }`}
            >
              <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                isError ? "bg-red-500" : "bg-orange-600"
              }`}>
                {isError ? (
                  <X className="h-3.5 w-3.5 text-white" strokeWidth={3} />
                ) : isDone ? (
                  <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
                ) : (
                  <Loader className="h-3.5 w-3.5 animate-spin text-white" />
                )}
              </div>

              <span
                className={`text-sm font-medium ${
                  isError ? "text-red-500" : isActive ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {step.label}
              </span>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
