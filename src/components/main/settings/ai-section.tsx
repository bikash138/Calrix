"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  ROLE_LABEL,
  VOLUME_LABEL,
  SUMMARY_LABEL,
  FOLLOWUP_LABEL,
} from "@/data/settings-labels";
import type {
  UserRole,
  EmailVolume,
  SummaryStyle,
  FollowUpSensitivity,
  AISettings,
} from "@/server/db/schema/settings";
import { SegmentedControl, Row, Group } from "./settings-primitives";
import { MemorySection } from "./memory-section";
import { contactsApi } from "@/lib/api-client/contacts.api";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

export function AISection({
  form,
  onChange,
}: {
  form: AISettings;
  onChange: (patch: Partial<AISettings>) => void;
}) {
  const [syncing, setSyncing] = useState(false);

  const { data: quota, refetch: refetchQuota } = useQuery({
    queryKey: ["contacts-sync-quota"],
    queryFn: () => contactsApi.getSyncQuota(),
    staleTime: 1000 * 60,
  });

  const canSync = (quota?.remaining ?? 1) > 0;

  const handleSync = async () => {
    setSyncing(true);
    try {
      await contactsApi.sync();
      toast.success("Contact sync started. This may take a moment.");
      refetchQuota();
    } catch {
      // 429 toast is handled by the axios interceptor
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div>
      <Group title="About You">
        <Row label="Your role" description="Helps Calrix understand your context">
          <Select
            value={form.role ?? "casual"}
            onValueChange={(raw) => onChange({ role: raw as UserRole })}
          >
            <SelectTrigger className="h-7 w-[180px] cursor-pointer text-[0.72rem]">
              <SelectValue placeholder="Not set" />
            </SelectTrigger>
            <SelectContent>
              {(Object.entries(ROLE_LABEL) as [UserRole, string][]).map(([raw, label]) => (
                <SelectItem key={raw} value={raw} className="cursor-pointer text-[0.72rem]">
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Row>
        {form.role === "other" && (
          <Row label="Describe your role" description="Tell us what you do">
            <Input
              value={form.roleOther}
              onChange={(e) => onChange({ roleOther: e.target.value })}
              placeholder="e.g. Designer, Researcher…"
              className="h-7 w-auto bg-card text-[0.75rem]"
            />
          </Row>
        )}
        <Row
          label="Daily email volume"
          description="Helps Calrix cut through the noise"
          last
        >
          <Select
            value={form.volume ?? "not_set"}
            onValueChange={(raw) =>
              onChange({ volume: raw === "not_set" ? null : (raw as EmailVolume) })
            }
          >
            <SelectTrigger className="h-7 w-[140px] cursor-pointer text-[0.72rem]">
              <SelectValue placeholder="Not set" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="not_set" className="cursor-pointer text-[0.72rem]">
                Not set
              </SelectItem>
              {(Object.entries(VOLUME_LABEL) as [EmailVolume, string][]).map(([raw, label]) => (
                <SelectItem key={raw} value={raw} className="cursor-pointer text-[0.72rem]">
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Row>
      </Group>

      <Group title="Summaries">
        <Row
          label="Summary style"
          description="How detailed Calrix-generated summaries should be"
          last
        >
          <SegmentedControl
            options={["Brief", "Detailed"]}
            value={SUMMARY_LABEL[form.summaryStyle]}
            onChange={(label) => {
              const raw = (Object.entries(SUMMARY_LABEL) as [SummaryStyle, string][])
                .find(([, v]) => v === label)?.[0];
              if (raw) onChange({ summaryStyle: raw });
            }}
          />
        </Row>
      </Group>

      <Group title="Prioritization">
        <Row
          label="Follow-up sensitivity"
          description="How aggressively Calrix surfaces missed follow-ups"
          last
        >
          <SegmentedControl
            options={["Minimal", "Balanced", "Aggressive"]}
            value={FOLLOWUP_LABEL[form.followUpSensitivity]}
            onChange={(label) => {
              const raw = (Object.entries(FOLLOWUP_LABEL) as [FollowUpSensitivity, string][])
                .find(([, v]) => v === label)?.[0];
              if (raw) onChange({ followUpSensitivity: raw });
            }}
          />
        </Row>
      </Group>

      <Group title="Privacy">
        <Row
          label="Opt out of Calrix training"
          description="Your data will not be used to improve Calrix models"
          last
        >
          <Switch
            checked={form.trainingOptOut}
            onCheckedChange={(v) => onChange({ trainingOptOut: v })}
          />
        </Row>
      </Group>

      <Group title="Contacts">
        <Row
          label="Sync contacts"
          description={
            <span className="flex flex-col gap-0.5">
              <span>Scans your sent mail to build your contact book.</span>
              <span className={canSync ? "text-muted-foreground" : "text-destructive/70"}>
                {canSync
                  ? `${quota?.remaining ?? "–"}/3 syncs remaining today.`
                  : "Daily limit reached. Resets in 24 hours."}
              </span>
            </span>
          }
          last
        >
          <Button
            size="sm"
            variant="outline"
            disabled={syncing || !canSync}
            onClick={handleSync}
            className="h-7 cursor-pointer text-[0.72rem]"
          >
            {syncing ? "Syncing…" : "Sync now"}
          </Button>
        </Row>
      </Group>

      <div className="mb-5">
        <p className="mb-2 text-[0.65rem] font-semibold uppercase tracking-widest text-muted-foreground/60">
          What Calrix Knows
        </p>
        <MemorySection />
      </div>
    </div>
  );
}
