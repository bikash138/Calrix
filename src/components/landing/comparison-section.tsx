import { COMPARE_COLS, COMPARISON_ROWS } from "@/data/comparison";
import { SectionHeading, Reveal } from "./core/motion-primitives";
import ComparisonRows from "./core/comparison-rows";

export default function ComparisonSection() {
  return (
    <section id="compare" className="bg-background py-16 md:py-20">
      <div className="mx-auto w-full max-w-6xl px-6">
        <SectionHeading className="text-center font-display text-4xl font-bold leading-tight tracking-tight md:text-5xl">
          Why Calrix Is the Smarter Choice
        </SectionHeading>
        <Reveal delay={0.1}>
          <p className="mx-auto mt-4 max-w-2xl text-center leading-relaxed text-muted tracking-tighter">
            Calrix runs your email and calendar around the clock -{" "}
            <span className="font-semibold text-foreground">
              faster, cheaper, and more private
            </span>{" "}
            than every alternative.
          </p>
        </Reveal>

        <div className="mt-14 overflow-x-auto">
          <table className="w-full min-w-[840px] border-collapse text-left text-sm">
            <thead>
              <tr>
                <th className="w-[19%] p-4" />
                <th className="w-[21%] rounded-t-2xl bg-accent px-5 py-6 text-center align-bottom">
                  <span className="font-display text-xl font-bold text-white">
                    {COMPARE_COLS.calrix}
                  </span>
                </th>
                <th className="px-5 py-6 text-center align-bottom font-display text-base font-bold leading-snug">
                  {COMPARE_COLS.generic}
                </th>
                <th className="px-5 py-6 text-center align-bottom font-display text-base font-bold leading-snug">
                  {COMPARE_COLS.ea}
                </th>
                <th className="px-5 py-6 text-center align-bottom font-display text-base font-bold leading-snug">
                  {COMPARE_COLS.status}
                </th>
              </tr>
            </thead>
            <ComparisonRows rows={COMPARISON_ROWS} />
          </table>
        </div>
      </div>
    </section>
  );
}
