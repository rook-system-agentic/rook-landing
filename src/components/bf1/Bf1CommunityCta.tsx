import { BF1_ACCESS_ANCHOR, communityLink } from "@/lib/bf1-community.mjs";
import { BF1_CONTENT } from "@/lib/bf1-content";
import styles from "./bf1.module.css";

/*
 * CTA da /bl1 (ROO-1825).
 *
 * Sem convite configurado, o botão vira um aviso não clicável: anunciar a
 * comunidade com um link para lugar nenhum custa a confiança do primeiro
 * clique. O link e a validação vivem em `bf1-community.mjs`.
 *
 * ROO-1876: o href é a âncora do cadastro, nunca o convite. Antes, o href era o
 * convite e o JavaScript interceptava o clique; um toque antes da hidratação
 * (4G lento, navegador do Instagram) levava direto ao grupo, sem cadastro. Agora
 * o componente é estático e um único host (Bf1AccessHost) abre o formulário,
 * para qualquer CTA da página, do cabeçalho e da barra fixa.
 */

function ChatIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M20 11.5a8 8 0 0 1-11.8 7L4 20l1.5-4.1A8 8 0 1 1 20 11.5Z" />
      <path d="M9 10.5h6M9 13.5h3.5" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export default function Bf1CommunityCta({ className = "", tabIndex }: { className?: string; tabIndex?: number }) {
  const link = communityLink();
  const { label, pendingLabel } = BF1_CONTENT.cta;

  if (!link.ready) {
    return (
      <span className={`${styles.cta} ${styles.ctaPending} ${className}`} aria-disabled="true">
        <ChatIcon />
        <span>{pendingLabel}</span>
      </span>
    );
  }

  return (
    <a href={BF1_ACCESS_ANCHOR} className={`${styles.cta} ${className}`} tabIndex={tabIndex} aria-haspopup="dialog">
      <ChatIcon />
      <span>{label}</span>
      <span className={styles.ctaArrow}>
        <ArrowIcon />
      </span>
    </a>
  );
}
