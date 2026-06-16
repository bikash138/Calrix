"use client";

import { useState } from "react";
import { z } from "zod";
import { cn } from "@/lib/utils";

const vipEmailSchema = z.email("Must be a valid email address");
const vipNameSchema = z
  .string()
  .min(1)
  .max(60)
  .regex(/^[a-zA-ZÀ-ÖØ-öø-ÿ\s'\-.]+$/, "Must be a valid name");

function isValidVIP(val: string) {
  return (
    vipEmailSchema.safeParse(val).success ||
    vipNameSchema.safeParse(val).success
  );
}

const MAX_VIPS = 5;

export function VIPChipInput({
  value,
  onChange,
}: {
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");

  const addChip = (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return;
    if (value.length >= MAX_VIPS) { setError(`Max ${MAX_VIPS} VIPs allowed.`); return; }
    if (!isValidVIP(trimmed)) { setError("Enter a valid name or email address."); return; }
    if (value.includes(trimmed)) { setError("Already added."); return; }
    onChange([...value, trimmed]);
    setInput("");
    setError("");
  };

  const removeChip = (chip: string) => onChange(value.filter((v) => v !== chip));

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addChip(input);
    } else if (e.key === "Backspace" && input === "" && value.length > 0) {
      removeChip(value[value.length - 1]);
    } else {
      setError("");
    }
  };

  const atMax = value.length >= MAX_VIPS;

  return (
    <div className="flex flex-col gap-1.5">
      <div
        className={cn(
          "flex min-h-[38px] flex-wrap items-start gap-1.5 rounded-md border bg-card px-2.5 py-1.5 transition-colors focus-within:ring-1 focus-within:ring-ring",
          error ? "border-rose-400/60" : "border-border",
        )}
      >
        {value.map((chip) => (
          <span
            key={chip}
            className="flex items-center gap-1 rounded-full border border-border bg-muted/40 px-2.5 py-0.5 text-[0.68rem] text-foreground"
          >
            {chip}
            <button
              type="button"
              onClick={() => removeChip(chip)}
              className="ml-0.5 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              ×
            </button>
          </span>
        ))}
        {!atMax && (
          <input
            value={input}
            onChange={(e) => { setInput(e.target.value); setError(""); }}
            onKeyDown={handleKey}
            onBlur={() => input.trim() && addChip(input)}
            placeholder={value.length === 0 ? "Name or email, press Enter" : "Add another…"}
            className="min-w-[160px] flex-1 bg-transparent text-[0.75rem] text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
        )}
      </div>
      <div className="flex items-center justify-between">
        {error ? (
          <p className="text-[0.68rem] text-rose-400">{error}</p>
        ) : (
          <span />
        )}
        <p className="text-[0.68rem] text-muted-foreground">{value.length}/{MAX_VIPS}</p>
      </div>
    </div>
  );
}
