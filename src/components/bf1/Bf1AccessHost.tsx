"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import {
  BF1_ACCESS_ANCHOR,
  BF1_FINAL_CTA_ID,
  BF1_HERO_CTA_ID,
  BF1_TRACKING_DESTINATION,
  communityLink,
} from "@/lib/bf1-community.mjs";
import { track, TRACKING_EVENTS } from "@/lib/track";
import Bf1CommunityCta from "./Bf1CommunityCta";
import { hasBf1Access } from "./bf1-access-storage";
import styles from "./bf1.module.css";

// O formulário só carrega quando alguém clica: a /bl1 não paga o JS dele no
// primeiro acesso.
const Bf1AccessDialog = dynamic(() => import("./Bf1AccessDialog"), { ssr: false });

/*
 * Host único do cadastro da /bl1 (ROO-1876).
 *
 * 1. Qualquer link para `BF1_ACCESS_ANCHOR` (CTAs da página, cabeçalho e barra
 *    fixa) abre o formulário. Quem já se cadastrou neste aparelho vai direto ao
 *    grupo, como na ROO-1848.
 * 2. Toque antes da hidratação: o navegador só trocou o hash. Ao montar, o host
 *    lê o hash, limpa (mantendo as UTMs) e abre o formulário.
 * 3. Barra fixa no celular: aparece quando o CTA do hero sai da tela e some
 *    quando o CTA final aparece (ou já passou), para não cobrir o rodapé.
 *    Fica acima do banner de cookies (`--rook-cookie-height`).
 */

export default function Bf1AccessHost({ stickyBar = true }: { stickyBar?: boolean }) {
  const link = communityLink();
  const [open, setOpen] = useState(false);
  const [showBar, setShowBar] = useState(false);

  useEffect(() => {
    if (!link.ready) return;
    const invite = link.href;

    function start() {
      track(TRACKING_EVENTS.ctaClick, { destination: BF1_TRACKING_DESTINATION });
      if (hasBf1Access()) {
        window.location.assign(invite);
        return;
      }
      setOpen(true);
    }

    function onClick(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target instanceof Element ? event.target.closest(`a[href="${BF1_ACCESS_ANCHOR}"]`) : null;
      if (!target) return;
      event.preventDefault();
      start();
    }

    document.addEventListener("click", onClick, true);
    if (window.location.hash === BF1_ACCESS_ANCHOR) {
      window.history.replaceState(window.history.state, "", window.location.pathname + window.location.search);
      start();
    }
    return () => document.removeEventListener("click", onClick, true);
  }, [link.ready, link.href]);

  useEffect(() => {
    if (!stickyBar) return;
    const hero = document.getElementById(BF1_HERO_CTA_ID);
    const final = document.getElementById(BF1_FINAL_CTA_ID);
    if (!hero || typeof IntersectionObserver === "undefined") return;
    const seen = { hero: true, final: false };
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === hero) seen.hero = entry.isIntersecting;
        if (entry.target === final) seen.final = entry.isIntersecting || entry.boundingClientRect.top < 0;
      }
      setShowBar(!seen.hero && !seen.final);
    });
    observer.observe(hero);
    if (final) observer.observe(final);
    return () => observer.disconnect();
  }, [stickyBar]);

  if (!link.ready) return null;
  const barVisible = showBar && !open;

  return (
    <>
      {stickyBar ? (
        <div className={`${styles.stickyBar} ${barVisible ? styles.stickyBarVisible : ""}`} aria-hidden={!barVisible}>
          <Bf1CommunityCta className={styles.stickyCta} tabIndex={barVisible ? undefined : -1} />
        </div>
      ) : null}
      {open ? <Bf1AccessDialog href={link.href} onClose={() => setOpen(false)} /> : null}
    </>
  );
}
