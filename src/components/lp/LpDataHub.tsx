import { HERO_HUB } from "@/lib/lp-content";
import { PANEL } from "./LpWhatsMessage";

/**
 * A Central de Dados do hero (v7): as fontes que entram sozinhas e o
 * contador de lançamentos digitados, que é zero.
 *
 * POR QUE ESTA PEÇA, E NÃO O INFORME DO WHATSAPP
 *
 * O informe é template de restaurante e continua na página, no briefing. O
 * hero agora fala com qualquer segmento, e a única coisa que vale para todos
 * é a conexão: banco, nota e folha toda empresa tem. A peça mostra isso e
 * nada mais — nenhum gráfico de CMV, nenhum número que só um restaurante
 * reconheceria.
 *
 * Usa a mesma paleta escura do painel do WhatsApp (PANEL) para o hero não
 * mudar de cara; e, pela regra 1 do `docs/design-v4.md`, não há nada aqui que
 * dependa de animação para aparecer.
 */
export default function LpDataHub() {
  return (
    <div
      className="rounded-2xl p-4 sm:p-5"
      style={{ backgroundColor: PANEL.bg, border: `1px solid ${PANEL.line}` }}
    >
      <div
        className="flex items-baseline justify-between gap-4 pb-3"
        style={{ borderBottom: `1px solid ${PANEL.line}` }}
      >
        <p className="text-sm font-bold" style={{ color: PANEL.ink }}>
          {HERO_HUB.title}
        </p>
        <p className="font-mono text-xs" style={{ color: PANEL.muted }}>
          {HERO_HUB.period}
        </p>
      </div>

      <ul className="mt-3 space-y-2">
        {HERO_HUB.fontes.map((f) => (
          <li
            key={f.fonte}
            className="flex items-center justify-between gap-3 rounded-xl px-4 py-3"
            style={{ backgroundColor: PANEL.inset }}
          >
            <div className="min-w-0">
              <p className="text-sm font-semibold" style={{ color: PANEL.ink }}>
                {f.fonte}
              </p>
              <p className="font-mono text-[11px] leading-snug" style={{ color: PANEL.muted }}>
                {f.via} · {f.entrega}
              </p>
            </div>
            <p
              className="flex shrink-0 items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider"
              style={{ color: PANEL.action }}
            >
              <span
                aria-hidden="true"
                className="inline-block h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: PANEL.action }}
              />
              {HERO_HUB.status}
            </p>
          </li>
        ))}
      </ul>

      <div className="mt-3 grid grid-cols-2 gap-2">
        {[
          { label: HERO_HUB.digitadoLabel, value: HERO_HUB.digitadoValor },
          { label: HERO_HUB.classificadoLabel, value: HERO_HUB.classificadoValor },
        ].map((k) => (
          <div
            key={k.label}
            className="rounded-xl px-4 py-3"
            style={{ border: `1px solid ${PANEL.line}` }}
          >
            <p className="font-mono text-2xl font-bold" style={{ color: PANEL.accent }}>
              {k.value}
            </p>
            <p className="mt-0.5 text-xs leading-snug" style={{ color: PANEL.muted }}>
              {k.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
