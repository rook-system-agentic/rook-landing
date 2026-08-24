import Link from "next/link";
import Image from "next/image";
import { AUTHORITY } from "@/lib/lp-content";
import Reveal from "./LpReveal";

/**
 * Quem está por trás.
 *
 * Por que existe (v6): a home inteira não tinha um nome nem um rosto. A
 * autoridade aparecia numa linha solta do método — "quem vive controladoria há
 * duas décadas" — sem dizer quem. Restaurante é setor que decide por
 * indicação; autoridade anônima não transfere confiança.
 *
 * Por que não é depoimento: não há cliente referenciável para citar hoje
 * (Gabriel, 24/08/2026). Enquanto não houver, a prova humana possível é a
 * história de quem construiu — que é verdadeira, é a mesma que a /sobre conta,
 * e já estava escrita.
 *
 * O RETRATO é opcional de propósito: a seção entrega a história com ou sem
 * foto, e o bloco da pessoa só aparece quando `AUTHORITY.person` tiver nome e
 * arquivo. Um rosto de banco de imagem aqui destruiria exatamente a confiança
 * que a seção existe para construir — melhor sem foto do que com foto falsa.
 * Preencher `person` em `lp-content.ts` liga o bloco sozinho.
 */
export default function LpAuthority() {
  const { person } = AUTHORITY;
  const temRetrato = person.name !== "" && person.photo !== "";

  return (
    <section className="lp-band py-20 lg:py-28" style={{ borderTop: "1px solid var(--lp-line)" }}>
      {/* Sem retrato o grid de 12 colunas deixaria cinco vazias à direita — o
          texto assume a largura de leitura e a seção fecha sozinha. Com o
          retrato, volta a ser duas colunas. */}
      <div
        className={`mx-auto items-center gap-12 px-6 ${
          temRetrato ? "grid max-w-7xl lg:grid-cols-12" : "max-w-3xl"
        }`}
      >
        <div className={temRetrato ? "lg:col-span-7" : undefined}>
          <p className="lp-label mb-4">{AUTHORITY.label}</p>
          <h2
            className="mb-6 font-display font-extrabold"
            style={{
              color: "var(--lp-ink)",
              fontSize: "clamp(2rem, 4.2vw, 3.4rem)",
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
            }}
          >
            {AUTHORITY.headlinePlain}
            <span style={{ color: "#e54c00" }}>{AUTHORITY.headlineEmphasis}</span>
          </h2>
          <div className="mb-8 space-y-4">
            {AUTHORITY.paragraphs.map((p) => (
              <p key={p.slice(0, 24)} className="lp-body">
                {p}
              </p>
            ))}
          </div>
          <Link href={AUTHORITY.ctaHref} className="btn-ghost">
            {AUTHORITY.ctaLabel}
          </Link>
        </div>

        {temRetrato ? (
          <Reveal className="lg:col-span-5">
            <figure className="lp-card flex flex-col gap-4 p-6">
              <Image
                src={person.photo}
                alt={person.name}
                width={480}
                height={480}
                className="w-full rounded-xl object-cover"
              />
              <figcaption>
                <p className="font-display text-lg font-bold" style={{ color: "var(--lp-ink)" }}>
                  {person.name}
                </p>
                <p className="font-mono text-xs uppercase tracking-wider" style={{ color: "var(--lp-muted)" }}>
                  {person.role}
                </p>
              </figcaption>
            </figure>
          </Reveal>
        ) : null}
      </div>
    </section>
  );
}
