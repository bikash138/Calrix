import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { SectionHeading, Reveal } from "./core/motion-primitives";
import { PLANS } from "@/data/pricing";

export default function PricingSection() {
  return (
    <section id="pricing" className="bg-background py-16 md:py-20">
      <div className="mx-auto w-full max-w-6xl px-6">
        <SectionHeading className="mb-3 text-center font-display text-4xl font-bold tracking-tight md:text-5xl">
          Pricing that proves itself
        </SectionHeading>
        <Reveal delay={0.1}>
          <p className="mb-12 text-center text-muted">
            Start small, scale when it pays off. No long contracts.
          </p>
        </Reveal>

        <div className="grid gap-6 md:grid-cols-3">
          {PLANS.map((plan, i) => (
            <Reveal
              key={plan.name}
              delay={i * 0.12}
              className={`flex flex-col rounded-3xl bg-surface p-7 shadow-[0_12px_24px_-10px_rgba(255,64,0,0.2)] ${plan.featured ? "ring-2 ring-accent" : "ring-1 ring-black/5"}`}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-display text-2xl font-bold tracking-tight">
                  {plan.name}
                </h3>
                {plan.featured && (
                  <span className="rounded-full bg-accent/10 px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-accent">
                    Popular
                  </span>
                )}
              </div>
              <p className="mt-2 font-inter text-sm tracking-tight text-muted">
                {plan.tagline}
              </p>

              <div className="mt-6 min-h-[72px]">
                <span className="flex items-baseline gap-2">
                  {plan.oldPrice && (
                    <span className="font-display text-3xl font-bold text-muted line-through">
                      {plan.oldPrice}
                    </span>
                  )}
                  {plan.price && (
                    <span className="font-display text-4xl font-bold tracking-tight">
                      {plan.price}
                    </span>
                  )}
                  {plan.priceNote && (
                    <span className="font-mono text-sm tracking-tighter text-muted">
                      {plan.priceNote}
                    </span>
                  )}
                </span>
                {plan.highlight && (
                  <p className="mt-2 font-mono text-sm tracking-tighter text-accent">
                    {plan.highlight}
                  </p>
                )}
              </div>

              <a
                href="#book"
                className="mt-6 rounded-full bg-foreground px-6 py-3.5 text-center font-display font-semibold tracking-tight text-background shadow-lg transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-accent hover:shadow-xl active:translate-y-0"
              >
                {plan.cta}
              </a>

              <ul className="mt-7 divide-y divide-border border-t border-border">
                {plan.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-3 py-3.5 font-inter text-sm tracking-tight text-foreground/80"
                  >
                    <CheckCircleIcon
                      className="shrink-0 text-accent"
                      style={{ fontSize: 20 }}
                    />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
