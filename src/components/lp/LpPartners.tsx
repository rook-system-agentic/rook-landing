import Image from "next/image";
import { PARTNERS_SECTION } from "@/lib/lp-content";
import { AVAILABLE_INTEGRATIONS, UPCOMING_INTEGRATIONS, type Integration } from "@/lib/integration-catalog.mjs";
import LpIntegrationRequest from "./LpIntegrationRequest";

function PartnerPlate({ partner }: { partner: Integration }) {
  return (
    <li>
      <div className="lp-partner-plate">
        {partner.logo ? (
          <Image src={partner.logo} alt={partner.name} width={partner.w} height={partner.h}
            className="max-h-9 w-auto max-w-full object-contain" />
        ) : (
          <span className="font-display text-xl font-bold tracking-tight text-[#1a1a1a]">{partner.name}</span>
        )}
      </div>
      <p className="mt-2 text-center text-sm leading-snug" style={{ color: "var(--lp-muted)" }}>
        {partner.detail}
      </p>
    </li>
  );
}

export default function LpPartners() {
  return (
    <section className="py-20 lg:py-28" style={{ borderTop: "1px solid var(--lp-line)" }} aria-labelledby="partners-title">
      <div className="mx-auto max-w-7xl px-6">
        <p className="lp-label mb-4">{PARTNERS_SECTION.label}</p>
        <h2 id="partners-title" className="mb-5 font-display font-extrabold"
          style={{ color: "var(--lp-ink)", fontSize: "clamp(2rem, 4.2vw, 3.4rem)", lineHeight: 1.05, letterSpacing: "-0.03em" }}>
          {PARTNERS_SECTION.headlinePlain}<span style={{ color: "var(--color-terracota-text)" }}>{PARTNERS_SECTION.headlineEmphasis}</span>
        </h2>
        <p className="lp-body max-w-3xl">{PARTNERS_SECTION.intro}</p>

        <h3 id="integracoes-disponiveis" className="mb-4 mt-10 font-display text-xl font-semibold text-cream">{PARTNERS_SECTION.availableTitle}</h3>
        <ul aria-labelledby="integracoes-disponiveis" className="grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 md:gap-x-4 lg:grid-cols-5">
          {AVAILABLE_INTEGRATIONS.map((partner) => <PartnerPlate key={partner.name} partner={partner} />)}
        </ul>

        <div className="mt-8 border-t pt-7" style={{ borderColor: "var(--lp-line)" }}>
          <h3 id="integracoes-em-preparacao" className="mb-4 font-display text-xl font-semibold text-cream">{PARTNERS_SECTION.upcomingTitle}</h3>
          <ul aria-labelledby="integracoes-em-preparacao" className="grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 md:gap-x-4 lg:grid-cols-5">
            {UPCOMING_INTEGRATIONS.map((partner) => <PartnerPlate key={partner.id} partner={partner} />)}
          </ul>
          <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">
            <p className="text-sm" style={{ color: "var(--lp-muted)" }}>{PARTNERS_SECTION.upcomingBody}</p>
            <LpIntegrationRequest label={PARTNERS_SECTION.ctaLabel} />
          </div>
        </div>
      </div>
    </section>
  );
}
