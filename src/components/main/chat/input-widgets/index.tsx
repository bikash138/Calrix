"use client";

import { motion } from "motion/react";
import {
  requestUserInputSchema,
  type UserInputResult,
} from "@/lib/request-input.schema";
import { EventFormWidget } from "./event-form-widget";
import { EmailDraftWidget } from "./email-draft-widget";
import { RadioWidget } from "./radio-widget";
import { MultiSelectWidget } from "./multiselect-widget";
import { FormWidget } from "./form-widget";

type Props = {
  /** Raw tool input from the AI (validated here against the shared schema). */
  input: unknown;
  onSubmit: (result: UserInputResult) => void;
  onCancel: () => void;
  disabled?: boolean;
};

function renderWidget({ input, onSubmit, onCancel, disabled }: Props) {
  const parsed = requestUserInputSchema.safeParse(input);

  if (!parsed.success) {
    return (
      <FallbackBar
        message="I couldn't render that prompt. Type your answer instead."
        onCancel={onCancel}
      />
    );
  }

  const data = parsed.data.request;

  switch (data.kind) {
    case "event_form":
      return (
        <EventFormWidget
          label={data.label}
          prefilled={data.prefilled}
          onSubmit={onSubmit}
          onCancel={onCancel}
          disabled={disabled}
        />
      );
    case "radio":
      return (
        <RadioWidget
          label={data.label}
          options={data.options}
          onSubmit={onSubmit}
          onCancel={onCancel}
          disabled={disabled}
        />
      );
    case "multiselect":
      return (
        <MultiSelectWidget
          label={data.label}
          options={data.options}
          onSubmit={onSubmit}
          onCancel={onCancel}
          disabled={disabled}
        />
      );
    case "form":
      return (
        <FormWidget
          label={data.label}
          fields={data.fields}
          onSubmit={onSubmit}
          onCancel={onCancel}
          disabled={disabled}
        />
      );
    case "email_draft":
      return (
        <EmailDraftWidget
          label={data.label}
          to={data.to}
          subject={data.subject}
          body={data.body}
          onSubmit={onSubmit}
          onCancel={onCancel}
          disabled={disabled}
        />
      );
    default:
      return (
        <FallbackBar
          message="Type your answer to continue."
          onCancel={onCancel}
        />
      );
  }
}

/**
 * Renders the correct input-bar widget for a pending `request_user_input` tool
 * call, wrapped in a soft entrance animation so it eases in rather than popping.
 * The AI's input is re-validated against the shared zod schema before any widget
 * is shown, so malformed tool calls degrade gracefully.
 */
export function InputWidget(props: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.97, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      style={{ transformOrigin: "bottom center" }}
    >
      {renderWidget(props)}
    </motion.div>
  );
}

function FallbackBar({
  message,
  onCancel,
}: {
  message: string;
  onCancel: () => void;
}) {
  return (
    <div className="flex w-full items-center justify-between rounded-3xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-500 dark:border-white/10 dark:bg-white/5 dark:text-zinc-400">
      <span>{message}</span>
      <button
        onClick={onCancel}
        className="font-medium text-orange-500 hover:text-orange-600"
      >
        Type instead
      </button>
    </div>
  );
}
