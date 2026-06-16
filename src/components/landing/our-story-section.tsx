import TypewriterText from "./core/typewriter-text";
import { StaggeredSectionHeading, Reveal } from "./core/motion-primitives";

export default function OurStorySection() {
  return (
    <>
      <section id="about" className="bg-background py-16 md:py-20">
        <div className="mx-auto flex w-full max-w-4xl flex-col items-center px-6 text-center">
          <StaggeredSectionHeading
            className="font-display text-4xl font-semibold leading-[1.15] tracking-tight md:text-5xl"
            lines={[
              "Meet Calrix",
              "Your On-Demand Email & Calendar",
              "Copilot, Working Overnight",
            ]}
          />
        </div>
      </section>

      <div className="flex flex-col items-center" aria-hidden>
        <span className="h-1.5 w-1.5 rounded-full bg-accent" />
        <span className="h-20 w-px bg-border" />
        <span className="h-1.5 w-1.5 rounded-full bg-accent" />
      </div>

      <section className="bg-background py-16 md:py-20">
        <div className="mx-auto w-full max-w-5xl px-6">
          <div className="rounded-[2rem] bg-surface-warm-2 p-3 ring-1 ring-black/5">
            <div className="grid gap-3 sm:grid-cols-2">
              <Reveal
                delay={0}
                className="group relative aspect-5/3 overflow-hidden rounded-[1.5rem]"
              >
                <div className="absolute inset-0 bg-[linear-gradient(135deg,#3f3a34_0%,#211d1a_55%,#100d0b_100%)]" />
                <button
                  type="button"
                  className="absolute bottom-5 left-5 flex items-center gap-2 rounded-full border border-white/20 bg-white/10 py-2 pl-2 pr-4 text-sm font-medium text-white shadow-lg shadow-black/20 backdrop-blur-md transition-all duration-300 ease-out hover:bg-white/20 group-hover:scale-105 active:scale-100"
                >
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-white text-black">
                    <svg
                      width="11"
                      height="11"
                      viewBox="0 0 16 16"
                      fill="currentColor"
                    >
                      <path d="M4 2.5v11l9-5.5-9-5.5z" />
                    </svg>
                  </span>
                  Our Story
                </button>
              </Reveal>

              <Reveal
                delay={0.12}
                className="relative flex aspect-5/3 flex-col justify-between overflow-hidden rounded-[1.5rem] bg-[#171717] p-7 font-mono text-white"
              >
                <div className="flex items-center text-sm sm:text-base">
                  <TypewriterText />
                </div>
                <div className="text-sm sm:text-base">
                  <span className="text-accent">Bikash</span>
                  <span className="text-white/80"> — Creator of Calrix</span>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
