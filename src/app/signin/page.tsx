"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Ranchers } from "next/font/google";
import { authClient } from "@/server/better-auth/client";
import { Button } from "@/components/ui/button";
import { GmailIcon } from "@/assets/gmail-icon";
import { GoogleCalendarIcon } from "@/assets/google-calendar-icon";
import { GoogleIcon } from "@/assets/google-icon";

const ranchers = Ranchers({ subsets: ["latin"], weight: "400" });

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
      {/* Gmail icon — top-left, 3D blurred */}
      <div
        className="pointer-events-none absolute"
        style={{ top: "8%", left: "2%" }}
      >
        <GmailIcon
          style={{
            width: 200,
            height: 200,
            opacity: 0.18,
            filter: "blur(8px)",
            transform:
              "perspective(500px) rotateY(25deg) rotateX(-15deg) rotate(-10deg)",
          }}
        />
      </div>

      {/* Calendar icon — bottom-right of left half, 3D blurred */}
      <div
        className="pointer-events-none absolute"
        style={{ bottom: "8%", left: "22%" }}
      >
        <GoogleCalendarIcon
          style={{
            width: 180,
            height: 180,
            opacity: 0.15,
            filter: "blur(8px)",
            transform:
              "perspective(500px) rotateY(-20deg) rotateX(15deg) rotate(12deg)",
          }}
        />
      </div>

      {/* Tagline — center of left half */}
      <div className="pointer-events-none absolute inset-0 flex w-1/2 items-center justify-center px-10">
        <p
          className={`${ranchers.className} text-center text-7xl leading-tight tracking-wider`}
          style={{
            background: "linear-gradient(to right, #fdba74, #f97316, #fdba74)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Your brain needs
          <br />
          to think, not
          <br />
          to click.
        </p>
      </div>

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
              <h1 className="font-display text-6xl font-bold tracking-tight text-gray-900">
                Sign in
              </h1>
              <p className="font-mono text-sm tracking-tight text-gray-500">
                Your email &amp; calendar manager
              </p>
            </div>

            <ul className="w-full max-w-xs space-y-3 text-left">
              {[
                {
                  icon: <GmailIcon className="h-4 w-4 shrink-0" />,
                  label: "Inbox sorted, replies drafted",
                },
                {
                  icon: <GoogleCalendarIcon className="h-4 w-4 shrink-0" />,
                  label: "Meetings booked, zero scheduling",
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
                  label: "An AI agent that works for you",
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
