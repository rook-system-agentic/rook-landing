import Image from "next/image";
import { INTEGRATIONS } from "@/lib/integration-catalog.mjs";
import { PARTNERS_SECTION } from "@/lib/lp-content";
import LpIntegrationRequest from "./LpIntegrationRequest";

export default function LpPartners() {
  return (
    <section className="lp-partners py-20 lg:py-28" aria-labelledby="partners-title"
      style={{ borderTop: "1px solid var(--lp-line)" }}>
      <div className="mx-auto max-w-7xl px-6">
        <div className="max-w-3xl">
          <p className="lp-label mb-4">{PARTNERS_SECTION.label}</p>
          <h2 id="partners-title" className="mb-5 font-display font-extrabold"
            style={{ color: "var(--lp-ink)", fontSize: "clamp(2rem, 4.2vw, 3.4rem)", lineHeight: 1.05, letterSpacing: "-0.03em" }}>
            {PARTNERS_SECTION.headlinePlain}<span style={{ color: "var(--color-terracota-text)" }}>{PARTNERS_SECTION.headlineEmphasis}</span>
          </h2>
          <p className="lp-body mb-6">{PARTNERS_SECTION.intro}</p>
          <div className="flex items-center gap-3">
            <LpIntegrationRequest label={PARTNERS_SECTION.ctaLabel} />
            <label className="lp-marquee-control" title={PARTNERS_SECTION.motionLabel}>
              <input type="checkbox" className="lp-marquee-pause sr-only" aria-controls="partners-marquee" />
              <span className="sr-only">{PARTNERS_SECTION.motionLabel}</span>
              <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path className="lp-pause-icon" d="M4 3h3v10H4zm5 0h3v10H9z" />
                <path className="lp-play-icon" d="M5 3v10l8-5z" />
              </svg>
            </label>
          </div>
        </div>
      </div>

      <div id="partners-marquee" className="lp-marquee mt-16" role="region" aria-label={PARTNERS_SECTION.marqueeLabel} tabIndex={0}>
        {[0, 1, 2].map((copy) => (
          <ul key={copy} className="lp-marquee-track" aria-hidden={copy === 0 ? undefined : true}>
            {INTEGRATIONS.map((brand) => (
              <li key={brand.name}>
                <div className="lp-partner-plate">
                  <Image src={brand.logo} alt={brand.name} width={brand.w} height={brand.h}
                    className="max-h-9 w-auto max-w-[116px] object-contain" />
                </div>
                <p className="lp-label mt-3 text-center">{brand.category}</p>
              </li>
            ))}
          </ul>
        ))}
      </div>
    </section>
  );
}
