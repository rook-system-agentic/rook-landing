import Link from "next/link";
import { ACQUISITION_CTA } from "@/lib/lp-content";
// Mantém a posição da oferta na home; a solicitação substitui os preços públicos.
export default function LpPricing() {
 return <section className="lp-band py-20 lg:py-28" aria-labelledby="capture-title" style={{borderTop:"1px solid var(--lp-line)"}}>
  <div className="mx-auto max-w-3xl px-6 text-center">
   <h2 id="capture-title" className="mb-6 font-display text-3xl font-extrabold lg:text-5xl">{ACQUISITION_CTA.title}</h2>
   <p className="lp-body mx-auto mb-8 text-center">{ACQUISITION_CTA.description}</p>
   <div className="flex flex-wrap justify-center gap-4"><Link href="/cadastro/" className="btn-primary">{ACQUISITION_CTA.formLabel}</Link><Link href="/assistente/" className="btn-ghost">{ACQUISITION_CTA.chatLabel}</Link></div>
  </div>
 </section>;
}
