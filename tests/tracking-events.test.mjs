import assert from "node:assert/strict";
import test from "node:test";
import {
  TRACKING_EVENTS,
  buildTrackingEvent,
  pushTrackingEvent,
  resolveAppHandoff,
  resolvePageType,
} from "../src/lib/tracking-events.mjs";

test("monta o evento de lead com o plano de interesse", () => {
  assert.deepEqual(buildTrackingEvent(TRACKING_EVENTS.lead, { plano: "rook" }), {
    event: "generate_lead",
    plano: "rook",
  });
});

test("monta o evento de diagnostico com a variante do teste A/B", () => {
  assert.deepEqual(
    buildTrackingEvent(TRACKING_EVENTS.diagnostic, { ab_variant: "B" }),
    { event: "diagnostic_complete", ab_variant: "B" },
  );
});

test("recusa qualquer campo fora da allowlist", () => {
  assert.throws(
    () => buildTrackingEvent(TRACKING_EVENTS.lead, { plano: "rook", email: "a@b.com" }),
    /email/,
  );
});

test("recusa dado pessoal mesmo quando e o unico campo", () => {
  for (const campo of ["email", "phone", "cnpj", "name", "monthly_revenue"]) {
    assert.throws(
      () => buildTrackingEvent(TRACKING_EVENTS.diagnostic, { [campo]: "x" }),
      new RegExp(campo),
      `${campo} deveria ser recusado`,
    );
  }
});

test("recusa evento desconhecido", () => {
  assert.throws(() => buildTrackingEvent("purchase", {}), /purchase/);
});

test("resolve o tipo de pagina a partir do pathname", () => {
  assert.equal(resolvePageType("/"), "home");
  assert.equal(resolvePageType("/planos/"), "planos");
  assert.equal(resolvePageType("/blog/"), "blog");
  assert.equal(resolvePageType("/blog/como-calcular-cmv/"), "blog");
  assert.equal(resolvePageType("/diagnostico/"), "diagnostico");
  assert.equal(resolvePageType("/calculadora-cmv/"), "calculadora");
  assert.equal(resolvePageType("/privacidade/"), "institucional");
});

test("resolve o tipo de pagina exige fronteira de segmento, nao prefixo textual solto", () => {
  assert.equal(resolvePageType("/planos-antigos"), "institucional");
  assert.equal(resolvePageType("/planos-antigos/"), "institucional");
  assert.equal(resolvePageType("/blogueiro"), "institucional");
  assert.equal(resolvePageType("/diagnostico-financeiro"), "institucional");
  assert.equal(resolvePageType("/calculadora-cmv-antiga"), "institucional");
  // com fronteira, continua casando
  assert.equal(resolvePageType("/planos"), "planos");
  assert.equal(resolvePageType("/planos/assinatura"), "planos");
});

test("nao empurra nada quando o rastreamento esta desligado", () => {
  const target = {};
  const enviado = pushTrackingEvent(TRACKING_EVENTS.newsletter, {}, {
    enabled: false,
    target,
  });
  assert.equal(enviado, false);
  assert.equal(target.dataLayer, undefined);
});

test("empurra para o dataLayer quando o rastreamento esta ligado", () => {
  const target = {};
  const enviado = pushTrackingEvent(TRACKING_EVENTS.appHandoff, { destino: "contratar" }, {
    enabled: true,
    target,
  });
  assert.equal(enviado, true);
  assert.deepEqual(target.dataLayer, [{ event: "app_handoff", destino: "contratar" }]);
});

test("resolve saida para o app: checkout direto vira contratar", () => {
  assert.equal(
    resolveAppHandoff(
      "https://app.rook.com.br/contratar?revenue_band=knight",
      "https://rook.com.br/planos/",
    ),
    "contratar",
  );
});

test("resolve saida para o app: link de entrar vira login", () => {
  assert.equal(
    resolveAppHandoff("https://app.rook.com.br/login", "https://rook.com.br/"),
    "login",
  );
});

test("nao resolve saida para o app quando o host e diferente", () => {
  assert.equal(
    resolveAppHandoff("https://www.rook.com.br/planos", "https://rook.com.br/"),
    null,
  );
});

test("nao resolve saida para o app com href relativo", () => {
  assert.equal(resolveAppHandoff("/planos", "https://rook.com.br/"), null);
});

test("nao resolve saida para o app com href vazio", () => {
  assert.equal(resolveAppHandoff("", "https://rook.com.br/"), null);
  assert.equal(resolveAppHandoff(null, "https://rook.com.br/"), null);
  assert.equal(resolveAppHandoff(undefined, "https://rook.com.br/"), null);
});

test("nao lanca excecao e retorna null para href malformado", () => {
  assert.doesNotThrow(() => resolveAppHandoff("http://", "https://rook.com.br/planos/"));
  assert.equal(resolveAppHandoff("http://", "https://rook.com.br/planos/"), null);
});

test("resolve saida para o app exige fronteira de segmento em /contratar", () => {
  assert.equal(
    resolveAppHandoff("https://app.rook.com.br/contratar-consultoria", "https://rook.com.br/"),
    "login",
  );
  assert.equal(
    resolveAppHandoff("https://app.rook.com.br/contratar/knight", "https://rook.com.br/"),
    "contratar",
  );
  assert.equal(
    resolveAppHandoff("https://app.rook.com.br/contratar/", "https://rook.com.br/"),
    "contratar",
  );
});

// ── Experimento da LP (ROO-1207) ─────────────────────────────────────────────

test("os eventos do experimento aceitam so as dimensoes do funil", () => {
  const dims = { experiment_id: "lp_asaflow_v1", variant: "assisted" };
  assert.deepEqual(
    buildTrackingEvent(TRACKING_EVENTS.experimentExposure, { ...dims, page_type: "planos" }),
    { event: "experiment_exposure", ...dims, page_type: "planos" },
  );
  assert.deepEqual(
    buildTrackingEvent(TRACKING_EVENTS.ctaClick, { ...dims, destination: "chat", plan: "knight" }),
    { event: "cta_click", ...dims, destination: "chat", plan: "knight" },
  );
  assert.deepEqual(
    buildTrackingEvent(TRACKING_EVENTS.chatOpen, { ...dims, page_type: "planos" }),
    { event: "chat_open", ...dims, page_type: "planos" },
  );
  assert.deepEqual(
    buildTrackingEvent(TRACKING_EVENTS.formView, { ...dims, page_type: "planos" }),
    { event: "form_view", ...dims, page_type: "planos" },
  );
  assert.deepEqual(
    buildTrackingEvent(TRACKING_EVENTS.integrationError, { ...dims, component: "asaflow_widget", error_code: "timeout" }),
    { event: "integration_error", ...dims, component: "asaflow_widget", error_code: "timeout" },
  );
});

test("lead e saida para o app aceitam as dimensoes do experimento, e continuam aceitando sem elas", () => {
  const dims = { experiment_id: "lp_asaflow_v1", variant: "direct" };
  assert.deepEqual(
    buildTrackingEvent(TRACKING_EVENTS.lead, { plano: "chess", channel: "site_form", ...dims }),
    { event: "generate_lead", plano: "chess", channel: "site_form", ...dims },
  );
  assert.deepEqual(
    buildTrackingEvent(TRACKING_EVENTS.appHandoff, { destino: "contratar", ...dims }),
    { event: "app_handoff", destino: "contratar", ...dims },
  );
  assert.deepEqual(buildTrackingEvent(TRACKING_EVENTS.lead, { plano: "rook" }), {
    event: "generate_lead",
    plano: "rook",
  });
});

test("os eventos do experimento recusam dado pessoal e texto livre", () => {
  for (const evento of [
    TRACKING_EVENTS.experimentExposure,
    TRACKING_EVENTS.ctaClick,
    TRACKING_EVENTS.chatOpen,
    TRACKING_EVENTS.formView,
    TRACKING_EVENTS.integrationError,
  ]) {
    for (const campo of ["email", "phone", "cnpj", "name", "message", "utm_term"]) {
      assert.throws(
        () => buildTrackingEvent(evento, { experiment_id: "lp_asaflow_v1", variant: "assisted", [campo]: "x" }),
        new RegExp(campo),
        `${evento} deveria recusar ${campo}`,
      );
    }
  }
});
