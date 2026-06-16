import Navbar from "@/components/landing/navbar";
import Separator from "@/components/landing/core/separator";
import HeroSection from "@/components/landing/hero-section";
import OurStorySection from "@/components/landing/our-story-section";
import WorkflowSection from "@/components/landing/workflow-section";
import ComparisonSection from "@/components/landing/comparison-section";
import PricingSection from "@/components/landing/pricing-section";
import HowWeBuiltItSection from "@/components/landing/how-we-built-it-section";
import FooterSection from "@/components/landing/footer-section";

export default function Home() {
  return (
    <div
      id="top"
      data-landing
      className="flex flex-1 flex-col bg-background text-foreground"
    >
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <Separator />
        <OurStorySection />
        <Separator />
        <WorkflowSection />
        <Separator />
        <ComparisonSection />
        <Separator />
        <PricingSection />
        <Separator />
      </main>
      <HowWeBuiltItSection />
      <FooterSection />
    </div>
  );
}
