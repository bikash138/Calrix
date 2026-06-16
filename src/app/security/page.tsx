import Link from "next/link";
import Image from "next/image";
import FooterSection from "@/components/landing/footer-section";
import { SECTIONS } from "@/data/security";

export default function SecurityPage() {
  return (
    <div data-landing className="flex flex-col bg-background text-foreground">
      {/* Content area — grid scoped here so it doesn't bleed over footer */}
      <div className="relative min-h-screen">
        {/* Grid background */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)] bg-size-[40px_40px] opacity-50" />
        <div className="pointer-events-none absolute inset-0 bg-background mask-[radial-gradient(ellipse_at_center,transparent_30%,black)]" />

        {/* Nav */}
        <header className="relative z-10 flex items-center justify-between px-8 py-6">
          <Link
            href="/"
            className="flex items-center gap-2.5 transition-opacity hover:opacity-75"
          >
            <Image
              src="/icon.svg"
              alt="Calrix"
              width={28}
              height={28}
              className="rounded-sm"
            />
            <span className="font-[sans-serif] text-xl font-bold tracking-tight">
              Calrix
            </span>
          </Link>
          <Link
            href="/signin"
            className="rounded-full bg-foreground px-5 py-2 font-mono text-sm text-background transition-all hover:-translate-y-px hover:bg-[#ff4000]"
          >
            Sign in
          </Link>
        </header>

        {/* Content */}
        <main className="relative z-10 mx-auto max-w-2xl px-6 pb-24 pt-12">
          <div className="mb-12">
            <p className="mb-2 font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Privacy &amp; Security
            </p>
            <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
              Your data, handled with care.
            </h1>
            <p className="mt-4 text-base text-muted-foreground">
              Calrix connects to your Gmail and Google Calendar to work on your
              behalf. Here is exactly what we do — and do not do — with your
              data.
            </p>
            <p className="mt-3 font-mono text-xs text-muted-foreground">
              Last updated: June 2026
            </p>
          </div>

          <div className="space-y-10">
            {SECTIONS.map(({ title, body }) => (
              <section key={title} className="border-t border-border pt-8">
                <h2 className="font-display text-xl font-semibold tracking-tight">
                  {title}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {body}
                </p>
              </section>
            ))}
          </div>
        </main>
      </div>
      {/* end grid-scoped content */}
      <FooterSection />
    </div>
  );
}
