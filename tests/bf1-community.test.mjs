/**
 * LP de Black Friday `/bl1/` (ROO-1825).
 *
 * O que se protege: o único CTA da página. Um link que não é convite do
 * WhatsApp (vazio, `#`, um `wa.me` com telefone, um encurtador) nunca vira
 * botão clicável; e o evento de clique continua sem dado pessoal.
 */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  BF1_BLACK_FRIDAY_START,
  BF1_EARLY_ACCESS_START,
  BF1_COMMUNITY_URL,
  BF1_TRACKING_DESTINATION,
  communityLink,
  countdownParts,
} from "../src/lib/bf1-community.mjs";
import { buildTrackingEvent, TRACKING_EVENTS } from "../src/lib/tracking-events.mjs";

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("só convite do WhatsApp vira CTA clicável", () => {
  assert.deepEqual(communityLink(null), { ready: false, href: null });
  assert.deepEqual(communityLink(""), { ready: false, href: null });
  assert.deepEqual(communityLink("#"), { ready: false, href: null });
  assert.deepEqual(communityLink("https://wa.me/5511999999999"), { ready: false, href: null });
  assert.deepEqual(communityLink("http://chat.whatsapp.com/AbCdEfGhIjKlMnOpQrSt12"), { ready: false, href: null });
  assert.deepEqual(communityLink("https://chat.whatsapp.com/AbCdEfGhIjKlMnOpQrSt12?x=1"), { ready: false, href: null });
  assert.deepEqual(communityLink("https://chat.whatsapp.com.evil.com/AbCdEfGhIjKlMnOpQrSt12"), { ready: false, href: null });
  const convite = "https://chat.whatsapp.com/AbCdEfGhIjKlMnOpQrSt12";
  assert.deepEqual(communityLink(convite), { ready: true, href: convite });
});

test("o link configurado é nulo ou um convite válido", () => {
  if (BF1_COMMUNITY_URL === null) return;
  assert.equal(communityLink(BF1_COMMUNITY_URL).ready, true, `BF1_COMMUNITY_URL inválido: ${BF1_COMMUNITY_URL}`);
});

test("a Black Friday 2026 começa na sexta, 27/11, horário de Brasília", () => {
  const inicio = new Date(BF1_BLACK_FRIDAY_START);
  assert.equal(inicio.toISOString(), "2026-11-27T03:00:00.000Z");
  assert.equal(inicio.getUTCDay(), 5);
});

test("o acesso antecipado é quinta, 26/11, antes da abertura ao público", () => {
  const acesso = new Date(BF1_EARLY_ACCESS_START);
  assert.equal(acesso.toISOString(), "2026-11-26T03:00:00.000Z");
  assert.equal(acesso.getUTCDay(), 4);
  assert.ok(acesso.getTime() < Date.parse(BF1_BLACK_FRIDAY_START));
});

test("a contagem regressiva mira o acesso antecipado e encerra na data", () => {
  const alvo = Date.parse(BF1_EARLY_ACCESS_START);
  const umDiaEUmPouco = alvo - ((1 * 86400 + 2 * 3600 + 3 * 60 + 4) * 1000);
  assert.deepEqual(countdownParts(umDiaEUmPouco), { done: false, days: 1, hours: 2, minutes: 3, seconds: 4 });
  assert.equal(countdownParts(alvo).done, true);
  assert.equal(countdownParts(alvo + 1000).done, true);
  assert.equal(countdownParts(Number.NaN).done, true);
});

test("o clique no CTA é um cta_click com destino fixo e nada além", () => {
  assert.deepEqual(
    buildTrackingEvent(TRACKING_EVENTS.ctaClick, { destination: BF1_TRACKING_DESTINATION }),
    { event: "cta_click", destination: "bf1_whatsapp_community" },
  );
});

test("a página não escreve link do WhatsApp fora do módulo da comunidade", async () => {
  const arquivos = [
    "src/app/bl1/page.tsx",
    "src/lib/bf1-content.ts",
    "src/components/bf1/Bf1CommunityCta.tsx",
    "src/components/bf1/Bf1Countdown.tsx",
  ];
  for (const relativo of arquivos) {
    const fonte = await readFile(path.join(RAIZ, relativo), "utf8");
    assert.doesNotMatch(fonte, /chat\.whatsapp\.com|wa\.me\//, `${relativo} cita link do WhatsApp; use BF1_COMMUNITY_URL`);
  }
});

test("a /bl1 fica fora do sitemap e pede noindex", async () => {
  const sitemap = await readFile(path.join(RAIZ, "src/app/sitemap.ts"), "utf8");
  assert.doesNotMatch(sitemap, /\/bl1\//);
  const pagina = await readFile(path.join(RAIZ, "src/app/bl1/page.tsx"), "utf8");
  assert.match(pagina, /robots:\s*\{\s*index:\s*false,\s*follow:\s*true\s*\}/);
});
test("a mentoria tem tema definido e nenhuma regra inventada", async () => {
  const conteudo = await readFile(path.join(RAIZ, "src/lib/bf1-content.ts"), "utf8");
  // Tema definido pelo CEO em 09/11/2026: Planejamento Financeiro 2027.
  assert.match(conteudo, /Planejamento Financeiro 2027/);
  assert.match(conteudo, /a estratégia e o sistema/i);
  // Vagas, percentual de desconto e datas da mentoria são anunciados na comunidade, nunca na página.
  const textos = [...conteudo.matchAll(/"([^"\\]*)"/g)].map((m) => m[1]).join("\n");
  assert.doesNotMatch(textos, /\bvagas?\b|\d+\s?%|\bgr[aá]tis para os \d+/i);
});

// Textos da página, sem os comentários (os comentários citam as palavras banidas de propósito).
async function textosDaPagina() {
  const conteudo = await readFile(path.join(RAIZ, "src/lib/bf1-content.ts"), "utf8");
  const semComentarios = conteudo.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
  return [...semComentarios.matchAll(/"([^"\\]*)"/g)].map((m) => m[1]).join("\n");
}

test("a copy não promete lucro, não garante desconto e não convida a sair (feedback de 10/11)", async () => {
  const textos = await textosDaPagina();
  assert.doesNotMatch(textos, /\blucrar\b|\blucre\b|\bgarant|sai quando quiser|sair quando quiser|personalizada/i);
});

test("os R$ 925 milhões usam a frase do vídeo, nunca gerenciado ou administrado", async () => {
  const textos = await textosDaPagina();
  assert.match(textos, /atendeu empresas que somam R\$ 925 milhões de faturamento/);
  assert.doesNotMatch(textos, /gerenciad|administrad/i);
});

test("a comunidade tem valor próprio além da Black Friday e a data destaca o acesso antecipado", async () => {
  const textos = await textosDaPagina();
  assert.match(textos, /A comunidade fica\./);
  assert.match(textos, /Acesso antecipado · quinta, 26\/11/);
  assert.match(textos, /Abertura para o público: sexta, 27\/11/);
});
