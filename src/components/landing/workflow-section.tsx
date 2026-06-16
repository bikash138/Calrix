import WorkflowTabs from "./core/workflow-tabs";
import { SectionHeading } from "./core/motion-primitives";

export default function WorkflowSection() {
  return (
    <section id="features" className="bg-background py-16 md:py-20">
      <SectionHeading className="mb-12 text-center font-display text-4xl font-bold tracking-tight md:text-5xl">
        Your workflow, Not Ours
      </SectionHeading>
      <WorkflowTabs />
    </section>
  );
}
