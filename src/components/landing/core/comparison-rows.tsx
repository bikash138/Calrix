"use client";

import { motion, useReducedMotion } from "motion/react";

export type ComparisonRow = {
  label: string;
  calrix: string;
  generic: string;
  ea: string;
  status: string;
};

export default function ComparisonRows({ rows }: { rows: ComparisonRow[] }) {
  const reduce = useReducedMotion();

  return (
    <motion.tbody
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: reduce ? 0 : 0.06 } },
      }}
    >
      {rows.map((row, i) => {
        const last = i === rows.length - 1;
        return (
          <motion.tr
            key={row.label}
            className="border-t border-border/60"
            variants={{
              hidden: { opacity: reduce ? 1 : 0 },
              show: { opacity: 1, transition: { duration: 0.4, ease: "easeOut" } },
            }}
          >
            <th className={`bg-surface-warm px-5 py-4 align-middle font-medium text-foreground ${i === 0 ? "rounded-tl-xl" : ""} ${last ? "rounded-bl-xl" : ""}`}>
              {row.label}
            </th>
            <td className={`bg-accent px-5 py-4 align-middle font-semibold text-white ${last ? "rounded-b-2xl" : ""}`}>{row.calrix}</td>
            <td className="px-5 py-4 align-middle text-muted">{row.generic}</td>
            <td className="px-5 py-4 align-middle text-muted">{row.ea}</td>
            <td className="px-5 py-4 align-middle text-muted">{row.status}</td>
          </motion.tr>
        );
      })}
    </motion.tbody>
  );
}
