"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { z } from "zod";
import { LogoWithText } from "@/assets/logo-with-text";
import { LogoMark } from "@/assets/logo";
import {
  type Role,
  type Volume,
  type UrgencySignal,
  type SummaryStyle,
  type FollowUp,
  type FormState,
  INITIAL_FORM,
  STEPS,
  TOTAL_STEPS,
  ROLE_OPTIONS,
  VOLUME_OPTIONS,
  URGENCY_OPTIONS,
  SUMMARY_OPTIONS,
  FOLLOWUP_OPTIONS,
  PRIVACY_OPTIONS,
} from "@/data/onboarding";

const emailSchema = z.string().email();
const nameSchema = z
  .string()
  .min(1)
  .regex(/^[a-zA-ZÀ-ÖØ-öø-ÿ\s'\-.]+$/);

function isValidVIP(val: string): boolean {
  return (
    emailSchema.safeParse(val).success || nameSchema.safeParse(val).success
  );
}

//Step components

function StepRole({
  value,
  otherValue,
  onChange,
  onOtherChange,
}: {
  value: Role | null;
  otherValue: string;
  onChange: (v: Role) => void;
  onOtherChange: (v: string) => void;
}) {
  const options = ROLE_OPTIONS;

  return (
    <div className="flex flex-col gap-3">
      {options.map((o) => (
        <div key={o.id}>
          <button
            type="button"
            onClick={() => onChange(o.id)}
            className={`w-full flex items-start gap-4 rounded-xl border px-5 py-4 text-left transition-all duration-200 hover:-translate-y-px cursor-pointer ${
              value === o.id
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-surface hover:border-foreground/30"
            }`}
          >
            <div>
              <p className="font-mono text-sm font-medium">{o.label}</p>
              <p
                className={`mt-0.5 font-mono text-xs ${value === o.id ? "text-background/60" : "text-muted"}`}
              >
                {o.sub}
              </p>
            </div>
          </button>

          <AnimatePresence>
            {o.id === "other" && value === "other" && (
              <motion.div
                initial={{
                  opacity: 0,
                  height: 0,
                  y: -6,
                  filter: "blur(6px)",
                  marginTop: 0,
                }}
                animate={{
                  opacity: 1,
                  height: "auto",
                  y: 0,
                  filter: "blur(0px)",
                  marginTop: 8,
                }}
                exit={{
                  opacity: 0,
                  height: 0,
                  y: -4,
                  filter: "blur(4px)",
                  marginTop: 0,
                }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden"
              >
                <input
                  autoFocus
                  type="text"
                  value={otherValue}
                  onChange={(e) => onOtherChange(e.target.value)}
                  placeholder="e.g. Designer, Researcher, Freelancer…"
                  className="w-full rounded-xl border border-border bg-surface px-5 py-3.5 font-mono text-sm text-foreground placeholder:text-muted focus:border-foreground/40 focus:outline-none"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

function StepVolume({
  value,
  onChange,
}: {
  value: Volume | null;
  onChange: (v: Volume) => void;
}) {
  const options = VOLUME_OPTIONS;

  return (
    <div className="grid grid-cols-2 gap-3">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => onChange(o.id)}
          className={`flex flex-col gap-1 rounded-xl border px-5 py-4 text-left transition-all duration-200 hover:-translate-y-px cursor-pointer ${
            value === o.id
              ? "border-foreground bg-foreground text-background"
              : "border-border bg-surface hover:border-foreground/30"
          }`}
        >
          <p className="font-display text-2xl font-bold cursor-pointer">
            {o.label}
          </p>
          <p
            className={`font-mono text-xs ${
              value === o.id ? "text-background/60" : "text-muted"
            }`}
          >
            {o.sub}
          </p>
        </button>
      ))}
    </div>
  );
}

function StepUrgency({
  value,
  onChange,
}: {
  value: UrgencySignal[];
  onChange: (v: UrgencySignal[]) => void;
}) {
  const options = URGENCY_OPTIONS;

  const toggle = (id: UrgencySignal) => {
    if (value.includes(id)) {
      onChange(value.filter((v) => v !== id));
    } else if (value.length < 2) {
      onChange([...value, id]);
    }
  };

  return (
    <div className="flex flex-col gap-2.5">
      {options.map((o) => {
        const active = value.includes(o.id);
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => toggle(o.id)}
            className={`flex items-center justify-between rounded-xl border px-5 py-3.5 text-left transition-all duration-200 cursor-pointer ${
              active
                ? "border-foreground bg-foreground text-background"
                : value.length >= 2
                  ? "border-border bg-surface opacity-40 pointer-events-none"
                  : "border-border bg-surface hover:border-foreground/30 hover:-translate-y-px"
            }`}
          >
            <span className="font-mono text-sm">{o.label}</span>
            <span
              className={`ml-4 flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border text-[10px] transition-colors ${
                active
                  ? "border-background bg-background text-foreground"
                  : "border-border"
              }`}
            >
              {active && "✓"}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function StepSummary({
  value,
  onChange,
}: {
  value: SummaryStyle | null;
  onChange: (v: SummaryStyle) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {SUMMARY_OPTIONS.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => onChange(o.id)}
          className={`flex flex-col gap-3 rounded-xl border px-5 py-5 text-left transition-all duration-200 hover:-translate-y-px cursor-pointer ${
            value === o.id
              ? "border-foreground bg-foreground text-background"
              : "border-border bg-surface hover:border-foreground/30"
          }`}
        >
          <div>
            <p className="font-display text-base font-bold">{o.label}</p>
            <p
              className={`mt-0.5 font-mono text-xs ${
                value === o.id ? "text-background/60" : "text-muted"
              }`}
            >
              {o.sub}
            </p>
          </div>
          <p
            className={`rounded-lg border px-3 py-2 font-mono text-[0.65rem] leading-relaxed italic ${
              value === o.id
                ? "border-background/20 bg-background/10 text-background/70"
                : "border-border bg-surface-warm text-muted"
            }`}
          >
            {o.example}
          </p>
        </button>
      ))}
    </div>
  );
}

function StepFollowUp({
  value,
  onChange,
}: {
  value: FollowUp | null;
  onChange: (v: FollowUp) => void;
}) {
  const options = FOLLOWUP_OPTIONS;

  return (
    <div className="flex flex-col gap-3">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => onChange(o.id)}
          className={`flex flex-col gap-1 rounded-xl border px-5 py-4 text-left transition-all duration-200 hover:-translate-y-px cursor-pointer ${
            value === o.id
              ? "border-foreground bg-foreground text-background"
              : "border-border bg-surface hover:border-foreground/30"
          }`}
        >
          <p className="font-mono text-sm font-medium">{o.label}</p>
          <p
            className={`font-mono text-xs ${
              value === o.id ? "text-background/60" : "text-muted"
            }`}
          >
            {o.sub}
          </p>
        </button>
      ))}
    </div>
  );
}

const MAX_VIPS = 5;

function StepVIPs({
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
    if (value.length >= MAX_VIPS) {
      setError(`Max ${MAX_VIPS} VIPs allowed.`);
      return;
    }
    if (!isValidVIP(trimmed)) {
      setError("Enter a valid name or email address.");
      return;
    }
    if (value.includes(trimmed)) {
      setError("Already added.");
      return;
    }
    onChange([...value, trimmed]);
    setInput("");
    setError("");
  };

  const removeChip = (chip: string) =>
    onChange(value.filter((v) => v !== chip));

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
    <div className="flex flex-col gap-4">
      <p className="font-mono text-sm text-muted">
        Emails from these people will always be flagged as high priority — no
        matter what.
      </p>

      <div
        className={`flex min-h-[60px] flex-wrap items-start gap-2 rounded-xl border bg-surface px-4 py-3 transition-colors focus-within:border-foreground/40 ${
          error ? "border-red-400/60" : "border-border"
        }`}
      >
        {value.map((chip) => (
          <span
            key={chip}
            className="flex items-center gap-1.5 rounded-full border border-border bg-surface-warm px-3 py-1 font-mono text-xs text-foreground"
          >
            {chip}
            <button
              type="button"
              onClick={() => removeChip(chip)}
              className="ml-0.5 leading-none text-muted hover:text-foreground cursor-pointer"
              aria-label={`Remove ${chip}`}
            >
              ×
            </button>
          </span>
        ))}
        {!atMax && (
          <input
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setError("");
            }}
            onKeyDown={handleKey}
            onBlur={() => input.trim() && addChip(input)}
            placeholder={
              value.length === 0
                ? "Type a name or email, press Enter"
                : "Add another…"
            }
            className="min-w-[200px] flex-1 bg-transparent font-mono text-sm text-foreground placeholder:text-muted focus:outline-none"
          />
        )}
      </div>

      <div className="flex items-center justify-between">
        {error ? (
          <p className="font-mono text-xs text-red-400">{error}</p>
        ) : (
          <p className="font-mono text-xs text-muted">
            Names or email addresses only.
          </p>
        )}
        <p className="font-mono text-xs text-muted">
          {value.length}/{MAX_VIPS}
        </p>
      </div>
    </div>
  );
}

function StepPrivacy({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      {PRIVACY_OPTIONS.map((o) => (
        <button
          key={String(o.optOut)}
          type="button"
          onClick={() => onChange(o.optOut)}
          className={`flex items-start gap-4 rounded-xl border px-5 py-4 text-left transition-all duration-200 hover:-translate-y-px cursor-pointer ${
            value === o.optOut
              ? "border-foreground bg-foreground text-background"
              : "border-border bg-surface hover:border-foreground/30"
          }`}
        >
          <div>
            <p className="font-mono text-sm font-medium">{o.label}</p>
            <p
              className={`mt-0.5 font-mono text-xs ${
                value === o.optOut ? "text-background/60" : "text-muted"
              }`}
            >
              {o.sub}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter();
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);

  if (!started) {
    return (
      <div
        data-landing
        className="relative flex min-h-screen flex-col bg-background text-foreground"
      >
        {/* Grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)] bg-size-[40px_40px] opacity-50" />
        {/* Radial fade overlay */}
        <div className="pointer-events-none absolute inset-0 bg-background mask-[radial-gradient(ellipse_at_center,transparent_30%,black)]" />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(to right, rgba(255,64,0,0.03) 0%, transparent 35%, transparent 65%, rgba(255,64,0,0.03) 100%)",
          }}
        />

        <main className="relative z-10 mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-6 py-16">
          <motion.div
            initial={{ opacity: 0, y: -10, filter: "blur(12px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="mb-6">
              <LogoWithText />
            </div>
            <h1 className="font-display text-3xl font-bold leading-snug sm:text-4xl">
              Before you dive in, we have a few questions.
            </h1>
            <p className="mt-4 font-display text-base text-muted">
              Answer these questions so that Calrix can be tuned to the way you
              work. It takes less than a minute.
            </p>
            <button
              type="button"
              onClick={() => setStarted(true)}
              className="mt-10 rounded-full bg-foreground px-7 py-3 font-mono text-sm text-background transition-all duration-200 hover:-translate-y-px hover:bg-accent hover:shadow-md cursor-pointer"
            >
              Start
            </button>
          </motion.div>
        </main>

        {/* Progress bar placeholder */}
        <div className="relative z-10 h-0.5 w-full bg-border" />
      </div>
    );
  }

  const patch = <K extends keyof FormState>(key: K, val: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: val }));

  const advance = () => {
    if (step < TOTAL_STEPS - 1) {
      setStep((s) => s + 1);
    } else {
      const timezone =
        Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
      sessionStorage.setItem(
        "calrix_onboarding",
        JSON.stringify({ ...form, timezone }),
      );
      document.cookie = "onboarding_pending=1; path=/; max-age=120";
      router.push("/chat");
    }
  };

  const back = () => setStep((s) => Math.max(0, s - 1));

  // Auto-advance for single-select steps
  const patchAndAdvance = <K extends keyof FormState>(
    key: K,
    val: FormState[K],
  ) => {
    setForm((f) => ({ ...f, [key]: val }));
    setTimeout(advance, 160);
  };

  const canAdvance = () => {
    if (step === 0 && form.role === "other")
      return form.roleOther.trim().length > 0;
    if (step === 2) return form.urgencySignals.length > 0;
    if (step === 5) return true;
    if (step === 6) return true;
    return false;
  };

  const progress = (step / (TOTAL_STEPS - 1)) * 100;

  const meta = STEPS[step];

  // Steps that need a manual Continue button (multi-select, free text, "other" role, privacy)
  const isManualStep =
    (step === 0 && form.role === "other") ||
    step === 2 ||
    step === 5 ||
    step === 6;

  return (
    <div
      data-landing
      className="relative flex min-h-screen flex-col bg-background text-foreground"
    >
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)] bg-size-[40px_40px] opacity-50" />
      <div className="pointer-events-none absolute inset-0 bg-background mask-[radial-gradient(ellipse_at_center,transparent_30%,black)]" />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(to right, rgba(255,64,0,0.03) 0%, transparent 35%, transparent 65%, rgba(255,64,0,0.03) 100%)",
        }}
      />
      {/* Body */}
      <main className="relative z-10 mx-auto flex w-full max-w-lg flex-1 flex-col px-6 py-16">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: -10, filter: "blur(12px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, filter: "blur(6px)" }}
            transition={{
              duration: 0.55,
              ease: [0.16, 1, 0.3, 1],
              opacity: { duration: 0.4 },
              filter: { duration: 0.5 },
            }}
            className="flex flex-1 flex-col"
          >
            {/* Step label + heading */}
            <div className="mb-8">
              <div className="mb-3 flex items-center gap-3">
                <LogoMark size={28} className="rounded-sm" />
                <p className="font-mono text-xs font-semibold uppercase tracking-widest text-muted">
                  {meta.label}
                </p>
              </div>
              <h1 className="font-display text-2xl font-bold leading-snug sm:text-3xl">
                {meta.heading}
              </h1>
              <p className="mt-2 font-display text-sm text-muted">{meta.sub}</p>
            </div>

            {/* Step content */}
            <div className="flex-1">
              {step === 0 && (
                <StepRole
                  value={form.role}
                  otherValue={form.roleOther}
                  onChange={(v) => {
                    patch("role", v);
                    if (v !== "other") setTimeout(advance, 160);
                  }}
                  onOtherChange={(v) => patch("roleOther", v)}
                />
              )}
              {step === 1 && (
                <StepVolume
                  value={form.volume}
                  onChange={(v) => patchAndAdvance("volume", v)}
                />
              )}
              {step === 2 && (
                <StepUrgency
                  value={form.urgencySignals}
                  onChange={(v) => patch("urgencySignals", v)}
                />
              )}
              {step === 3 && (
                <StepSummary
                  value={form.summaryStyle}
                  onChange={(v) => patchAndAdvance("summaryStyle", v)}
                />
              )}
              {step === 4 && (
                <StepFollowUp
                  value={form.followUp}
                  onChange={(v) => patchAndAdvance("followUp", v)}
                />
              )}
              {step === 5 && (
                <StepVIPs
                  value={form.vipSenders}
                  onChange={(v) => patch("vipSenders", v)}
                />
              )}
              {step === 6 && (
                <StepPrivacy
                  value={form.trainingOptOut}
                  onChange={(v) => patch("trainingOptOut", v)}
                />
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="mt-10 flex items-center gap-4">
          <button
            type="button"
            onClick={back}
            disabled={step === 0}
            className="shrink-0 rounded-full border border-border px-5 py-2.5 font-mono text-sm text-muted transition-all hover:border-foreground/30 hover:text-foreground disabled:pointer-events-none disabled:opacity-0"
          >
            Back
          </button>

          {/* Progress bar */}
          <div className="h-0.5 flex-1 rounded-full bg-border">
            <div
              className="h-full rounded-full bg-accent transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          {isManualStep ? (
            <button
              type="button"
              onClick={advance}
              disabled={!canAdvance()}
              className="shrink-0 rounded-full bg-foreground px-5 py-2.5 font-mono text-sm text-background transition-all duration-200 hover:-translate-y-px hover:bg-accent hover:shadow-md disabled:pointer-events-none disabled:opacity-30"
            >
              {step === TOTAL_STEPS - 1 ? "Finish" : "Continue"}
            </button>
          ) : (
            <div className="w-[90px]" />
          )}
        </div>
      </main>
    </div>
  );
}
