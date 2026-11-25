/**
 * Ilustrações da LP da Rook Health.
 *
 * POR QUE DESENHO E NÃO FOTO
 *
 * A página era só texto, e quem tem clínica lê pouco: precisa reconhecer o
 * problema olhando. Cada cartão de "onde o dinheiro escapa" ganha a cena que o
 * parágrafo descreve — a guia com a linha cortada, a agenda com buraco. São
 * SVG inline: pesam centenas de bytes, acompanham o tema claro/escuro pelas
 * variáveis de cor e não dependem de banco de imagem com "médico sorrindo".
 *
 * São DECORATIVAS (`aria-hidden`): o título e o texto do cartão já dizem tudo,
 * e nenhuma traz número — número aqui pareceria medição.
 *
 * MOVIMENTO (docs/design-v4.md): o repouso é o desenho completo. As classes
 * `lp-grow-bar`, `lp-dia` e `lp-spark` só animam quando o `<Reveal>` ancestral
 * recebe `lp-in`, e só com `prefers-reduced-motion: no-preference`. O
 * `transform-box: fill-box` que faz a barra crescer a partir da própria borda
 * (e não do canto do SVG) está no bloco ROOK HEALTH do globals.css.
 */
import type { CSSProperties } from "react";

const VERDE = "var(--health-accent-text)";
const OCRE = "#e79f4a";
const LINHA = "var(--color-border)";
const MUDO = "var(--color-text-muted)";
const PAPEL = "var(--color-bg-card)";

const atraso = (ms: number): CSSProperties => ({ animationDelay: `${ms}ms` });

function Moldura({ children }: { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 320 132"
      aria-hidden="true"
      focusable="false"
      className="mb-6 block h-auto w-full rounded-xl"
      style={{ backgroundColor: "var(--color-bg-elevated)" }}
    >
      {children}
    </svg>
  );
}

/** A guia do convênio: cinco linhas faturadas, uma delas cortada. */
function ArteGlosa() {
  const linhas = [34, 50, 66, 82, 98];
  return (
    <Moldura>
      <rect x="92" y="14" width="136" height="104" rx="8" fill={PAPEL} stroke={LINHA} />
      {linhas.map((y, i) => (
        <g key={y}>
          <rect x="106" y={y - 3} width={i === 2 ? 58 : 46 + ((i * 13) % 30)} height="6" rx="3" fill={LINHA} />
          <rect x="188" y={y - 3} width="26" height="6" rx="3" fill={i === 2 ? OCRE : VERDE} opacity={i === 2 ? 1 : 0.7} />
        </g>
      ))}
      {/* O corte: a faixa Ocre atravessa a linha glosada. */}
      <rect className="lp-grow-bar" style={atraso(500)} x="100" y="57" width="120" height="18" rx="4" fill={OCRE} opacity="0.22" />
      <rect className="lp-grow-bar" style={atraso(700)} x="100" y="65" width="120" height="2" fill={OCRE} />
      <circle className="lp-dia health-pulse" style={atraso(1100)} cx="242" cy="66" r="9" fill={OCRE} />
      <rect x="238" y="65" width="8" height="2" rx="1" fill="#10151c" />
    </Moldura>
  );
}

/** O repasse calculado sobre o agendado, com o recebido menor embaixo. */
function ArteRepasse() {
  return (
    <Moldura>
      {/* Agendado: cheio, e a fatia do médico tirada do cheio. */}
      <rect className="lp-grow-bar" x="40" y="34" width="240" height="22" rx="6" fill={LINHA} />
      <rect className="lp-grow-bar" style={atraso(250)} x="40" y="34" width="104" height="22" rx="6" fill={MUDO} opacity="0.75" />
      {/* Recebido: menor. A mesma fatia do médico agora é quase tudo. */}
      <rect className="lp-grow-bar" style={atraso(500)} x="40" y="78" width="176" height="22" rx="6" fill={VERDE} opacity="0.3" />
      <rect className="lp-grow-bar" style={atraso(750)} x="40" y="78" width="104" height="22" rx="6" fill={MUDO} opacity="0.75" />
      {/* O que faltou entrar. */}
      <rect
        className="health-pulse"
        x="218"
        y="78"
        width="62"
        height="22"
        rx="6"
        fill="none"
        stroke={OCRE}
        strokeWidth="1.5"
        strokeDasharray="4 4"
      />
      <path d="M144 60 V74" stroke={MUDO} strokeWidth="1.5" strokeDasharray="2 3" />
    </Moldura>
  );
}

/** A semana na agenda: turnos atendidos e os buracos. */
function ArteFalta() {
  const vazios = new Set(["1-1", "3-0", "4-2", "2-3"]);
  const celulas = [];
  for (let dia = 0; dia < 5; dia++) {
    for (let hora = 0; hora < 4; hora++) {
      const vazio = vazios.has(`${dia}-${hora}`);
      celulas.push(
        <rect
          key={`${dia}-${hora}`}
          className={vazio ? "health-pulse" : "lp-dia"}
          style={vazio ? undefined : atraso((dia * 4 + hora) * 45)}
          x={62 + dia * 41}
          y={20 + hora * 25}
          width="33"
          height="18"
          rx="5"
          fill={vazio ? "none" : VERDE}
          opacity={vazio ? 1 : 0.32 + ((dia + hora) % 3) * 0.18}
          stroke={vazio ? OCRE : "none"}
          strokeWidth="1.5"
          strokeDasharray={vazio ? "4 3" : undefined}
        />,
      );
    }
  }
  return <Moldura>{celulas}</Moldura>;
}

/** Duas tabelas, o mesmo procedimento: preço (contorno) e custo (preenchido). */
function ArteTabela() {
  const base = 112;
  const colunas = [
    { x: 84, preco: 82, cor: VERDE },
    { x: 180, preco: 48, cor: OCRE },
  ];
  const custo = 40;
  return (
    <Moldura>
      <path d={`M48 ${base} H272`} stroke={LINHA} strokeWidth="1.5" />
      {colunas.map((c, i) => (
        <g key={c.x}>
          <rect
            className="health-grow-up"
            style={atraso(i * 300)}
            x={c.x}
            y={base - c.preco}
            width="56"
            height={c.preco}
            rx="6"
            fill={c.cor}
            opacity="0.28"
          />
          <rect
            className="health-grow-up"
            style={atraso(i * 300 + 200)}
            x={c.x}
            y={base - custo}
            width="56"
            height={custo}
            rx="6"
            fill={MUDO}
            opacity="0.7"
          />
          {/* A margem: o pedaço do preço acima do custo. */}
          <rect x={c.x + 64} y={base - c.preco} width="3" height={c.preco - custo} rx="1.5" fill={c.cor} />
        </g>
      ))}
      <path d={`M48 ${base - custo} H272`} stroke={MUDO} strokeWidth="1" strokeDasharray="3 4" />
    </Moldura>
  );
}

const ARTES = { glosa: ArteGlosa, repasse: ArteRepasse, falta: ArteFalta, tabela: ArteTabela } as const;

export function HealthLeakArt({ art }: { art: keyof typeof ARTES }) {
  const Arte = ARTES[art];
  return <Arte />;
}

/** Ícones dos três passos de "como funciona". Traço, 40 px. */
const ICONES = {
  // Guia conferida.
  conferido: (
    <>
      <rect x="9" y="5" width="22" height="30" rx="4" />
      <path d="M14 14h12M14 20h7" />
      <path d="m15 27 4 4 8-9" stroke={VERDE} />
    </>
  ),
  // O recebido dividido entre profissional e clínica.
  repasse: (
    <>
      <circle cx="20" cy="20" r="14" />
      <path d="M20 6v14l10 10" stroke={VERDE} />
    </>
  ),
  // Agenda virando caixa.
  agenda: (
    <>
      <rect x="6" y="9" width="28" height="25" rx="4" />
      <path d="M6 17h28M13 5v8M27 5v8" />
      <path d="M14 29v-4M20 29v-8M26 29v-6" stroke={VERDE} />
    </>
  ),
} as const;

export function HealthStepIcon({ icon }: { icon: keyof typeof ICONES }) {
  return (
    <svg
      viewBox="0 0 40 40"
      width="40"
      height="40"
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="var(--color-text-primary)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {ICONES[icon]}
    </svg>
  );
}

/**
 * O balão do WhatsApp com a mensagem que o botão abre.
 *
 * Mostra o que acontece depois do clique: a pessoa não precisa escrever nada.
 * O texto é o MESMO que vai no link (`HEALTH_WHATSAPP_MESSAGE`), passado por
 * quem chama — desenhar aqui uma frase diferente da enviada seria prometer uma
 * coisa e fazer outra.
 */
export function HealthMessageBubble({ legenda, mensagem }: { legenda: string; mensagem: string }) {
  return (
    <figure className="m-0 max-w-sm">
      <figcaption className="section-label mb-3">{legenda}</figcaption>
      <blockquote
        className="health-bubble relative m-0 rounded-2xl rounded-br-sm px-5 py-4 text-[15px] leading-relaxed"
        style={{ backgroundColor: "#d9fdd3", color: "#10151c" }}
      >
        {mensagem}
        <span aria-hidden="true" className="mt-1 block text-right font-mono text-[11px]" style={{ color: "#5b6b63" }}>
          agora ✓✓
        </span>
      </blockquote>
    </figure>
  );
}
