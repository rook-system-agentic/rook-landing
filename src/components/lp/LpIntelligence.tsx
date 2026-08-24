import Link from "next/link";
import { INTELLIGENCE } from "@/lib/lp-content";
import Rich from "./LpRich";
import Reveal from "./LpReveal";

/*
 * Paleta fixa do painel escuro (mesma dos mocks de LpSources e LpBriefing):
 * o chat do Rook.AI é escuro nos dois temas, como no preview aprovado.
 *
 * `bolhaDono` e `bolhaRook` reproduzem o contraste do produto: a pergunta do
 * usuário sai em terracota cheio, a resposta do agente numa superfície quente e
 * discreta. Os dois tons carregam texto com folga — branco sobre #c24100 mede
 * 5,2:1, e #eef3f8 sobre #2a211c mede cerca de 13:1.
 */
const PANEL = {
  bg: "#10151c",
  line: "rgba(255, 255, 255, 0.1)",
  ink: "#eef3f8",
  muted: "#9fb0bf",
  accent: "#ff8345",
  bolhaDono: "#c24100",
  bolhaRook: "#2a211c",
  campo: "rgba(255, 255, 255, 0.04)",
};

/** O ícone do Rook.AI no produto — um brilho de quatro pontas, desenhado. */
function IconeRookAi() {
  return (
    <span
      aria-hidden="true"
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
      style={{ backgroundColor: "rgba(255, 131, 69, 0.16)" }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M12 2.5 L13.9 9.1 L20.5 11 L13.9 12.9 L12 19.5 L10.1 12.9 L3.5 11 L10.1 9.1 Z"
          fill={PANEL.accent}
        />
        <path
          d="M18.5 3 L19.3 5.7 L22 6.5 L19.3 7.3 L18.5 10 L17.7 7.3 L15 6.5 L17.7 5.7 Z"
          fill={PANEL.accent}
          opacity="0.7"
        />
      </svg>
    </span>
  );
}

/**
 * O consultor digital da casa — o Rook.AI encenado como o chat que ele é.
 *
 * v6.2 (24/08/2026): o mock anterior empilhava dois cartões rotulados
 * "ROOK.AI", cada um com a pergunta em negrito e a resposta embaixo. Dois
 * problemas, e o primeiro é factual:
 *
 *   1. A PERGUNTA É DO DONO, e levava a etiqueta do Rook.AI — a IA aparecia
 *      perguntando a si mesma.
 *   2. Não parecia o produto. O Rook.AI real é uma conversa: pergunta do
 *      usuário à direita, resposta do agente à esquerda, campo de digitação
 *      embaixo e o aviso de que a IA pode errar. Prometer na página algo com
 *      outra cara é preparar frustração no primeiro login.
 *
 * Continua sendo MOCK ESTÁTICO: o campo é uma div estilizada, não um <input>.
 * Um campo real aqui seria elemento focável que não faz nada — e prometeria uma
 * conversa que esta página não tem como sustentar.
 *
 * Os números seguem fechando com EXEMPLO_DRE: 2 pontos de CMV sobre R$ 412.800
 * são os R$ 8.256 citados. A conversa é da Casa exemplo — nada aqui é dado de
 * cliente real, e não deve virar.
 */
export default function LpIntelligence() {
  return (
    <section className="py-20 lg:py-28" style={{ borderTop: "1px solid var(--lp-line)" }}>
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-12">
        <Reveal className="lg:col-span-7 lg:order-first">
          <div className="rounded-2xl" style={{ backgroundColor: PANEL.bg, border: `1px solid ${PANEL.line}` }}>
            {/* Cabeçalho do app */}
            <div
              className="flex items-center gap-3 px-5 py-4"
              style={{ borderBottom: `1px solid ${PANEL.line}` }}
            >
              <IconeRookAi />
              <div>
                <p className="font-semibold leading-tight" style={{ color: PANEL.ink }}>
                  {INTELLIGENCE.appName}
                </p>
                <p className="text-xs leading-tight" style={{ color: PANEL.muted }}>
                  {INTELLIGENCE.appTagline}
                </p>
              </div>
            </div>

            {/* A conversa */}
            <div className="flex flex-col gap-3 px-5 py-5">
              <p
                className="mb-1 font-mono text-[10px] uppercase tracking-[0.18em]"
                style={{ color: PANEL.muted }}
              >
                {INTELLIGENCE.context}
              </p>

              {INTELLIGENCE.turnos.map((t, i) =>
                t.de === "dono" ? (
                  <p
                    key={i}
                    className="max-w-[85%] self-end rounded-2xl px-4 py-2.5 text-sm leading-relaxed"
                    style={{ backgroundColor: PANEL.bolhaDono, color: "#ffffff" }}
                  >
                    {t.texto}
                  </p>
                ) : (
                  <p
                    key={i}
                    className="max-w-[92%] self-start rounded-2xl px-4 py-3 text-sm leading-relaxed"
                    style={{ backgroundColor: PANEL.bolhaRook, color: PANEL.ink }}
                  >
                    {t.texto}
                  </p>
                ),
              )}
            </div>

            {/* Campo e aviso — estilizados, não funcionais. Ver o comentário acima. */}
            <div className="px-5 pb-5">
              <div
                className="flex items-center justify-between gap-3 rounded-xl px-4 py-3"
                style={{ backgroundColor: PANEL.campo, border: `1px solid ${PANEL.line}` }}
              >
                <span className="text-sm" style={{ color: PANEL.muted }}>
                  {INTELLIGENCE.inputPlaceholder}
                </span>
                <span
                  aria-hidden="true"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: PANEL.bolhaDono }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3.5 20.5 L21 12 L3.5 3.5 L3.5 10.2 L15 12 L3.5 13.8 Z" fill="#ffffff" />
                  </svg>
                </span>
              </div>
              <p className="mt-2.5 text-center text-[11px]" style={{ color: PANEL.muted }}>
                {INTELLIGENCE.disclaimer}
              </p>
            </div>
          </div>
        </Reveal>

        <div className="lg:col-span-5">
          <p className="lp-label mb-4">{INTELLIGENCE.label}</p>
          <h2
            className="mb-4 font-display font-extrabold"
            style={{
              color: "var(--lp-ink)",
              fontSize: "clamp(2rem, 4.2vw, 3.4rem)",
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
            }}
          >
            {INTELLIGENCE.headlinePlain}
            <span style={{ color: "#e54c00" }}>{INTELLIGENCE.headlineEmphasis}</span>
            {INTELLIGENCE.headlineTail}
          </h2>
          <p className="lp-body mb-6">{INTELLIGENCE.productParagraph}</p>
          <p
            className="mb-8 pt-5 text-[15px] leading-relaxed"
            style={{ borderTop: "1px solid var(--lp-line)", color: "var(--lp-muted)" }}
          >
            <Rich paragraph={INTELLIGENCE.payoff} />
          </p>
          <Link href={INTELLIGENCE.ctaHref} className="btn-primary">
            {INTELLIGENCE.ctaLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}
