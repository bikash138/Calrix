import Link from "next/link";
import Image from "next/image";
import { Check } from "lucide-react";
import { PLANS } from "@/data/pricing";
import FooterSection from "@/components/landing/footer-section";

export default function PricingPage() {
  return (
    <div data-landing className="flex flex-col bg-background text-foreground">
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
            className="rounded-full bg-foreground px-5 py-2 font-mono text-sm text-background transition-all hover:-translate-y-px hover:bg-accent"
          >
            Sign in
          </Link>
        </header>

        {/* Hero */}
        <div className="relative z-10 mx-auto max-w-6xl px-6 pb-20 pt-12 text-center">
          <h1 className="font-display text-5xl font-bold tracking-tight md:text-6xl">
            Pricing that proves itself
          </h1>
          <p className="mt-4 text-base text-muted-foreground">
            Start small, scale when it pays off. No long contracts.
          </p>

          {/* Plans */}
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`flex flex-col rounded-3xl bg-white p-7 text-left shadow-[0_12px_24px_-10px_rgba(255,64,0,0.15)] ${
                  plan.featured
                    ? "ring-2 ring-[#ff4000]"
                    : "ring-1 ring-black/5"
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-2xl font-bold tracking-tight">
                    {plan.name}
                  </h3>
                  {plan.featured && (
                    <span className="rounded-full bg-[#ff4000]/10 px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-[#ff4000]">
                      Popular
                    </span>
                  )}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {plan.tagline}
                </p>

                <div className="mt-6 min-h-[72px]">
                  <div className="flex items-baseline gap-2">
                    {plan.oldPrice && (
                      <span className="font-display text-3xl font-bold text-muted-foreground line-through">
                        {plan.oldPrice}
                      </span>
                    )}
                    {plan.price && (
                      <span className="font-display text-4xl font-bold tracking-tight">
                        {plan.price}
                      </span>
                    )}
                    {plan.priceNote && (
                      <span className="font-mono text-sm text-muted-foreground">
                        {plan.priceNote}
                      </span>
                    )}
                  </div>
                  {plan.highlight && (
                    <p className="mt-2 font-mono text-sm text-[#ff4000]">
                      {plan.highlight}
                    </p>
                  )}
                </div>

                <Link
                  href="/signin"
                  className="mt-6 rounded-full bg-foreground px-6 py-3.5 text-center font-display font-semibold tracking-tight text-background shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#ff4000] hover:shadow-xl"
                >
                  {plan.cta}
                </Link>

                <ul className="mt-7 divide-y divide-border border-t border-border">
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-3 py-3.5 text-sm text-foreground/80"
                    >
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#ff4000]" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <p className="mt-10 text-sm text-muted-foreground">
            Questions?{" "}
            <a
              href="mailto:hello@calrix.ai"
              className="underline underline-offset-2 hover:text-foreground"
            >
              Talk to us
            </a>
            .
          </p>
        </div>
      </div>
      {/* end grid-scoped content */}
      <FooterSection />
    </div>
  );
}
