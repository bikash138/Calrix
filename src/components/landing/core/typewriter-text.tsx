"use client";

import { useEffect, useRef, useState } from "react";

const TEXTS = [
  "Less Inbox. More Focus.",
  "Your Calendar, on Autopilot.",
  "Never Miss a Meeting Again.",
  "Email Handled. Day Reclaimed.",
  "Smart Replies. Zero Effort.",
];

export default function TypewriterText() {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  const indexRef = useRef(0);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    let interval: ReturnType<typeof setInterval>;

    const type = () => {
      const text = TEXTS[indexRef.current];
      let i = 0;
      setDone(false);
      setDisplayed("");

      interval = setInterval(() => {
        i++;
        setDisplayed(text.slice(0, i));
        if (i >= text.length) {
          clearInterval(interval);
          setDone(true);
          timeout = setTimeout(() => {
            indexRef.current = (indexRef.current + 1) % TEXTS.length;
            type();
          }, 2500);
        }
      }, 55);
    };

    type();
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  return (
    <>
      {displayed}
      {!done && (
        <span className="ml-1 inline-block h-4 w-[3px] animate-pulse bg-accent" />
      )}
    </>
  );
}
