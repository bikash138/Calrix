"use client";

import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { INBOX_VIEW_LABEL, URGENCY_LABEL } from "@/data/settings-labels";
import type { InboxView, UrgencySignal, InboxSettings } from "@/server/db/schema/settings";
import { SegmentedControl, Row, Group } from "./settings-primitives";
import { VIPChipInput } from "./vip-chip-input";

const ALL_URGENCY_SIGNALS: UrgencySignal[] = [
  "vip_sender",
  "deadlines",
  "replies",
  "money",
  "scheduling",
  "tasks",
];

export function InboxSection({
  form,
  onChange,
}: {
  form: InboxSettings;
  onChange: (patch: Partial<InboxSettings>) => void;
}) {
  const toggleUrgency = (id: UrgencySignal) => {
    if (form.urgencySignals.includes(id)) {
      onChange({ urgencySignals: form.urgencySignals.filter((s) => s !== id) });
    } else if (form.urgencySignals.length < 2) {
      onChange({ urgencySignals: [...form.urgencySignals, id] });
    }
  };

  return (
    <div>
      <Group title="View">
        <Row
          label="Default view"
          description="Which tab opens when you visit Inbox"
        >
          <SegmentedControl
            options={["All", "Unread", "Sent"]}
            value={INBOX_VIEW_LABEL[form.defaultView]}
            onChange={(label) => {
              const raw = (Object.entries(INBOX_VIEW_LABEL) as [InboxView, string][])
                .find(([, v]) => v === label)?.[0];
              if (raw) onChange({ defaultView: raw });
            }}
          />
        </Row>
      </Group>

      <Group title="Urgency Signals">
        <div className="py-3">
          <p className="mb-0.5 text-[0.78rem] font-medium text-foreground">
            What makes an email urgent?
          </p>
          <p className="mb-3 text-[0.7rem] text-muted-foreground">
            Pick at most two signals.
          </p>
          <div className="flex flex-wrap gap-2">
            {ALL_URGENCY_SIGNALS.map((id) => {
              const active = form.urgencySignals.includes(id);
              const dimmed = !active && form.urgencySignals.length >= 2;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => toggleUrgency(id)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-[0.7rem] transition-colors cursor-pointer",
                    active
                      ? "border-foreground bg-foreground text-background"
                      : dimmed
                        ? "border-border text-muted-foreground opacity-30 pointer-events-none"
                        : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground",
                  )}
                >
                  {URGENCY_LABEL[id]}
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-[0.68rem] text-muted-foreground">
            {form.urgencySignals.length}/2 selected
          </p>
        </div>
      </Group>

      <Group title="VIP Senders">
        <div className="py-3">
          <p className="mb-0.5 text-[0.78rem] font-medium text-foreground">
            Always land at the top
          </p>
          <p className="mb-3 text-[0.7rem] text-muted-foreground">
            Names or email addresses. Max 5.
          </p>
          <VIPChipInput
            value={form.vipSenders}
            onChange={(v) => onChange({ vipSenders: v })}
          />
        </div>
      </Group>

      <Group title="Signature">
        <div className="py-3">
          <p className="mb-2 text-[0.78rem] font-medium text-foreground">
            Email signature
          </p>
          <Textarea
            value={form.signature}
            onChange={(e) => onChange({ signature: e.target.value })}
            rows={4}
            className="text-[0.78rem] resize-none"
            placeholder="Your email signature..."
          />
        </div>
      </Group>
    </div>
  );
}
