import assert from "node:assert/strict";
import test from "node:test";
import {
  LP_EXPERIMENT_COOKIE,
  LP_EXPERIMENT_ID,
  allocateVariant,
  buildAsaflowFormUrl,
  lerVarianteDoCookie,
  parseAssistedPercent,
  parseExperimentCookie,
  serializeExperimentCookie,
} from "../src/lib/lp-experiment.mjs";

test("porcentagem invalida ou ausente desliga a variante B", () => {
  for (const bruto of [undefined, null, "", "abc", "-5", "101", "50.5", " "]) {
    assert.equal(parseAssistedPercent(bruto), 0, `${JSON.stringify(bruto)} deveria virar 0`);
  }
  assert.equal(parseAssistedPercent("0"), 0);
  assert.equal(parseAssistedPercent("10"), 10);
  assert.equal(parseAssistedPercent(" 50 "), 50);
  assert.equal(parseAssistedPercent("100"), 100);
});

test("cookie serializa e volta com o id do experimento", () => {
  const valor = serializeExperimentCookie("assisted");
  assert.equal(valor, `${LP_EXPERIMENT_ID}:assisted`);
  assert.deepEqual(parseExperimentCookie(valor), { experimentId: LP_EXPERIMENT_ID, variant: "assisted" });
});

test("cookie de outro experimento, variante desconhecida ou lixo e ignorado", () => {
  assert.equal(parseExperimentCookie("lp_asaflow_v0:assisted"), null);
  assert.equal(parseExperimentCookie(`${LP_EXPERIMENT_ID}:vip`), null);
  assert.equal(parseExperimentCookie(""), null);
  assert.equal(parseExperimentCookie(undefined), null);
  assert.equal(parseExperimentCookie("assisted"), null);
});

test("serializar variante desconhecida lanca — nunca grava cookie invalido", () => {
  assert.throws(() => serializeExperimentCookie("vip"), /vip/);
});

test("porcentagem 0 e o kill switch: devolve direct mesmo com cookie assisted", () => {
  const r = allocateVariant({ existing: `${LP_EXPERIMENT_ID}:assisted`, assistedPercent: 0, random: () => 0 });
  assert.deepEqual(r, { variant: "direct", source: "desligado" });
});

test("cookie valido e mantido — o visitante nao troca de variante", () => {
  assert.deepEqual(
    allocateVariant({ existing: `${LP_EXPERIMENT_ID}:assisted`, assistedPercent: 10, random: () => 0.99 }),
    { variant: "assisted", source: "cookie" },
  );
  assert.deepEqual(
    allocateVariant({ existing: `${LP_EXPERIMENT_ID}:direct`, assistedPercent: 100, random: () => 0 }),
    { variant: "direct", source: "cookie" },
  );
});

test("sem cookie, sorteia pela porcentagem", () => {
  assert.equal(allocateVariant({ existing: null, assistedPercent: 10, random: () => 0.05 }).variant, "assisted");
  assert.equal(allocateVariant({ existing: null, assistedPercent: 10, random: () => 0.10 }).variant, "direct");
  assert.equal(allocateVariant({ existing: null, assistedPercent: 50, random: () => 0.499 }).variant, "assisted");
  assert.equal(allocateVariant({ existing: null, assistedPercent: 50, random: () => 0.5 }).variant, "direct");
  assert.equal(allocateVariant({ existing: null, assistedPercent: 100, random: () => 0.999 }).variant, "assisted");
  assert.equal(allocateVariant({ existing: null, assistedPercent: 10, random: () => 0.5 }).source, "sorteio");
});

test("variante forcada por querystring vence cookie e sorteio, mas nao o kill switch", () => {
  assert.deepEqual(
    allocateVariant({ existing: `${LP_EXPERIMENT_ID}:direct`, assistedPercent: 10, random: () => 0.99, forced: "assisted" }),
    { variant: "assisted", source: "forcada" },
  );
  assert.deepEqual(
    allocateVariant({ existing: null, assistedPercent: 0, random: () => 0, forced: "assisted" }),
    { variant: "direct", source: "desligado" },
  );
  // valor forcado desconhecido e ignorado
  assert.equal(allocateVariant({ existing: null, assistedPercent: 10, random: () => 0.5, forced: "vip" }).source, "sorteio");
});

test("le a variante a partir de um header/document.cookie", () => {
  assert.equal(lerVarianteDoCookie(`a=1; ${LP_EXPERIMENT_COOKIE}=${LP_EXPERIMENT_ID}:assisted; b=2`), "assisted");
  assert.equal(lerVarianteDoCookie(`${LP_EXPERIMENT_COOKIE}=${LP_EXPERIMENT_ID}:direct`), "direct");
  assert.equal(lerVarianteDoCookie("a=1"), null);
  assert.equal(lerVarianteDoCookie(""), null);
  assert.equal(lerVarianteDoCookie(undefined), null);
  // outro cookie com o nome como sufixo nao casa
  assert.equal(lerVarianteDoCookie(`x_${LP_EXPERIMENT_COOKIE}=${LP_EXPERIMENT_ID}:assisted`), null);
});

test("a URL do formulario carrega UTMs, landing, referrer e variante — e nada mais", () => {
  const url = new URL(
    buildAsaflowFormUrl("https://forms.asaflow.com.br/f/abc?embed=1", {
      currentHref: "https://www.rook.com.br/planos/?utm_source=google&utm_medium=cpc&utm_campaign=cmv&utm_content=x&utm_term=y&gclid=123&email=a@b.com",
      referrer: "https://www.google.com/",
      variant: "assisted",
    }),
  );
  assert.equal(url.origin + url.pathname, "https://forms.asaflow.com.br/f/abc");
  assert.equal(url.searchParams.get("embed"), "1");
  assert.equal(url.searchParams.get("utm_source"), "google");
  assert.equal(url.searchParams.get("utm_medium"), "cpc");
  assert.equal(url.searchParams.get("utm_campaign"), "cmv");
  assert.equal(url.searchParams.get("utm_content"), "x");
  assert.equal(url.searchParams.get("utm_term"), "y");
  assert.equal(url.searchParams.get("landing_url"), "https://www.rook.com.br/planos/");
  assert.equal(url.searchParams.get("referrer"), "https://www.google.com/");
  assert.equal(url.searchParams.get("experiment_id"), LP_EXPERIMENT_ID);
  assert.equal(url.searchParams.get("variant"), "assisted");
  assert.equal(url.searchParams.get("gclid"), null);
  assert.equal(url.searchParams.get("email"), null);
});

test("a URL do formulario nao quebra sem UTMs nem referrer", () => {
  const url = new URL(
    buildAsaflowFormUrl("https://forms.asaflow.com.br/f/abc", {
      currentHref: "https://www.rook.com.br/planos/",
      referrer: "",
      variant: "assisted",
    }),
  );
  assert.equal(url.searchParams.has("utm_source"), false);
  assert.equal(url.searchParams.has("referrer"), false);
  assert.equal(url.searchParams.get("landing_url"), "https://www.rook.com.br/planos/");
});
