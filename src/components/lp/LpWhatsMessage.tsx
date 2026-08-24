import type { BriefingMessage } from "@/lib/lp-content";

/*
 * Paleta fixa do painel escuro (mesma do extrato em LpSources): o mock do
 * WhatsApp é escuro nos dois temas, como no preview aprovado.
 */
export const PANEL = {
  bg: "#10151c",
  line: "rgba(255, 255, 255, 0.1)",
  inset: "rgba(255, 255, 255, 0.06)",
  ink: "#eef3f8",
  muted: "#9fb0bf",
  accent: "#ff8345",
  action: "#6fcf97",
};

/**
 * Uma mensagem do informe, encenada como bolha de WhatsApp.
 *
 * Vive num arquivo próprio desde a v6 porque passou a aparecer em dois lugares
 * — o informe diário no hero, o semanal na seção do briefing. Dois desenhos
 * separados sairiam do lugar no primeiro ajuste de um deles.
 *
 * Mock estático: o "botão" da mensagem é texto estilizado de propósito. Um
 * <button> de verdade num mock seria um elemento focável que não faz nada.
 */
export function WhatsMessage({ message }: { message: BriefingMessage }) {
  return (
    <article className="rounded-xl p-4" style={{ backgroundColor: PANEL.inset }}>
      <div className="mb-3 flex items-baseline justify-between gap-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em]" style={{ color: PANEL.accent }}>
          Rook
        </p>
        <p className="font-mono text-[10px] uppercase tracking-wider" style={{ color: PANEL.muted }}>
          {message.time}
        </p>
      </div>
      <div className="space-y-1.5">
        {message.lines.map((l) => (
          <p
            key={l}
            className={`text-sm leading-relaxed ${l.includes("R$") ? "font-mono" : ""}`}
            style={{ color: l.includes("R$") ? PANEL.ink : PANEL.muted }}
          >
            {l}
          </p>
        ))}
      </div>
      <p
        className="mt-3 rounded-lg py-2 text-center text-sm font-semibold"
        style={{ backgroundColor: "rgba(255, 255, 255, 0.08)", color: PANEL.action }}
      >
        {message.button}
      </p>
    </article>
  );
}

/** O painel que emoldura as mensagens, com o cabeçalho do contato. */
export function WhatsPanel({
  contactName,
  contactNumber,
  children,
}: {
  contactName: string;
  contactNumber: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="space-y-3 rounded-2xl p-4 sm:p-5"
      style={{ backgroundColor: PANEL.bg, border: `1px solid ${PANEL.line}` }}
    >
      <div
        className="flex items-baseline justify-between gap-4 pb-3"
        style={{ borderBottom: `1px solid ${PANEL.line}` }}
      >
        <p className="text-sm font-bold" style={{ color: PANEL.ink }}>
          {contactName}
        </p>
        <p className="font-mono text-xs" style={{ color: PANEL.muted }}>
          {contactNumber}
        </p>
      </div>
      {children}
    </div>
  );
}
