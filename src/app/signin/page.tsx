"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { authClient } from "@/server/better-auth/client";
import { Button } from "@/components/ui/button";
import { GmailIcon } from "@/assets/gmail-icon";
import { GoogleCalendarIcon } from "@/assets/google-calendar-icon";
import { GoogleIcon } from "@/assets/google-icon";

export default function SignInPage() {
  const [loading, setLoading] = useState(false);

  async function signInWithGoogle() {
    setLoading(true);
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/chat",
    });
  }

  return (
    <div className="relative flex h-screen items-center justify-end overflow-hidden bg-black">
      {/* Card — right half */}
      <div className="relative z-10 flex h-full w-1/2 flex-col overflow-hidden rounded-l-[5rem]  bg-white shadow-[-40px_0_80px_rgba(0,0,0,0.5)]">
        {/* Content */}
        <div className="relative z-10 flex h-full flex-col px-14 py-12">
          {/* Top bar: Logo (fixed) + Privacy Policy */}
          <div className="flex shrink-0 items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2.5 transition-opacity hover:opacity-70"
            >
              <Image
                src="/icon.svg"
                alt="Calrix"
                width={42}
                height={42}
                className="rounded-md"
              />
              <span className="font-[sans-serif] text-3xl font-bold tracking-tight text-gray-900">
                Calrix
              </span>
            </Link>
            <Link
              href="/security"
              className="text-xs text-gray-400 underline underline-offset-2 hover:text-gray-700"
            >
              Privacy Policy
            </Link>
          </div>

          {/* Center form — grows to fill space */}
          <div className="flex flex-1 flex-col items-center justify-center gap-7 text-center">
            <div className="flex flex-col items-center gap-2">
              <h1 className="text-5xl font-semibold tracking-tight text-gray-900">
                Sign in
              </h1>
              <p className="text-sm text-gray-500">
                Your email &amp; calendar manager
              </p>
            </div>

            <ul className="w-full max-w-xs space-y-3 text-left">
              {[
                {
                  icon: <GmailIcon className="h-4 w-4 shrink-0" />,
                  label: "Triage and draft email replies",
                },
                {
                  icon: <GoogleCalendarIcon className="h-4 w-4 shrink-0" />,
                  label: "Schedule and manage meetings",
                },
                {
                  icon: (
                    <Image
                      src="/icon.svg"
                      alt="Calrix"
                      width={16}
                      height={16}
                      className="rounded-[3px]"
                    />
                  ),
                  label: "Calrix AI, which works for you",
                },
              ].map(({ icon, label }) => (
                <li
                  key={label}
                  className="flex items-center gap-3 text-sm text-gray-500"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white shadow-sm">
                    {icon}
                  </span>
                  {label}
                </li>
              ))}
            </ul>

            <Button
              onClick={signInWithGoogle}
              disabled={loading}
              variant="outline"
              size="lg"
              className="w-64 cursor-pointer gap-3 rounded-full py-5 text-sm font-medium transition-colors"
            >
              {loading ? <SpinnerIcon /> : <GoogleIcon />}
              {loading ? "Signing in…" : "Continue with Google"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SpinnerIcon() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  );
}
