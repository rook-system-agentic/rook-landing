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
 * 4. "Sair da tela" desconta o banner de cookies. Antes, o CTA do hero
 *    escondido ATRÁS do banner contava como visível e a barra não aparecia:
 *    em telas de 360x640 e 390x605 (área útil do navegador do Instagram) a
 *    primeira tela ficava sem nenhum CTA principal à vista (diagnóstico de
 *    15/11/2026). Agora a área observada termina no topo do banner e o CTA só
 *    conta como visível com pelo menos 3/4 da altura à mostra.
 */

const HERO_VISIBLE_RATIO = 0.75;

function cookieBannerHeight(root: HTMLElement): number {
  const value = Number.parseFloat(getComputedStyle(root).getPropertyValue("--rook-cookie-height"));
  return Number.isFinite(value) && value > 0 ? Math.round(value) : 0;
}

export default function Bf1AccessHost({ stickyBar = true, accessLead }: { stickyBar?: boolean; accessLead: string }) {
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
    const heroRow = document.getElementById(BF1_HERO_CTA_ID);
    // Observa o botão principal, não a linha inteira (que inclui "Quem é a Rook").
    const hero = heroRow?.firstElementChild ?? heroRow;
    const final = document.getElementById(BF1_FINAL_CTA_ID);
    if (!hero || typeof IntersectionObserver === "undefined") return;
    const heroTarget: Element = hero;
    const root = document.documentElement;
    const seen = { hero: true, final: false };
    let observer: IntersectionObserver | null = null;
    let inset = -1;

    function observe() {
      const next = cookieBannerHeight(root);
      if (next === inset) return;
      inset = next;
      observer?.disconnect();
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.target === heroTarget) seen.hero = entry.isIntersecting && entry.intersectionRatio >= HERO_VISIBLE_RATIO;
            if (entry.target === final) seen.final = entry.isIntersecting || entry.boundingClientRect.top < 0;
          }
          setShowBar(!seen.hero && !seen.final);
        },
        { rootMargin: `0px 0px ${-inset}px 0px`, threshold: [0, HERO_VISIBLE_RATIO, 1] },
      );
      observer.observe(heroTarget);
      if (final) observer.observe(final);
    }

    observe();
    // O banner publica a altura em `--rook-cookie-height` (style do <html>) e a
    // remove ao fechar: refaz a observação quando esse valor muda.
    const watcher = typeof MutationObserver === "undefined" ? null : new MutationObserver(observe);
    watcher?.observe(root, { attributes: true, attributeFilter: ["style"] });
    return () => {
      watcher?.disconnect();
      observer?.disconnect();
    };
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
      {open ? <Bf1AccessDialog href={link.href} lead={accessLead} onClose={() => setOpen(false)} /> : null}
    </>
  );
}
