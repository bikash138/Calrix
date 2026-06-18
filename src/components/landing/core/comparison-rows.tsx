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
      initial={reduce ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {rows.map((row, i) => {
        const last = i === rows.length - 1;
        return (
          <tr
            key={row.label}
            className="border-t border-border/60"
          >
            <th className={`bg-surface-warm px-5 py-4 align-middle font-medium text-foreground ${i === 0 ? "rounded-tl-xl" : ""} ${last ? "rounded-bl-xl" : ""}`}>
              {row.label}
            </th>
            <td className={`bg-accent px-5 py-4 align-middle font-semibold text-white ${last ? "rounded-b-2xl" : ""}`}>{row.calrix}</td>
            <td className="px-5 py-4 align-middle text-muted">{row.generic}</td>
            <td className="px-5 py-4 align-middle text-muted">{row.ea}</td>
            <td className="px-5 py-4 align-middle text-muted">{row.status}</td>
          </tr>
        );
      })}
    </motion.tbody>
  );
}
