"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { LogoWithText } from "@/assets/logo-with-text";
import { XIcon } from "@/assets/x-icon";
import { LinkedInIcon } from "@/assets/linkedin-icon";

const MotionLink = motion.create(Link);

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "Security", href: "#security" },
  { label: "About", href: "#about" },
];

export default function Navbar() {
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    let lastY = window.scrollY;

    const onScroll = () => {
      const currentY = window.scrollY;
      const goingDown = currentY > lastY;

      if (goingDown && currentY > 80 && !menuOpen) {
        setHidden(true);
      } else if (!goingDown) {
        setHidden(false);
      }

      lastY = currentY;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [menuOpen]);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <header
        className={`sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur transition-transform duration-300 ${
          hidden ? "-translate-y-full" : "translate-y-0"
        }`}
      >
        <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
          <LogoWithText />

          <div className="hidden items-center gap-7 lg:flex">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                className="font-mono text-sm tracking-tighter text-foreground/70 transition-colors duration-300 ease-out hover:text-foreground"
              >
                {l.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/signin"
              className="hidden rounded-full bg-foreground px-4 py-2 font-display text-sm font-medium text-background transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-accent hover:shadow-md active:translate-y-0 lg:inline-block"
            >
              Get Started
            </Link>

            <button
              type="button"
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((o) => !o)}
              className="grid h-10 w-10 place-items-center rounded-full transition-colors duration-300 ease-out hover:bg-surface-warm active:scale-95 lg:hidden"
            >
              <span className="relative block h-3.5 w-5">
                <span
                  className={`absolute left-0 block h-0.5 w-5 bg-foreground transition-all duration-300 ${menuOpen ? "top-1.5 rotate-45" : "top-0"}`}
                />
                <span
                  className={`absolute left-0 top-1.5 block h-0.5 w-5 bg-foreground transition-all duration-300 ${menuOpen ? "opacity-0" : "opacity-100"}`}
                />
                <span
                  className={`absolute left-0 block h-0.5 w-5 bg-foreground transition-all duration-300 ${menuOpen ? "top-1.5 -rotate-45" : "top-3"}`}
                />
              </span>
            </button>
          </div>
        </nav>
      </header>

      {/* Full-screen mobile overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-40 flex flex-col bg-background px-8 pt-28 pb-12 lg:hidden"
            initial={
              reduce
                ? { opacity: 0 }
                : { opacity: 0, clipPath: "circle(0% at 100% 0%)" }
            }
            animate={
              reduce
                ? { opacity: 1 }
                : { opacity: 1, clipPath: "circle(150% at 100% 0%)" }
            }
            exit={
              reduce
                ? { opacity: 0 }
                : { opacity: 0, clipPath: "circle(0% at 100% 0%)" }
            }
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.nav
              className="flex flex-col gap-1"
              initial="hidden"
              animate="show"
              variants={{
                hidden: {},
                show: {
                  transition: {
                    staggerChildren: reduce ? 0 : 0.07,
                    delayChildren: 0.15,
                  },
                },
              }}
            >
              {NAV_LINKS.map((l) => (
                <MotionLink
                  key={l.label}
                  href={l.href}
                  onClick={() => setMenuOpen(false)}
                  className="w-fit py-2 font-display text-3xl font-bold text-foreground transition-opacity duration-300 ease-out hover:opacity-60 active:opacity-100"
                  variants={{
                    hidden: { opacity: 0, x: reduce ? 0 : -24 },
                    show: {
                      opacity: 1,
                      x: 0,
                      transition: { duration: 0.4, ease: "easeOut" },
                    },
                  }}
                >
                  {l.label}
                </MotionLink>
              ))}
            </motion.nav>

            <motion.div
              className="mt-12 flex flex-col gap-4"
              initial="hidden"
              animate="show"
              variants={{
                hidden: {},
                show: {
                  transition: {
                    staggerChildren: reduce ? 0 : 0.07,
                    delayChildren: 0.15 + NAV_LINKS.length * 0.07,
                  },
                },
              }}
            >
              <MotionLink
                href="https://x.com/Bikash__Shaw"
                aria-label="X"
                className="flex w-fit items-center gap-3 text-foreground/60 transition-colors duration-300 ease-out hover:text-foreground"
                variants={{
                  hidden: { opacity: 0, x: reduce ? 0 : -24 },
                  show: {
                    opacity: 1,
                    x: 0,
                    transition: { duration: 0.4, ease: "easeOut" },
                  },
                }}
              >
                <XIcon className="h-5 w-5" />
              </MotionLink>
              <MotionLink
                href="https://www.linkedin.com/in/bikash-shaw-5ab74727b/"
                aria-label="LinkedIn"
                className="flex w-fit items-center gap-3 text-foreground/60 transition-colors duration-300 ease-out hover:text-foreground"
                variants={{
                  hidden: { opacity: 0, x: reduce ? 0 : -24 },
                  show: {
                    opacity: 1,
                    x: 0,
                    transition: { duration: 0.4, ease: "easeOut" },
                  },
                }}
              >
                <LinkedInIcon className="h-5 w-5" />
              </MotionLink>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
