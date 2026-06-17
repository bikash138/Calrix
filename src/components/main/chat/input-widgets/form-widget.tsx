"use client";

import { useState } from "react";
import { TextCursorInput } from "lucide-react";
import type { FormField, UserInputResult } from "@/lib/request-input.schema";
import { WidgetShell, widgetInputCls, widgetLabelCls } from "./widget-shell";
import { DateTimePicker } from "./date-time-picker";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  fields: FormField[];
  onSubmit: (result: UserInputResult) => void;
  onCancel: () => void;
  disabled?: boolean;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function FormWidget({
  label,
  fields,
  onSubmit,
  onCancel,
  disabled,
}: Props) {
  const [data, setData] = useState<Record<string, string>>(() =>
    Object.fromEntries(fields.map((f) => [f.name, ""])),
  );
  const [error, setError] = useState<string | null>(null);

  function set(name: string, value: string) {
    setData((prev) => ({ ...prev, [name]: value }));
  }

  const canSubmit = fields
    .filter((f) => f.required)
    .every((f) => (data[f.name] ?? "").trim().length > 0);

  function handleSubmit() {
    setError(null);
    for (const f of fields) {
      const v = (data[f.name] ?? "").trim();
      if (f.required && !v) {
        setError(`${f.label} is required.`);
        return;
      }
      if (f.type === "email" && v && !EMAIL_RE.test(v)) {
        setError(`${f.label} must be a valid email.`);
        return;
      }
    }
    // Trim everything before handing back.
    const clean = Object.fromEntries(
      Object.entries(data).map(([k, v]) => [k, v.trim()]),
    );
    onSubmit({ status: "form", data: clean });
  }

  return (
    <WidgetShell
      icon={<TextCursorInput className="h-4 w-4" />}
      label={label}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      canSubmit={canSubmit}
      disabled={disabled}
    >
      <div className="flex flex-col gap-2.5">
        {fields.map((f) => (
          <div key={f.name}>
            <label className={widgetLabelCls}>
              {f.label}
              {f.required && <span className="text-orange-500"> *</span>}
            </label>
            {f.type === "textarea" ? (
              <textarea
                value={data[f.name] ?? ""}
                onChange={(e) => set(f.name, e.target.value)}
                disabled={disabled}
                rows={2}
                placeholder={f.placeholder}
                className={cn(widgetInputCls, "resize-none")}
              />
            ) : f.type === "date" || f.type === "datetime" ? (
              <DateTimePicker
                value={data[f.name] ?? ""}
                onChange={(v) => set(f.name, v)}
                withTime={f.type === "datetime"}
                disabled={disabled}
                placeholder={f.placeholder ?? "Pick a date"}
              />
            ) : (
              <input
                type={f.type === "email" ? "email" : "text"}
                value={data[f.name] ?? ""}
                onChange={(e) => set(f.name, e.target.value)}
                disabled={disabled}
                placeholder={f.placeholder}
                className={widgetInputCls}
              />
            )}
          </div>
        ))}
      </div>

      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
    </WidgetShell>
  );
}
