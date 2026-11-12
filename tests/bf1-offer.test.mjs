import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { buildBf1OfferPresentation } from "../src/lib/bf1-offer-presentation.mjs";
import { campaignCountdown, BF1_OFFER_END } from "../src/lib/bf1-community.mjs";
import { descricaoParaBuscador } from "../src/lib/planos-copy.mjs";

const at = (iso) => buildBf1OfferPresentation(Date.parse(iso));

test("antes de 26/11 em Brasília a apresentação não contém oferta nem link de contratação", () => {
  for (const iso of ["2026-11-12T12:00:00-03:00", "2026-11-26T02:59:59.999Z"]) {
    const value = at(iso);
    assert.deepEqual(value, { phase: "upcoming", offer: null, checkoutHref: null });
    assert.doesNotMatch(JSON.stringify(value), /49[,.]90/);
  }
  assert.equal(buildBf1OfferPresentation(Number.NaN).offer, null);
});

test("26/11 revela o primeiro ciclo, mas preserva acesso antecipado na comunidade", () => {
  for (const iso of ["2026-11-26T03:00:00.000Z", "2026-11-27T02:59:59.999Z"]) {
    const value = at(iso);
    assert.equal(value.phase, "early");
    assert.equal(value.checkoutHref, null);
    assert.match(value.offer.title, /R\$49,90/);
    assert.match(value.offer.period, /comunidade/);
    assert.match(value.offer.terms, /primeiro ciclo mensal completo/);
    assert.match(value.offer.terms, /segundo mês/);
    assert.match(value.offer.terms, /faixa de faturamento/);
    assert.match(value.offer.terms, /por estabelecimento, nos planos Knight ou Rook/);
    assert.match(value.offer.terms, /Chess é cobrado à parte/);
    assert.match(value.offer.payment, /após a confirmação do pagamento/);
    assert.match(value.offer.payment, /até 04\/12, às 23h59/);
    assert.match(value.offer.payment, /reserva vale por até uma hora/);
  }
});

test("a contratação pública abre em 27/11 e permanece até o último milissegundo de 04/12", () => {
  for (const iso of ["2026-11-27T03:00:00.000Z", "2026-12-05T02:59:59.999Z"]) {
    const value = at(iso);
    assert.equal(value.phase, "public");
    assert.equal(value.checkoutHref, "https://app.rook.com.br/contratar");
    assert.match(value.offer.period, /04\/12, às 23h59, horário de Brasília/);
  }
});

test("em 05/12 não existe promessa de preço promocional nem CTA da oferta", () => {
  assert.equal(BF1_OFFER_END, "2026-12-05T00:00:00-03:00");
  for (const iso of ["2026-12-05T03:00:00.000Z", "2027-01-01T00:00:00Z"]) {
    const value = at(iso);
    assert.deepEqual(value, { phase: "ended", offer: null, checkoutHref: null });
    assert.doesNotMatch(JSON.stringify(value), /49[,.]90/);
    assert.equal(campaignCountdown(Date.parse(iso)).done, true);
  }
});

test("durante a Black a contagem aponta para o encerramento, não para abertura passada", () => {
  const countdown = campaignCountdown(Date.parse("2026-12-04T23:00:00-03:00"));
  assert.equal(countdown.phase, "public");
  assert.equal(countdown.done, false);
  assert.equal(countdown.hours, 1);
  assert.equal(countdown.days, 0);
});

test("preço futuro fica no servidor e a rota não congela uma fase no build", async () => {
  const root = new URL("../", import.meta.url);
  const server = await readFile(new URL("src/lib/bf1-campaign-server.ts", root), "utf8");
  const page = await readFile(new URL("src/app/bl1/page.tsx", root), "utf8");
  assert.match(server, /import "server-only"/);
  assert.match(page, /export const dynamic = "force-dynamic"/);
  for (const file of ["src/lib/bf1-content.ts", "src/lib/bf1-community.mjs", "src/components/bf1/Bf1Countdown.tsx", "src/components/bf1/Bf1CommunityCta.tsx"]) {
    const source = await readFile(new URL(file, root), "utf8");
    assert.doesNotMatch(source, /49[,.]90|bf1-offer-presentation/);
  }
});

test("aquisição não volta a prometer trial mesmo recebendo duração antiga", () => {
  assert.doesNotMatch(descricaoParaBuscador("knight", 7), /teste|grátis/);
  assert.doesNotMatch(descricaoParaBuscador("rook", 7), /teste|grátis/);
});
