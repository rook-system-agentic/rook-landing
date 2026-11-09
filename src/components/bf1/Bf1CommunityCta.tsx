"use client";

import { BF1_TRACKING_DESTINATION, communityLink } from "@/lib/bf1-community.mjs";
import { BF1_CONTENT } from "@/lib/bf1-content";
import { track, TRACKING_EVENTS } from "@/lib/track";
import styles from "./bf1.module.css";

/*
 * O único CTA da /bl1 (ROO-1825).
 *
 * Sem convite configurado, o botão vira um aviso não clicável: anunciar a
 * comunidade com um link para lugar nenhum custa a confiança do primeiro
 * clique. O link e a validação vivem em `bf1-community.mjs`.
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

export default function Bf1CommunityCta() {
  const link = communityLink();
  const { label, pendingLabel } = BF1_CONTENT.cta;

  if (!link.ready) {
    return (
      <span className={`${styles.cta} ${styles.ctaPending}`} aria-disabled="true">
        <ChatIcon />
        <span>{pendingLabel}</span>
      </span>
    );
  }

  return (
    <a
      href={link.href}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.cta}
      onClick={() => track(TRACKING_EVENTS.ctaClick, { destination: BF1_TRACKING_DESTINATION })}
    >
      <ChatIcon />
      <span>{label}</span>
      <span className={styles.ctaArrow}>
        <ArrowIcon />
      </span>
    </a>
  );
}
