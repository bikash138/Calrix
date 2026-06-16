import Image from "next/image";
import DiagramSection from "./core/diagram-section";
import { SectionHeading, Reveal } from "./core/motion-primitives";
import CorsairButton from "./core/corsair-button";

export default function HowWeBuiltItSection() {
  return (
    <section id="how-we-built-it">
      <div
        id="fit-test"
        className="relative z-10 bg-background flex flex-col items-center px-6 pt-16 pb-16 text-center"
      >
        <Image
          src="/icon.svg"
          alt="Calrix"
          width={48}
          height={48}
          className="mb-6 rounded-sm"
        />
        <SectionHeading className="mx-auto max-w-3xl font-display text-4xl font-bold leading-tight tracking-tight text-foreground md:text-5xl lg:text-6xl">
          See How We Built It.
        </SectionHeading>
        <Reveal delay={0.1}>
          <p className="mx-auto mt-6 max-w-xl text-base text-muted md:text-lg tracking-tighter">
            Calrix is powered by Corsair which provides seamless integrations.
            <br />
            Here&apos;s the exact pipeline we used to build it.
          </p>
        </Reveal>
        <Reveal delay={0.2} className="mt-8">
          <CorsairButton />
        </Reveal>
      </div>
      <DiagramSection />
    </section>
  );
}
