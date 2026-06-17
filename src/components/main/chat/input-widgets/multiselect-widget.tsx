"use client";

import { useState } from "react";
import { ListChecks } from "lucide-react";
import type { UserInputResult } from "@/lib/request-input.schema";
import { WidgetShell, widgetInputCls } from "./widget-shell";

type Props = {
  label: string;
  options: string[];
  onSubmit: (result: UserInputResult) => void;
  onCancel: () => void;
  disabled?: boolean;
};

export function MultiSelectWidget({
  label,
  options,
  onSubmit,
  onCancel,
  disabled,
}: Props) {
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [otherOn, setOtherOn] = useState(false);
  const [otherText, setOtherText] = useState("");

  const canSubmit =
    checked.size > 0 || (otherOn && otherText.trim().length > 0);

  function toggle(opt: string) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(opt)) next.delete(opt);
      else next.add(opt);
      return next;
    });
  }

  function handleSubmit() {
    if (!canSubmit) return;
    const values = [...checked];
    if (otherOn && otherText.trim()) values.push(otherText.trim());
    onSubmit({ status: "multiselected", values });
  }

  return (
    <WidgetShell
      icon={<ListChecks className="h-4 w-4" />}
      label={label}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      canSubmit={canSubmit}
      disabled={disabled}
    >
      <div className="flex flex-col gap-1">
        {options.map((opt) => (
          <label
            key={opt}
            className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-zinc-100 dark:hover:bg-white/5"
          >
            <input
              type="checkbox"
              checked={checked.has(opt)}
              onChange={() => toggle(opt)}
              disabled={disabled}
              className="h-4 w-4 shrink-0 accent-orange-500"
            />
            <span className="text-foreground">{opt}</span>
          </label>
        ))}

        <label className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-zinc-100 dark:hover:bg-white/5">
          <input
            type="checkbox"
            checked={otherOn}
            onChange={() => setOtherOn((v) => !v)}
            disabled={disabled}
            className="accent-orange-500"
          />
          <span className="text-foreground">Other</span>
        </label>

        {otherOn && (
          <div className="mt-0.5 pl-7">
            <input
              autoFocus
              value={otherText}
              onChange={(e) => setOtherText(e.target.value)}
              disabled={disabled}
              placeholder="Add your own…"
              className={widgetInputCls}
            />
          </div>
        )}
      </div>
    </WidgetShell>
  );
}
