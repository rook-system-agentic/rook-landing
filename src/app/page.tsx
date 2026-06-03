import { HeroSection } from '@/components/sections/Hero'
import { ProblemSection } from '@/components/sections/Problem'
import { ManifestoSection } from '@/components/sections/Manifesto'
import { HowItWorksSection } from '@/components/sections/HowItWorks'
import { PdfDemoSection } from '@/components/sections/PdfDemo'
import { ChessSection } from '@/components/sections/Chess'
import { PlansPreview } from '@/components/sections/PlansPreview'
import { FaqSection } from '@/components/sections/Faq'
import { CtaSection } from '@/components/sections/Cta'

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ProblemSection />
      <ManifestoSection />
      <HowItWorksSection />
      <PdfDemoSection />
      <ChessSection />
      <PlansPreview />
      <FaqSection />
      <CtaSection />
    </>
  )
}
