"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import tab1Img from "@/assets/landing/workflow-tabs/tab1.webp";
import tab2Img from "@/assets/landing/workflow-tabs/tab2.webp";
import tab3Img from "@/assets/landing/workflow-tabs/tab3.webp";
import tab4Img from "@/assets/landing/workflow-tabs/tab4.webp";

const TAB_IMAGES = [tab1Img, tab2Img, tab3Img, tab4Img];
const workflowVideo = "/workflow-video.mp4";

import { TABS } from "@/data/workflow-tabs";
import CalrixAIMock from "../mock-workflows/calrix-ai-mock";
import ActionsMock from "../mock-workflows/actions-mock";
import InboxMock from "../mock-workflows/inbox-mock";
import CalendarMock from "../mock-workflows/calendar-mock";
import FollowupsMock from "../mock-workflows/followups-mock";

function NoteIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect
        x="4"
        y="3"
        width="16"
        height="18"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M8 8h8M8 12h8M8 16h5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function WorkflowTabs() {
  const [active, setActive] = useState(0);
  const tab = TABS[active];
  const reduce = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    const section = sectionRef.current;
    if (!video || !section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.playbackRate = 0.8;
          video.play();
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, [active]);

  return (
    <div className="mx-auto w-full max-w-6xl px-6">
      <div className="grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-3 md:grid-cols-5">
        {TABS.map((t, i) => {
          const isActive = i === active;
          return (
            <button
              key={t.label}
              type="button"
              onClick={() => setActive(i)}
              className={`flex cursor-pointer items-center gap-2 border-b-2 pb-3 font-mono text-sm uppercase tracking-tighter transition-colors duration-300 ease-out ${
                isActive
                  ? "border-accent text-accent"
                  : "border-border text-muted hover:text-foreground"
              }`}
            >
              <span
                className={`grid h-5 w-5 shrink-0 place-items-center rounded border text-[11px] transition-colors duration-300 ease-out ${isActive ? "border-accent text-accent" : "border-border text-muted"}`}
              >
                {i + 1}
              </span>
              {t.label}
            </button>
          );
        })}
      </div>

      <div
        ref={sectionRef}
        className="mt-10 rounded-[2rem] bg-surface-warm-2 p-2.5 ring-1 ring-black/5"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            className="grid gap-2.5 md:grid-cols-2"
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <div className="flex flex-col rounded-[1.6rem] bg-surface p-8">
              <span className="text-foreground/80">
                <NoteIcon />
              </span>
              <h3 className="mt-5 font-display text-2xl font-bold tracking-tighter">
                {tab.heading}
              </h3>
              <p className="mt-3 font-mono text-sm tracking-tighter text-accent">
                {tab.tagline}
              </p>
              <div className="mt-auto space-y-6 pt-12">
                {tab.points.map((p, i) => (
                  <div
                    key={p.title}
                    className={i > 0 ? "border-t border-border pt-6" : ""}
                  >
                    <h4 className="font-inter font-semibold tracking-tighter">
                      {p.title}
                    </h4>
                    <p className="mt-2 text-sm leading-relaxed tracking-tighter text-muted">
                      {p.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative grid min-h-[420px] place-items-center overflow-hidden rounded-[1.6rem]">
              {active === 0 ? (
                <video
                  ref={videoRef}
                  src={workflowVideo}
                  muted
                  playsInline
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <Image
                  src={TAB_IMAGES[active - 1]}
                  alt=""
                  fill
                  placeholder="blur"
                  sizes="(max-width: 1152px) 100vw, 1152px"
                  className="object-cover"
                />
              )}
              {active === 0 && <CalrixAIMock />}
              {active === 1 && <ActionsMock />}
              {active === 2 && <InboxMock />}
              {active === 3 && <CalendarMock />}
              {active === 4 && <FollowupsMock />}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
