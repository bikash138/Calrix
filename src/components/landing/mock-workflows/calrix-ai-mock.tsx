import { EmailDraftWidget } from "@/components/main/chat/input-widgets/email-draft-widget";

const noop = () => {};

/**
 * Decorative, non-interactive mock of the Calrix AI chat surface.
 * Reuses the real chat EmailDraftWidget so the landing page shows the
 * actual product UI. Sits centered over the workflow tab background
 * with a glassy frame and is fully non-clickable.
 */
export default function CalrixAIMock() {
  return (
    <div className="pointer-events-none w-[92%] max-w-md origin-center scale-[0.82] select-none">
      <div className="flex flex-col gap-3 rounded-[1.75rem] bg-white/70 p-4 shadow-2xl shadow-black/10 ring-1 ring-white/40 backdrop-blur-xl">
        {/* User request (sets up the widget) */}
        <div className="flex justify-end">
          <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-blue-900 px-4 py-2.5 text-sm text-white">
            Reply to Sarah — let her know Thursday 2pm works.
          </div>
        </div>

        {/* The real chat widget, rendered statically */}
        <EmailDraftWidget
          label="Review and send"
          to="sarah@acme.com"
          subject="Re: Project sync this week"
          body={
            "Hi Sarah,\n\nThursday at 2pm works for me — I'll send a calendar invite shortly.\n\nBest,\nBikash"
          }
          onSubmit={noop}
          onCancel={noop}
        />
      </div>
    </div>
  );
}
