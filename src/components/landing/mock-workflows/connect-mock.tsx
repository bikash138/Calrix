import { Check } from "lucide-react";
import { GmailIcon } from "@/assets/gmail-icon";
import { GoogleCalendarIcon } from "@/assets/google-calendar-icon";
import { LogoMark } from "@/assets/logo";

const SCOPES = [
  {
    icon: <GmailIcon style={{ width: 18, height: 18 }} />,
    label: "Read and modify your Gmail",
  },
  {
    icon: <GoogleCalendarIcon style={{ width: 18, height: 18 }} />,
    label: "Read and modify your Google Calendar",
  },
];

/**
 * Decorative, non-interactive mock of the Google OAuth consent screen
 * shown when a user connects their accounts to Calrix. Used in the
 * first step card of the diagram section.
 */
export default function ConnectMock() {
  return (
    <div className="pointer-events-none flex h-full w-full select-none items-center justify-center">
      <div className="h-full w-full overflow-hidden rounded-2xl border border-black/10 bg-white px-6 py-5 shadow-xl shadow-black/5">
        {/* Title */}
        <p className="text-[0.95rem] font-medium leading-snug text-zinc-800">
          <LogoMark
            size={16}
            className="mr-1.5 inline-block h-4 w-4 -translate-y-px rounded-sm align-middle"
          />
          Calrix wants access to your Google Account
        </p>

        {/* Account chip */}
        <div className="mt-2.5 inline-flex items-center gap-1.5 text-[0.7rem] text-zinc-500">
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[0.55rem] font-bold text-white">
            B
          </span>
          bikash@gmail.com
        </div>

        {/* Scopes */}
        <p className="mt-4 text-[0.72rem] font-medium text-zinc-600">
          This will allow Calrix to:
        </p>
        <div className="mt-2 space-y-2.5">
          {SCOPES.map((s) => (
            <div key={s.label} className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-100">
                {s.icon}
              </span>
              <span className="flex-1 text-[0.72rem] leading-snug text-zinc-600">
                {s.label}
              </span>
              <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded bg-blue-600 text-white">
                <Check className="h-3 w-3" strokeWidth={3} />
              </span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="mt-5 flex items-center justify-end gap-2">
          <span className="rounded-md px-3 py-1.5 text-[0.72rem] font-medium text-blue-600">
            Cancel
          </span>
          <span className="rounded-md bg-blue-600 px-4 py-1.5 text-[0.72rem] font-medium text-white shadow-sm">
            Continue
          </span>
        </div>
      </div>
    </div>
  );
}
