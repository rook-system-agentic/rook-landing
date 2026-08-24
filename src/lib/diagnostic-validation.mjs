/**
 * Validação do lead do diagnóstico, antes de gravar.
 *
 * POR QUE ISTO EXISTE (24/08/2026)
 *
 * Até aqui o navegador montava o registro e o enviava direto à REST do
 * Supabase: nada validava, nada normalizava, e o que chegasse ao banco chegava.
 * Com a gravação migrando para uma rota de servidor (`/api/diagnostics`), a
 * borda passa a ser um lugar só — e é aqui.
 *
 * O que esta função faz, e por quê:
 *
 *   - RECUSA o que não dá para atender: sem nome do restaurante não há lead que
 *     a equipe consiga usar, e a coluna é NOT NULL no banco. Recusar com 422 é
 *     melhor que gravar lixo ou estourar 502 lá na frente.
 *   - IGNORA campo desconhecido em vez de repassar. Um `select *` do payload
 *     faria qualquer chave inventada virar erro de coluna inexistente — e, pior,
 *     deixaria a forma do registro depender do que o cliente resolvesse mandar.
 *   - FIXA `source` e `status` no servidor. São classificação nossa, não dado do
 *     visitante: quem chega por esta rota veio da LP, ponto.
 *
 * Dependência zero, `.mjs` puro: `node --test` roda direto, sem passo de build,
 * como o resto da lógica testável do repositório (ver CLAUDE.md).
 */

/** Colunas de texto aceitas, exatamente como existem em `onboarding_diagnostics`. */
const TEXTO = [
  "restaurant_name",
  "responsible_name",
  "email",
  "phone",
  "segment",
  "city",
  "state",
  "tax_regime",
  "cmo_mode",
  "ab_variant",
];

/** Colunas numéricas aceitas. */
const NUMERO = [
  "tax_rate",
  "monthly_revenue",
  "cmo_value",
  "employees_count",
  "sales_expenses",
  "general_expenses",
  "partner_withdrawal",
  "cmv_percent",
  "total_fixed_costs",
  "contribution_margin",
  "breakeven_point",
  "revenue_gap",
];

const LIMITE_TEXTO = 320;

function textoLimpo(valor) {
  if (typeof valor !== "string") return null;
  const limpo = valor.trim().slice(0, LIMITE_TEXTO);
  return limpo === "" ? null : limpo;
}

function numeroFinito(valor) {
  if (valor === null || valor === undefined || valor === "") return null;
  const n = typeof valor === "number" ? valor : Number(valor);
  return Number.isFinite(n) ? n : null;
}

/**
 * @param {unknown} corpo
 * @returns {{ok: true, registro: Record<string, unknown>} | {ok: false, erros: string[]}}
 */
export function validarDiagnostico(corpo) {
  if (!corpo || typeof corpo !== "object" || Array.isArray(corpo)) {
    return { ok: false, erros: ["corpo"] };
  }

  const entrada = /** @type {Record<string, unknown>} */ (corpo);
  const registro = {};

  for (const campo of TEXTO) {
    const v = textoLimpo(entrada[campo]);
    if (v !== null) registro[campo] = v;
  }

  for (const campo of NUMERO) {
    const v = numeroFinito(entrada[campo]);
    if (v !== null) registro[campo] = v;
  }

  if (!registro.restaurant_name) {
    return { ok: false, erros: ["restaurant_name"] };
  }

  // Classificação nossa, não do cliente. Ver o cabeçalho.
  registro.source = "lp_diagnostico";
  registro.status = "apresentado";

  return { ok: true, registro };
}
