import { HeroSection } from "@/components/sections/Hero";
import { ProblemSection } from "@/components/sections/Problem";
import { HowItWorksSection } from "@/components/sections/HowItWorks";
import { ChessSection } from "@/components/sections/Chess";
import { PlansPreview } from "@/components/sections/PlansPreview";
import { FaqSection } from "@/components/sections/Faq";
import { CtaSection } from "@/components/sections/Cta";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ProblemSection />
      <HowItWorksSection />
      <ChessSection />
      <PlansPreview />
      <FaqSection />
      <CtaSection />
    </>
  );
}
