/**
 * Benchmark de CMV por segmento — Benchmark Rook 2026.
 *
 * POR QUE ISTO EXISTE COMO MÓDULO PRÓPRIO (24/08/2026)
 *
 * A tabela nasceu dentro de `CmvCalculator.tsx`, que é `"use client"`. Enquanto
 * só a calculadora usava, tudo bem. A página de segmentos (`/restaurantes/`)
 * passou a citar os mesmos números — e havia duas saídas ruins:
 *
 *   1. Digitar os percentuais de novo na página. Duas listas do mesmo dado
 *      divergem no primeiro reajuste, e a página passa a dizer um número que a
 *      calculadora contradiz na tela seguinte.
 *   2. Importar de dentro do componente cliente. Funciona, mas arrasta a
 *      fronteira de cliente para uma página que é estática e não precisa de JS.
 *
 * Aqui os dados são `.mjs` puro, sem dependência: a calculadora importa, a
 * página importa, e `node --test` lê direto, sem passo de build — como manda o
 * padrão do repositório (ver CLAUDE.md).
 *
 * A FONTE é o Benchmark Rook 2026, exibido ao usuário na calculadora. Se algum
 * número mudar, muda aqui e os dois lugares acompanham.
 */

/**
 * @typedef {object} SegmentoCmv
 * @property {string} name Nome exibido ao usuário.
 * @property {string} slug Identificador estável — usado no seletor e nas âncoras.
 * @property {number} defaultCmvTarget CMV de referência do segmento, em % da receita.
 * @property {number} cmvMin Piso da faixa saudável, em %.
 * @property {number} cmvMax Teto da faixa saudável, em %.
 */

/** @type {readonly SegmentoCmv[]} */
export const segmentsData = [
  { name: "Restaurante à la carte - Tradicional", slug: "a_la_carte", defaultCmvTarget: 32.0, cmvMin: 30.9, cmvMax: 33.1 },
  { name: "Alta gastronomia (fine dining)", slug: "fine_dining", defaultCmvTarget: 27.5, cmvMin: 26.5, cmvMax: 28.5 },
  { name: "Comida Italiana", slug: "italiana", defaultCmvTarget: 33.0, cmvMin: 31.8, cmvMax: 34.2 },
  { name: "Comida Japonesa / Sushi", slug: "japonesa_sushi", defaultCmvTarget: 35.8, cmvMin: 34.5, cmvMax: 37.1 },
  { name: "Self-service / Comida a quilo", slug: "self_service_kilo", defaultCmvTarget: 36.6, cmvMin: 35.3, cmvMax: 37.9 },
  { name: "Pizzaria", slug: "pizzaria", defaultCmvTarget: 28.4, cmvMin: 27.4, cmvMax: 29.4 },
  { name: "Hamburgueria", slug: "hamburgueria", defaultCmvTarget: 31.7, cmvMin: 30.5, cmvMax: 32.8 },
  { name: "Lanchonete / Fast food", slug: "fast_food", defaultCmvTarget: 30.8, cmvMin: 29.6, cmvMax: 31.9 },
  { name: "Bar / Boteco", slug: "bar_boteco", defaultCmvTarget: 25.0, cmvMin: 24.1, cmvMax: 25.9 },
  { name: "Padaria / Cafeteria / Confeitaria", slug: "padaria_cafeteria", defaultCmvTarget: 34.8, cmvMin: 33.6, cmvMax: 36.1 },
  { name: "Delivery especializado", slug: "delivery_especializado", defaultCmvTarget: 30.3, cmvMin: 29.2, cmvMax: 31.4 },
];

/** Rótulo da fonte, exibido junto de qualquer número desta tabela. */
export const BENCHMARK_FONTE = "Benchmark Rook 2026";

/**
 * Busca um segmento pelo slug.
 *
 * Devolve `undefined` em vez de cair no primeiro item da lista: quem chama
 * decide o que fazer com o desconhecido, e um slug errado precisa aparecer como
 * erro, não como "à la carte" silencioso.
 *
 * @param {string} slug
 * @returns {SegmentoCmv | undefined}
 */
export function segmentoPorSlug(slug) {
  return segmentsData.find((s) => s.slug === slug);
}

/**
 * Formata um percentual no padrão brasileiro, com uma casa: `32,0%`.
 *
 * @param {number} pct
 * @returns {string}
 */
export function pctBr(pct) {
  return `${pct.toFixed(1).replace(".", ",")}%`;
}
