"use client";

import { useState } from "react";
import { ListChecks } from "lucide-react";
import type { UserInputResult } from "@/lib/request-input.schema";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { WidgetShell, widgetInputCls } from "./widget-shell";

const OTHER = "__other__";

type Props = {
  label: string;
  options: string[];
  onSubmit: (result: UserInputResult) => void;
  onCancel: () => void;
  disabled?: boolean;
};

export function RadioWidget({
  label,
  options,
  onSubmit,
  onCancel,
  disabled,
}: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [otherText, setOtherText] = useState("");

  const isOther = selected === OTHER;
  const canSubmit =
    selected !== null && (!isOther || otherText.trim().length > 0);

  function handleSubmit() {
    if (!canSubmit) return;
    if (isOther) {
      onSubmit({ status: "custom", value: otherText.trim() });
    } else {
      onSubmit({ status: "selected", value: selected! });
    }
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
      <RadioGroup
        value={selected ?? ""}
        onValueChange={setSelected}
        disabled={disabled}
        className="gap-0.5"
      >
        {options.map((opt, i) => (
          <label
            key={opt}
            htmlFor={`radio-${i}`}
            className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-zinc-100 dark:hover:bg-white/5"
          >
            <RadioGroupItem id={`radio-${i}`} value={opt} />
            <span className="text-foreground">{opt}</span>
          </label>
        ))}

        <label
          htmlFor="radio-other"
          className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-zinc-100 dark:hover:bg-white/5"
        >
          <RadioGroupItem id="radio-other" value={OTHER} />
          <span className="text-foreground">Other</span>
        </label>
      </RadioGroup>

      {isOther && (
        <div className="mt-0.5 pl-7">
          <input
            autoFocus
            value={otherText}
            onChange={(e) => setOtherText(e.target.value)}
            disabled={disabled}
            placeholder="Type your answer…"
            className={widgetInputCls}
          />
        </div>
      )}
    </WidgetShell>
  );
}
