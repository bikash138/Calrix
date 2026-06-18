"use client";
import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import Image from "next/image";
import footerImg from "@/assets/landing/footer.webp";
import { GmailIcon } from "@/assets/gmail-icon";
import { GoogleCalendarIcon } from "@/assets/google-calendar-icon";
import { GoogleIcon } from "@/assets/google-icon";
import { ClockIcon } from "@/assets/clock-icon";
import ConnectMock from "@/components/landing/mock-workflows/connect-mock";
import CorsairMock from "@/components/landing/mock-workflows/corsair-mock";
import AgentMock from "@/components/landing/mock-workflows/agent-mock";

const STEPS = [
  {
    title: "Gmail & Calendar connect",
    icon: <GoogleIcon />,
    content: <ConnectMock />,
  },
  {
    title: "Corsair handles the calls",
    icon: (
      <Image
        src="/corsair.svg"
        alt="Corsair"
        width={24}
        height={24}
        className="h-6 w-6 object-contain"
      />
    ),
    content: <CorsairMock />,
  },
  {
    title: "Calrix Agent processes it",
    icon: <ClockIcon className="h-6 w-6" />,
    content: <AgentMock />,
  },
];

function nodeFade(active: boolean, delay = 0): CSSProperties {
  return {
    opacity: active ? 1 : 0,
    transform: active
      ? "scale(1) translateY(0)"
      : "scale(0.85) translateY(12px)",
    transition: "opacity 0.5s ease, transform 0.5s ease",
    transitionDelay: active ? `${delay}ms` : "0ms",
    pointerEvents: "none",
  };
}

function drawLine(active: boolean, delay = 0): CSSProperties {
  return {
    strokeDasharray: 1,
    strokeDashoffset: active ? 0 : 1,
    transition: "stroke-dashoffset 0.65s ease",
    transitionDelay: active ? `${delay}ms` : "0ms",
  } as CSSProperties;
}

export default function DiagramSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const el = sectionRef.current;
      if (!el) return;
      const { top, height } = el.getBoundingClientRect();
      const scrollable = height - window.innerHeight;
      if (scrollable <= 0) return;
      const progress = Math.max(0, Math.min(1, -top / scrollable));
      setStep(Math.min(3, Math.floor(progress * 4)));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const showGmail = step >= 0;
  const showCal = step >= 0;
  const showLine12 = step >= 1;
  const showCorsair = step >= 1;
  const showLine3 = step >= 2;
  const showC = step >= 2;
  const showLaptop = step >= 3;

  return (
    <>
      {/* Mobile: icon flow diagram */}
      <div className="md:hidden bg-background px-6 pb-14 pt-6">
        <div className="mx-auto flex max-w-xs flex-col items-center gap-0">
          <div className="flex w-full items-end justify-center gap-10">
            <div className="flex flex-col items-center gap-2">
              <p className="text-xs font-medium text-muted">Gmail</p>
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-md ring-1 ring-black/10">
                <GmailIcon style={{ width: 36, height: 36 }} />
              </div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <p className="text-xs font-medium text-muted">Calendar</p>
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-md ring-1 ring-black/10">
                <GoogleCalendarIcon style={{ width: 36, height: 36 }} />
              </div>
            </div>
          </div>
          <div className="h-8 w-px bg-black/15" />
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-white shadow-md ring-1 ring-black/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/corsair.svg"
                alt="Corsair"
                width={40}
                height={40}
                style={{ objectFit: "contain" }}
              />
            </div>
            <p className="text-xs font-medium text-muted">Corsair</p>
          </div>
          <div className="h-8 w-px bg-black/15" />
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-md ring-1 ring-black/10">
            <Image src="/icon.svg" alt="Calrix" width={36} height={36} />
          </div>
          <p className="mt-2 text-xs font-medium text-muted">Calrix Agent</p>
        </div>
      </div>

      {/* Desktop: sticky scroll */}
      <div
        ref={sectionRef}
        className="hidden bg-background md:block"
        style={{ height: "400vh" }}
      >
        <div
          className="sticky top-0 overflow-hidden bg-background"
          style={{ height: "100vh" }}
        >
          {/* Grid background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)] bg-size-[40px_40px] opacity-50" />
          {/* Radial fade overlay */}
          <div className="pointer-events-none absolute inset-0 bg-background mask-[radial-gradient(ellipse_at_center,transparent_30%,black)]" />
          <div className="relative mx-auto flex h-full w-full max-w-6xl px-6">
            <div className="relative flex-1">
              <svg
                className="pointer-events-none absolute inset-0 h-full w-full"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                aria-hidden
              >
                <defs>
                  <linearGradient
                    id="lineGradGmail"
                    gradientUnits="userSpaceOnUse"
                    x1="30"
                    y1="33"
                    x2="44"
                    y2="46"
                  >
                    <stop offset="0" stopColor="#fb923c" stopOpacity="0" />
                    <stop offset="0.5" stopColor="#fb923c" stopOpacity="0.9" />
                    <stop offset="1" stopColor="#f97316" stopOpacity="0.5" />
                  </linearGradient>
                  <linearGradient
                    id="lineGradCal"
                    gradientUnits="userSpaceOnUse"
                    x1="60"
                    y1="33"
                    x2="44"
                    y2="46"
                  >
                    <stop offset="0" stopColor="#fb923c" stopOpacity="0" />
                    <stop offset="0.5" stopColor="#fb923c" stopOpacity="0.9" />
                    <stop offset="1" stopColor="#f97316" stopOpacity="0.5" />
                  </linearGradient>
                  <linearGradient
                    id="lineGradAgent"
                    gradientUnits="userSpaceOnUse"
                    x1="44"
                    y1="57"
                    x2="44"
                    y2="68"
                  >
                    <stop offset="0" stopColor="#f97316" stopOpacity="0.5" />
                    <stop offset="0.5" stopColor="#fb923c" stopOpacity="0.9" />
                    <stop offset="1" stopColor="#fb923c" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <line
                  x1="30"
                  y1="33"
                  x2="44"
                  y2="46"
                  stroke="url(#lineGradGmail)"
                  strokeWidth="0.3"
                  strokeLinecap="round"
                  pathLength="1"
                  style={drawLine(showLine12, 0)}
                />
                <line
                  x1="60"
                  y1="33"
                  x2="44"
                  y2="46"
                  stroke="url(#lineGradCal)"
                  strokeWidth="0.3"
                  strokeLinecap="round"
                  pathLength="1"
                  style={drawLine(showLine12, 120)}
                />
                <line
                  x1="44"
                  y1="57"
                  x2="44"
                  y2="68"
                  stroke="url(#lineGradAgent)"
                  strokeWidth="0.3"
                  strokeLinecap="round"
                  pathLength="1"
                  style={drawLine(showLine3, 0)}
                />
              </svg>

              <div
                className="absolute"
                style={{
                  left: "30%",
                  top: "22%",
                  transform: "translate(-50%,-50%)",
                }}
              >
                <div style={nodeFade(showGmail, 0)}>
                  <div
                    className="flex items-center justify-center rounded-full bg-white shadow-md ring-1 ring-black/10"
                    style={{
                      width: "clamp(52px,6.5vw,84px)",
                      height: "clamp(52px,6.5vw,84px)",
                    }}
                  >
                    <GmailIcon style={{ width: "58%", height: "58%" }} />
                  </div>
                  <p
                    className="mt-2 text-center font-display font-medium text-muted"
                    style={{ fontSize: "clamp(9px,1vw,11px)" }}
                  >
                    Gmail
                  </p>
                </div>
              </div>

              <div
                className="absolute"
                style={{
                  left: "60%",
                  top: "22%",
                  transform: "translate(-50%,-50%)",
                }}
              >
                <div style={nodeFade(showCal, 120)}>
                  <div
                    className="flex items-center justify-center rounded-full bg-white shadow-md ring-1 ring-black/10"
                    style={{
                      width: "clamp(52px,6.5vw,84px)",
                      height: "clamp(52px,6.5vw,84px)",
                    }}
                  >
                    <GoogleCalendarIcon
                      style={{ width: "58%", height: "58%" }}
                    />
                  </div>
                  <p
                    className="mt-2 text-center font-display font-medium text-muted"
                    style={{ fontSize: "clamp(9px,1vw,11px)" }}
                  >
                    Calendar
                  </p>
                </div>
              </div>

              <div
                className="absolute"
                style={{
                  left: "44%",
                  top: "50%",
                  transform: "translate(-50%,-50%)",
                }}
              >
                <div style={nodeFade(showCorsair, 200)}>
                  <div
                    className="flex items-center justify-center overflow-hidden rounded-full bg-white shadow-md ring-1 ring-black/10"
                    style={{
                      width: "clamp(60px,7.5vw,96px)",
                      height: "clamp(60px,7.5vw,96px)",
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/corsair.svg"
                      alt="Corsair"
                      style={{
                        width: "70%",
                        height: "70%",
                        objectFit: "contain",
                      }}
                    />
                  </div>
                  <p
                    className="mt-2 text-center font-display font-medium text-muted"
                    style={{ fontSize: "clamp(9px,1vw,11px)" }}
                  >
                    Corsair
                  </p>
                </div>
              </div>

              <div
                className="absolute"
                style={{
                  left: "44%",
                  top: "75%",
                  transform: "translate(-50%,-50%)",
                }}
              >
                <div style={nodeFade(showC, 150)}>
                  <div
                    className="flex items-center justify-center rounded-full bg-white shadow-md ring-1 ring-black/10"
                    style={{
                      width: "clamp(52px,6.5vw,84px)",
                      height: "clamp(52px,6.5vw,84px)",
                    }}
                  >
                    <Image
                      src="/icon.svg"
                      alt="Calrix"
                      width={36}
                      height={36}
                      style={{ width: "58%", height: "58%" }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="relative flex w-[42%] shrink-0 flex-col justify-center px-10">
              {STEPS.map((s, i) => (
                <div
                  key={i}
                  className="absolute left-10 right-10"
                  style={{
                    opacity: step === i ? 1 : 0,
                    transform:
                      step === i
                        ? "translateY(0)"
                        : step > i
                          ? "translateY(-22px)"
                          : "translateY(22px)",
                    transition: "opacity 0.4s ease, transform 0.4s ease",
                    pointerEvents: step === i ? "auto" : "none",
                  }}
                >
                  <div
                    className="overflow-hidden rounded-2xl"
                    style={{
                      border: "1px solid rgba(0,0,0,0.08)",
                      background: "#ffffff",
                      boxShadow: "0 2px 20px rgba(0,0,0,0.06)",
                    }}
                  >
                    <div className="flex items-center gap-3 px-6 pb-4 pt-6">
                      <div
                        className="shrink-0"
                        style={{ color: "var(--accent)" }}
                      >
                        {s.icon}
                      </div>
                      <h3 className="font-display text-xl font-bold leading-snug tracking-tight text-foreground">
                        {s.title}
                      </h3>
                    </div>
                    <div
                      className="mx-4 mb-4 overflow-hidden rounded-xl"
                      style={{ height: "260px" }}
                    >
                      {s.content}
                    </div>
                  </div>
                </div>
              ))}

              <div
                className="absolute bottom-0 right-0"
                style={{
                  opacity: showLaptop ? 1 : 0,
                  transform: showLaptop ? "translateX(0)" : "translateX(20px)",
                  transition: "opacity 0.6s ease, transform 0.6s ease",
                  transitionDelay: showLaptop ? "150ms" : "0ms",
                  pointerEvents: showLaptop ? "auto" : "none",
                  width: "80%",
                }}
              >
                <Image
                  src={footerImg}
                  alt="Calrix in action"
                  width={1672}
                  height={941}
                  className="pointer-events-none h-auto w-full"
                  aria-hidden
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
