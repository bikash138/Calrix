"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

const FOREGROUND = "#000000";
const ACCENT = "#ff4000";

export function SectionHeading({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <h2 className={className}>{children}</h2>;
  }

  return (
    <motion.h2
      className={className}
      style={{
        backgroundImage: `linear-gradient(120deg, ${FOREGROUND} 0%, ${FOREGROUND} 42%, ${ACCENT} 58%, ${ACCENT} 100%)`,
        backgroundSize: "250% 250%",
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        WebkitTextFillColor: "transparent",
        color: "transparent",
      }}
      initial={{ backgroundPosition: "100% 100%" }}
      whileInView={{ backgroundPosition: "0% 0%" }}
      viewport={{ once: false, margin: "0px 0px 220px 0px" }}
      transition={{ duration: 1.3, ease: "easeInOut" }}
    >
      {children}
    </motion.h2>
  );
}

export function StaggeredSectionHeading({
  lines,
  className,
}: {
  lines: string[];
  className?: string;
}) {
  const reduce = useReducedMotion();

  return (
    <h2 className={className}>
      {lines.map((line, i) =>
        reduce ? (
          <span key={i} className="block">
            {line}
          </span>
        ) : (
          <motion.span
            key={i}
            className="block"
            style={{
              backgroundImage: `linear-gradient(120deg, ${FOREGROUND} 0%, ${FOREGROUND} 42%, ${ACCENT} 58%, ${ACCENT} 100%)`,
              backgroundSize: "250% 250%",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
              color: "transparent",
            }}
            initial={{ backgroundPosition: "100% 100%" }}
            whileInView={{ backgroundPosition: "0% 0%" }}
            viewport={{ once: false, margin: "0px 0px 220px 0px" }}
            transition={{ duration: 1.2, ease: "easeInOut", delay: i * 0.9 }}
          >
            {line}
          </motion.span>
        ),
      )}
    </h2>
  );
}

/**
 * Generic scroll-reveal wrapper: fade + small upward slide, once.
 * Pass `delay` to cascade siblings into a stagger.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 24,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, ease: "easeOut", delay }}
    >
      {children}
    </motion.div>
  );
}
