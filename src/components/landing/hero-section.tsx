import Image from "next/image";
import manImg from "@/assets/landing/man.webp";
import heroWaveImg from "@/assets/landing/hero-wave.svg";
import { HeroArchDecor } from "@/assets/landing/hero-arch-decor";
import { HeroMock } from "./core/hero-mock";
import { GmailIcon } from "@/assets/gmail-icon";
import { GoogleCalendarIcon } from "@/assets/google-calendar-icon";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          maskImage:
            "radial-gradient(ellipse 80% 60% at 50% 0%, #000 40%, transparent 100%)",
        }}
      />

      <div className="relative mx-auto w-full max-w-6xl px-6 pt-10 md:pt-16">
        <div className="grid items-start gap-8 md:grid-cols-[1.5fr_1fr] md:gap-0">
          <div className="border-l border-border py-2 pl-6 md:pl-10">
            <h1 className="font-display text-5xl font-medium leading-[1.02] tracking-tight md:text-6xl">
              Your{" "}
              <span className="inline-flex items-center gap-2 align-middle">
                <GmailIcon style={{ width: "1.2em", height: "1.2em" }} />
              </span>{" "}
              and{" "}
              <span className="inline-flex items-center gap-2 align-middle">
                <GoogleCalendarIcon
                  style={{ width: "1.2em", height: "1.2em" }}
                />
              </span>
              on Autopilot
              <span className="text-accent">.</span>
            </h1>
          </div>
          <div className="border-border pl-6 md:border-l md:px-10 md:py-1">
            <p className="text-balance text-xl font-semibold leading-snug text-foreground md:text-2xl">
              Email and calendar work you shouldn&apos;t have to&nbsp;do.
            </p>
            <p className="mt-4 text-sm leading-relaxed md:text-base">
              <span className="font-semibold text-accent">
                Calrix handles it
              </span>
              <span className="font-medium text-muted">
                {" "}
                with agentic AI built around how you work.
              </span>
            </p>
          </div>
        </div>
      </div>

      <div className="relative mt-48 md:mt-56">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/3 -z-10 h-72 w-[55%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] bg-accent/20 blur-3xl"
        />

        <Image
          src={manImg}
          alt=""
          aria-hidden
          priority
          placeholder="blur"
          sizes="(max-width: 768px) 380px, (max-width: 1024px) 520px, 640px"
          className="pointer-events-none absolute left-1/2 z-5 w-[380px] -translate-x-1/2 top-[-160px] md:w-[520px] md:top-[-220px] lg:w-[640px] lg:top-[-280px]"
        />

        <div className="relative mx-auto w-full max-w-6xl pb-16 md:pb-24">
          <HeroArchDecor />
          <Image
            src={heroWaveImg}
            alt=""
            aria-hidden
            width={1199}
            height={601}
            className="pointer-events-none relative z-10 block w-full"
          />

          <div className="relative z-10 mx-auto mt-[-41%] w-full px-6">
            <div
              className="rounded-4xl p-[14px] backdrop-blur-md"
              style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.14)" }}
            >
              <div
                className="overflow-hidden rounded-[22px] shadow-[0_32px_50px_-26px_rgba(255,64,0,0.3)]"
                style={{ aspectRatio: "16/9" }}
              >
                <HeroMock />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
