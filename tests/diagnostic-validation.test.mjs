/**
 * Validação do lead do diagnóstico (incidente de 24/08/2026).
 *
 * O fluxo gravava direto do navegador na REST do Supabase, com chave embutida
 * de outro projeto: 401 em toda submissão, sem checagem de `response.ok`, e
 * portanto 17 dias de lead perdido em silêncio. A gravação passou para
 * `/api/diagnostics`; esta suíte cobre a borda que essa rota usa.
 *
 * O que se protege aqui é o contrato do registro que vai ao banco — o que entra,
 * o que é recusado, e o que o servidor decide por conta própria.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { validarDiagnostico } from "../src/lib/diagnostic-validation.mjs";

const COMPLETO = {
  restaurant_name: "Casa exemplo",
  responsible_name: "Maria",
  email: "maria@exemplo.com.br",
  phone: "(61) 99999-9999",
  segment: "a_la_carte",
  city: "Brasília",
  state: "DF",
  tax_regime: "simples",
  tax_rate: 6,
  monthly_revenue: 120000,
  cmo_mode: "valor",
  cmo_value: 30000,
  sales_expenses: 5000,
  general_expenses: 8000,
  partner_withdrawal: 4000,
  cmv_percent: 34,
  total_fixed_costs: 47000,
  contribution_margin: 0.6,
  breakeven_point: 78333,
  revenue_gap: 41667,
  ab_variant: "B",
};

test("aceita um lead completo e devolve o registro", () => {
  const r = validarDiagnostico(COMPLETO);
  assert.equal(r.ok, true);
  assert.equal(r.registro.restaurant_name, "Casa exemplo");
  assert.equal(r.registro.monthly_revenue, 120000);
});

test("o servidor carimba source e status — não o cliente", () => {
  const r = validarDiagnostico({ ...COMPLETO, source: "outra_coisa", status: "fechado" });
  assert.equal(r.ok, true);
  assert.equal(r.registro.source, "lp_diagnostico");
  assert.equal(r.registro.status, "apresentado");
});

test("campo desconhecido é descartado, não repassado ao banco", () => {
  // Uma chave inventada viraria erro de coluna inexistente no PostgREST — e o
  // formato do registro deixaria de ser nosso.
  const r = validarDiagnostico({ ...COMPLETO, coluna_inventada: "x", drop_table: 1 });
  assert.equal(r.ok, true);
  assert.equal("coluna_inventada" in r.registro, false);
  assert.equal("drop_table" in r.registro, false);
});

test("recusa sem nome do restaurante — a coluna é NOT NULL e o lead seria inútil", () => {
  for (const valor of [undefined, "", "   "]) {
    const r = validarDiagnostico({ ...COMPLETO, restaurant_name: valor });
    assert.equal(r.ok, false, `deveria recusar restaurant_name = ${JSON.stringify(valor)}`);
    assert.deepEqual(r.erros, ["restaurant_name"]);
  }
});

test("recusa corpo que não é objeto", () => {
  for (const corpo of [null, undefined, "texto", 42, ["a"]]) {
    assert.equal(validarDiagnostico(corpo).ok, false);
  }
});

test("número inválido é omitido em vez de virar NaN no banco", () => {
  const r = validarDiagnostico({ ...COMPLETO, monthly_revenue: "abc", cmv_percent: Infinity });
  assert.equal(r.ok, true);
  assert.equal("monthly_revenue" in r.registro, false);
  assert.equal("cmv_percent" in r.registro, false);
});

test("número em texto é aceito — o formulário manda string", () => {
  const r = validarDiagnostico({ ...COMPLETO, monthly_revenue: "120000" });
  assert.equal(r.ok, true);
  assert.equal(r.registro.monthly_revenue, 120000);
});

test("texto é aparado e truncado", () => {
  const r = validarDiagnostico({ ...COMPLETO, city: "  Brasília  ", notes_ignorado: "x" });
  assert.equal(r.registro.city, "Brasília");

  const longo = validarDiagnostico({ ...COMPLETO, restaurant_name: "a".repeat(500) });
  assert.equal(longo.ok, true);
  assert.equal(longo.registro.restaurant_name.length, 320);
});

test("campo de texto vazio não vira string vazia no banco", () => {
  const r = validarDiagnostico({ ...COMPLETO, city: "", state: "   " });
  assert.equal("city" in r.registro, false);
  assert.equal("state" in r.registro, false);
});
